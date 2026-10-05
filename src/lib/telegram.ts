import { getSettings } from './settingsServer';
import { readSubscriptionData } from './subscriptionServer';
import { TicketOrder, STATUS_MAP } from './types';
import { GroupBuyItem, GroupBuyParticipant } from './types';
import { cleanWhatsAppDigits } from './settings';

function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatCFA(amount: number): string {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
}

interface SendTelegramOptions {
  replyMarkup?: any;
  tokenOverride?: string;
  chatIdOverride?: string;
  forceSend?: boolean;
}

/**
 * Envoie un message HTML vers le Bot Telegram configuré
 */
export async function sendTelegramMessage(text: string, options: SendTelegramOptions = {}) {
  try {
    const settings = getSettings();
    const token = options.tokenOverride || settings.telegram?.botToken;
    const chatId = options.chatIdOverride || settings.telegram?.chatId;
    const isEnabled = (options.forceSend || options.tokenOverride || options.chatIdOverride) 
      ? true 
      : (settings.telegram?.enabled ?? false);

    if (!isEnabled) {
      return { success: false, skipped: true, error: 'Notifications Telegram désactivées' };
    }

    if (!token || !token.trim() || !chatId || !chatId.trim()) {
      return { success: false, skipped: true, error: 'Token ou Chat ID Telegram manquant' };
    }

    const payload: Record<string, any> = {
      chat_id: chatId.trim(),
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: false,
    };

    if (options.replyMarkup) {
      payload.reply_markup = options.replyMarkup;
    }

    const res = await fetch(`https://api.telegram.org/bot${token.trim()}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (data.ok) {
      return { success: true, messageId: data.result.message_id };
    } else {
      console.error('Erreur API Telegram sendMessage:', data);
      return { success: false, error: data.description || 'Erreur Telegram' };
    }
  } catch (error: any) {
    console.error('Exception lors de l\'envoi Telegram:', error);
    return { success: false, error: error.message || 'Erreur réseau Telegram' };
  }
}

/**
 * Teste la validité du Token Bot Telegram et envoie un message de test au Chat ID
 */
export async function testTelegramConnection(botToken: string, chatId: string) {
  try {
    const cleanToken = botToken.trim();
    const cleanChatId = chatId.trim();

    if (!cleanToken) {
      return { success: false, error: 'Veuillez saisir le Bot Token fourni par @BotFather.' };
    }
    if (!cleanChatId) {
      return { success: false, error: 'Veuillez saisir votre Chat ID.' };
    }

    // 1. Tester le Token avec getMe
    const meRes = await fetch(`https://api.telegram.org/bot${cleanToken}/getMe`);
    const meData = await meRes.json();

    if (!meData.ok) {
      return { 
        success: false, 
        error: `Bot Token invalide : ${meData.description || 'Vérifiez le token copié depuis @BotFather'}` 
      };
    }

    const botName = meData.result.first_name || 'Christaline Bot';
    const botUsername = meData.result.username || '';

    // 2. Envoyer un message de test au Chat ID
    const dateStr = new Date().toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const testMessage = `🤖 <b>TEST DE CONNEXION RÉUSSI !</b>\n\n`
      + `✅ Votre boutique <b>Christaline Shop Bénin</b> est bien connectée à Telegram.\n`
      + `🏷️ <b>Nom du Bot :</b> ${escapeHtml(botName)} (@${escapeHtml(botUsername)})\n`
      + `💬 <b>Chat ID :</b> <code>${escapeHtml(cleanChatId)}</code>\n`
      + `⏰ <b>Date & Heure :</b> ${dateStr}\n\n`
      + `🎉 <i>Vous recevrez désormais les alertes de commandes et de ventes groupées en temps réel ici !</i>`;

    const sendRes = await fetch(`https://api.telegram.org/bot${cleanToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: cleanChatId,
        text: testMessage,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🌸 Accéder à Christaline Shop', url: 'https://christalineshop.com' }
            ]
          ]
        }
      })
    });

    const sendData = await sendRes.json();
    if (!sendData.ok) {
      return {
        success: false,
        botName,
        botUsername,
        error: `Bot reconnu (@${botUsername}), mais impossible d'envoyer le message au Chat ID : ${sendData.description}. Avez-vous cliqué sur "Démarrer" dans le bot ou ajouté le bot au groupe ?`
      };
    }

    return {
      success: true,
      botName,
      botUsername,
      messageId: sendData.result.message_id
    };
  } catch (err: any) {
    return {
      success: false,
      error: `Erreur de connexion : ${err.message || 'Impossible de joindre les serveurs de Telegram'}`
    };
  }
}

/**
 * Notifie l'administrateur lors de la création d'un nouveau ticket client (précommande)
 */
export async function notifyNewTicketTelegram(ticket: TicketOrder, baseUrl: string = '') {
  try {
    const settings = getSettings();
    if (!settings.telegram?.enabled || !settings.telegram?.notifyNewOrders) {
      return;
    }

    const modeLabel = ticket.shippingMode === 'sea' 
      ? '🚢 Voie Maritime (2 à 3 mois)' 
      : '✈️ Voie Aérienne (Au plus 1 mois)';

    const itemsSummary = ticket.items.map((it, idx) => {
      const plt = escapeHtml(it.platform.toUpperCase());
      const name = escapeHtml(it.name || 'Article sans nom');
      const qty = it.quantity || 1;
      const url = it.url ? ` - <a href="${it.url}">Lien produit</a>` : '';
      return `  <b>${idx + 1}. [${plt}]</b> ${name} (Qté: <b>${qty}</b>)${url}`;
    }).join('\n');

    const cleanWa = cleanWhatsAppDigits(ticket.client.whatsapp || ticket.client.phone);
    const waLink = `https://wa.me/${cleanWa}?text=${encodeURIComponent(`Bonjour ${ticket.client.name}, Christaline Shop a bien reçu votre ticket ${ticket.id}.`)}`;
    const ticketUrl = baseUrl ? `${baseUrl}/ticket/${ticket.id}` : `https://christalineshop.com/ticket/${ticket.id}`;
    const adminUrl = baseUrl ? `${baseUrl}/admin` : `https://christalineshop.com/admin`;

    const message = `🎉 <b>NOUVELLE PRÉCOMMANDE REÇUE !</b>\n\n`
      + `🎫 <b>Ticket :</b> <code>#${ticket.id}</code>\n`
      + `👤 <b>Client :</b> <b>${escapeHtml(ticket.client.name)}</b>\n`
      + `📞 <b>Téléphone :</b> <code>${escapeHtml(ticket.client.phone)}</code>\n`
      + `💬 <b>WhatsApp :</b> <code>${escapeHtml(ticket.client.whatsapp || ticket.client.phone)}</code>\n`
      + `📍 <b>Ville :</b> ${escapeHtml(ticket.client.city)} (Bénin)\n`
      + `📦 <b>Mode Transit :</b> ${modeLabel}\n\n`
      + `🛒 <b>Articles demandés (${ticket.items.length}) :</b>\n`
      + `${itemsSummary}\n\n`
      + (ticket.client.notes ? `📝 <b>Note client :</b> <i>${escapeHtml(ticket.client.notes)}</i>\n\n` : '')
      + `💡 <i>Rendez-vous dans l'admin pour chiffrer le devis en FCFA et valider l'acompte.</i>`;

    const replyMarkup = {
      inline_keyboard: [
        [
          { text: '🔍 Voir le Ticket', url: ticketUrl },
          { text: '💬 WhatsApp Client', url: waLink }
        ],
        [
          { text: '⚙️ Espace Admin Christaline', url: adminUrl }
        ]
      ]
    };

    return await sendTelegramMessage(message, { replyMarkup });
  } catch (err) {
    console.error('Erreur notifyNewTicketTelegram:', err);
  }
}

/**
 * Notifie l'administrateur lors d'une nouvelle réservation à une Vente en Groupe
 */
export async function notifyGroupBuyJoinTelegram(
  groupBuy: GroupBuyItem, 
  participant: GroupBuyParticipant, 
  ticketId: string,
  baseUrl: string = ''
) {
  try {
    const settings = getSettings();
    if (!settings.telegram?.enabled || !settings.telegram?.notifyGroupBuys) {
      return;
    }

    const pct = groupBuy.minQuantity > 0 
      ? Math.round((groupBuy.currentQuantity / groupBuy.minQuantity) * 100) 
      : 100;

    const cleanWa = cleanWhatsAppDigits(participant.whatsapp);
    const waLink = `https://wa.me/${cleanWa}?text=${encodeURIComponent(`Bonjour ${participant.clientName}, votre réservation de vente en groupe pour ${groupBuy.title} (Ticket ${ticketId}) a bien été prise en compte.`)}`;
    const ticketUrl = baseUrl ? `${baseUrl}/ticket/${ticketId}` : `https://christalineshop.com/ticket/${ticketId}`;
    const groupBuyUrl = baseUrl ? `${baseUrl}/ventes-groupees` : `https://christalineshop.com/ventes-groupees`;

    const totalPrice = participant.quantity * groupBuy.priceCFA;
    const message = `🔥 <b>NOUVELLE RÉSERVATION VENTE EN GROUPE !</b>\n\n`
      + `🛍️ <b>Article :</b> <b>${escapeHtml(groupBuy.title)}</b>\n`
      + `🎫 <b>Ticket généré :</b> <code>#${ticketId}</code>\n`
      + `👤 <b>Participant :</b> <b>${escapeHtml(participant.clientName)}</b>\n`
      + `💬 <b>WhatsApp :</b> <code>${escapeHtml(participant.whatsapp)}</code>\n`
      + `📍 <b>Ville :</b> ${escapeHtml(participant.city)} (Bénin)\n`
      + `🔢 <b>Quantité réservée :</b> <b>${participant.quantity}</b>\n`
      + `💰 <b>Montant :</b> <b>${formatCFA(totalPrice)}</b>\n\n`
      + `📊 <b>Progression du groupe :</b> <b>${groupBuy.currentQuantity} / ${groupBuy.minQuantity}</b> réservés (<b>${pct}%</b>)\n`
      + `📅 <b>Date de commande :</b> ${escapeHtml(groupBuy.orderDate || 'Prochainement')}\n`
      + (participant.notes ? `📝 <b>Note :</b> <i>${escapeHtml(participant.notes)}</i>\n` : '');

    const replyMarkup = {
      inline_keyboard: [
        [
          { text: '🎫 Voir le Ticket', url: ticketUrl },
          { text: '💬 WhatsApp Client', url: waLink }
        ],
        [
          { text: '👥 Voir les Ventes en Groupe', url: groupBuyUrl }
        ]
      ]
    };

    return await sendTelegramMessage(message, { replyMarkup });
  } catch (err) {
    console.error('Erreur notifyGroupBuyJoinTelegram:', err);
  }
}

/**
 * Notifie lors de la mise à jour du devis ou du statut de livraison
 */
export async function notifyTicketStatusUpdateTelegram(
  ticket: TicketOrder, 
  previousStatus: string, 
  newStatus: string,
  baseUrl: string = ''
) {
  try {
    const settings = getSettings();
    if (!settings.telegram?.enabled || !settings.telegram?.notifyPayments) {
      return;
    }

    const statusLabel = (STATUS_MAP as any)[newStatus]?.label || newStatus;
    const prevLabel = (STATUS_MAP as any)[previousStatus]?.label || previousStatus;
    const ticketUrl = baseUrl ? `${baseUrl}/ticket/${ticket.id}` : `https://christalineshop.com/ticket/${ticket.id}`;

    const message = `📦 <b>MISE À JOUR DE COMMANDE / COLIS</b>\n\n`
      + `🎫 <b>Ticket :</b> <code>#${ticket.id}</code>\n`
      + `👤 <b>Client :</b> ${escapeHtml(ticket.client.name)} (${escapeHtml(ticket.client.phone)})\n`
      + `🔄 <b>Statut :</b> <s>${escapeHtml(prevLabel)}</s> ➡️ <b>${escapeHtml(statusLabel)}</b>\n`
      + `💰 <b>Montant Total :</b> ${formatCFA(ticket.quote.grandTotalCFA)}\n`
      + `💵 <b>Acompte réglé :</b> ${formatCFA(ticket.quote.depositPaidCFA)} / ${formatCFA(ticket.quote.depositRequiredCFA)}\n\n`
      + `🌐 <i>Le client peut consulter l'avancée de son colis en direct.</i>`;

    const replyMarkup = {
      inline_keyboard: [
        [
          { text: '🔍 Consulter la Fiche', url: ticketUrl }
        ]
      ]
    };

    return await sendTelegramMessage(message, { replyMarkup });
  } catch (err) {
    console.error('Erreur notifyTicketStatusUpdateTelegram:', err);
  }
}

/**
 * Notifie l'administrateur sur son Telegram avec son nouveau mot de passe mensuel généré
 */
export async function notifyNewAdminPasswordTelegram(params: {
  newPassword: string;
  expiresAt: string;
  amountCFA?: number;
  reference?: string;
  operator?: string;
  source?: 'feexpay' | 'super_admin' | 'manual';
  baseUrl?: string;
}) {
  try {
    const settings = getSettings();
    const subscription = readSubscriptionData();

    // Priorité aux identifiants Telegram spécifiés dans l'abonnement, sinon settings généraux
    const token = (subscription.adminTelegramBotToken || settings.telegram?.botToken || '').trim();
    const chatId = (subscription.adminTelegramChatId || settings.telegram?.chatId || '').trim();

    if (!token || !chatId) {
      console.log('⚠️ Notification Telegram ignorée : Bot Token ou Chat ID manquant pour l\'administrateur.');
      return { success: false, skipped: true, error: 'Token ou Chat ID manquant' };
    }

    const expiryDate = new Date(params.expiresAt);
    const expiryFormatted = expiryDate.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    const isSuperAdminGen = params.source === 'super_admin' || !params.amountCFA;
    const adminUrl = params.baseUrl ? `${params.baseUrl}/admin` : 'https://christalineshop.com/admin';

    const message = 
      `🔐 <b>NOUVEAU MOT DE PASSE ADMIN — CHRISTALINE SHOP</b>\n\n` +
      `Votre accès administrateur mensuel a été activé avec succès !\n\n` +
      `🔑 <b>Mot de passe :</b> <code>${escapeHtml(params.newPassword)}</code>\n` +
      `⏳ <b>Valide jusqu'au :</b> <b>${escapeHtml(expiryFormatted)}</b> (30 jours)\n\n` +
      `💰 <b>Tarif :</b> ${isSuperAdminGen ? 'Attribution Super Admin (Offert)' : formatCFA(params.amountCFA || 15000)}\n` +
      (params.operator ? `💳 <b>Moyen :</b> ${escapeHtml(params.operator)}\n` : '') +
      (params.reference ? `🔖 <b>Réf :</b> <code>${escapeHtml(params.reference)}</code>\n\n` : '\n') +
      `🛡️ <b>Sécurité renforcée :</b> <i>Pour protéger la boutique, les liens de connexion directe à l'administration ne sont pas affichés publiquement sur le site. Cliquez sur le bouton ci-dessous pour accéder directement à votre espace :</i>`;

    const replyMarkup = {
      inline_keyboard: [
        [
          { text: "🔐 Accéder à l'Espace Admin", url: adminUrl }
        ]
      ]
    };

    return await sendTelegramMessage(message, {
      tokenOverride: token,
      chatIdOverride: chatId,
      replyMarkup,
      forceSend: true
    });
  } catch (err: any) {
    console.error('Erreur notifyNewAdminPasswordTelegram:', err);
    return { success: false, error: err.message || 'Erreur Telegram' };
  }
}

