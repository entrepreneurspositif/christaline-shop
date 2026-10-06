import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/settingsServer';
import { getAllTickets, getTicketById, updateTicket, createDefaultTimeline } from '@/lib/storage';
import { getAllGroupBuys } from '@/lib/groupBuyStorage';
import { sendTelegramMessage } from '@/lib/telegram';
import { STATUS_MAP, QuoteStatus } from '@/lib/types';

function formatCFA(amount: number): string {
  return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
}

export async function POST(request: Request) {
  try {
    const update = await request.json();

    // Vérifier si c'est un message texte
    if (!update.message || !update.message.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = String(update.message.chat.id);
    const text = update.message.text.trim();
    const settings = getSettings();

    // Sécurité : autoriser uniquement si Telegram est activé et si le Chat ID correspond au Chat ID configuré
    const configuredChatId = String(settings.telegram?.chatId || '').trim();
    if (!settings.telegram?.enabled || !configuredChatId || configuredChatId !== chatId) {
      console.warn(`Message Telegram reçu d'un Chat ID non configuré: ${chatId}`);
      return NextResponse.json({ ok: true });
    }

    const lower = text.toLowerCase();
    const parts = text.split(/\s+/);
    const command = parts[0].toLowerCase();

    // ==========================================
    // COMMANDE : /start ou /help
    // ==========================================
    if (command === '/start' || command === '/help') {
      const helpMsg = `🌸 <b>BOT DE GESTION CHRISTALINE SHOP BÉNIN</b> 🌸\n\n`
        + `Bienvenue dans votre centre de contrôle Telegram pour gérer vos précommandes et ventes groupées !\n\n`
        + `📋 <b>COMMANDES DISPONIBLES :</b>\n\n`
        + `📊 <b>/stats</b>\n`
        + `<i>Affiche les statistiques en direct de la boutique (tickets, devis, colis).</i>\n\n`
        + `📦 <b>/tickets</b>\n`
        + `<i>Affiche les 5 dernières commandes récentes.</i>\n\n`
        + `🔍 <b>/ticket [N°Ticket]</b>\n`
        + `<i>Ex: <code>/ticket CS-652190</code> — Voir les détails complets d'une commande.</i>\n\n`
        + `🔥 <b>/ventes</b>\n`
        + `<i>Affiche la progression des ventes en groupe en cours.</i>\n\n`
        + `🔄 <b>/status [N°Ticket] [statut]</b>\n`
        + `<i>Ex: <code>/status CS-652190 commande_passee</code>\n`
        + `Statuts possibles : <code>devis_envoye</code>, <code>acompte_recu</code>, <code>commande_passee</code>, <code>expedie_chine</code>, <code>en_douane</code>, <code>colis_arrive</code>, <code>livre</code></i>\n\n`
        + `✨ <i>Vous recevez aussi automatiquement toutes les alertes de nouveaux tickets et ventes groupées ici !</i>`;

      await sendTelegramMessage(helpMsg, { chatIdOverride: chatId });
      return NextResponse.json({ ok: true });
    }

    // ==========================================
    // COMMANDE : /stats
    // ==========================================
    if (command === '/stats') {
      const tickets = await getAllTickets();
      const groupBuys = await getAllGroupBuys();

      const totalTickets = tickets.length;
      const pendingQuote = tickets.filter(t => t.quote.status === 'pending').length;
      const quoteSent = tickets.filter(t => ['ready', 'accepted'].includes(t.quote.status)).length;
      const inTransit = tickets.filter(t => ['paid_deposit', 'ordered', 'in_transit', 'customs'].includes(t.quote.status)).length;
      const readyOrDelivered = tickets.filter(t => ['ready_for_pickup', 'delivered'].includes(t.quote.status)).length;

      const activeGb = groupBuys.filter(g => g.status === 'open').length;
      const totalParticipants = groupBuys.reduce((acc, g) => acc + g.participants.length, 0);

      const msg = `📊 <b>STATISTIQUES CHRISTALINE SHOP BÉNIN</b>\n\n`
        + `📦 <b>Commandes & Tickets :</b>\n`
        + `• Total des tickets : <b>${totalTickets}</b>\n`
        + `• En attente de devis : <b>${pendingQuote}</b> ⏳\n`
        + `• Devis envoyés : <b>${quoteSent}</b> 💬\n`
        + `• En transit international : <b>${inTransit}</b> ✈️🚢\n`
        + `• Arrivés à Cotonou / Livrés : <b>${readyOrDelivered}</b> ✅\n\n`
        + `👥 <b>Ventes en Groupe :</b>\n`
        + `• Ventes en cours : <b>${activeGb}</b> 🔥\n`
        + `• Total des réservations : <b>${totalParticipants}</b>\n\n`
        + `💡 <i>Tapez <b>/tickets</b> pour voir les dernières commandes.</i>`;

      await sendTelegramMessage(msg, { chatIdOverride: chatId });
      return NextResponse.json({ ok: true });
    }

    // ==========================================
    // COMMANDE : /tickets
    // ==========================================
    if (command === '/tickets') {
      const tickets = (await getAllTickets()).slice(0, 5);

      if (tickets.length === 0) {
        await sendTelegramMessage('📭 Aucun ticket enregistré pour le moment.', { chatIdOverride: chatId });
        return NextResponse.json({ ok: true });
      }

      let msg = `📋 <b>LES 5 DERNIÈRES COMMANDES RÉCENTES :</b>\n\n`;
      tickets.forEach((t, i) => {
        const statusLabel = STATUS_MAP[t.quote.status]?.label || t.quote.status;
        const total = t.quote.grandTotalCFA > 0 ? formatCFA(t.quote.grandTotalCFA) : 'Devis en attente';
        msg += `<b>${i + 1}. #${t.id}</b> — ${t.client.name}\n`
          + `   📞 ${t.client.phone} • 📍 ${t.client.city}\n`
          + `   🏷️ Statut : <b>${statusLabel}</b>\n`
          + `   💰 Montant : <b>${total}</b>\n`
          + `   👉 <i>/ticket ${t.id}</i>\n\n`;
      });

      await sendTelegramMessage(msg, { chatIdOverride: chatId });
      return NextResponse.json({ ok: true });
    }

    // ==========================================
    // COMMANDE : /ticket [ID]
    // ==========================================
    if (command === '/ticket') {
      const targetId = (parts[1] || '').toUpperCase().trim();
      if (!targetId) {
        await sendTelegramMessage('⚠️ Veuillez préciser le numéro de ticket. Exemple : <code>/ticket CS-652190</code>', { chatIdOverride: chatId });
        return NextResponse.json({ ok: true });
      }

      const ticket = await getTicketById(targetId);
      if (!ticket) {
        await sendTelegramMessage(`❌ Le ticket <code>#${targetId}</code> est introuvable.`, { chatIdOverride: chatId });
        return NextResponse.json({ ok: true });
      }

      const statusLabel = STATUS_MAP[ticket.quote.status]?.label || ticket.quote.status;
      const modeLabel = ticket.shippingMode === 'sea' ? 'Maritime (2 à 3 mois)' : 'Aérien (Au plus 1 mois)';

      const itemsText = ticket.items.map((it, idx) => {
        const price = it.totalItemCFA ? ` - <b>${formatCFA(it.totalItemCFA)}</b>` : '';
        return `  ${idx + 1}. [${it.platform.toUpperCase()}] ${it.name} (x${it.quantity})${price}`;
      }).join('\n');

      const msg = `🎫 <b>DÉTAILS DU TICKET #${ticket.id}</b>\n\n`
        + `👤 <b>Client :</b> ${ticket.client.name}\n`
        + `📞 <b>Téléphone :</b> ${ticket.client.phone}\n`
        + `💬 <b>WhatsApp :</b> ${ticket.client.whatsapp}\n`
        + `📍 <b>Ville :</b> ${ticket.client.city} (Bénin)\n`
        + `📦 <b>Mode :</b> ${modeLabel}\n`
        + `🏷️ <b>Statut actuel :</b> <b>${statusLabel}</b>\n\n`
        + `🛒 <b>Articles (${ticket.items.length}) :</b>\n${itemsText}\n\n`
        + `💰 <b>Devis Total :</b> <b>${formatCFA(ticket.quote.grandTotalCFA)}</b>\n`
        + `💵 <b>Acompte réglé :</b> <b>${formatCFA(ticket.quote.depositPaidCFA)} / ${formatCFA(ticket.quote.depositRequiredCFA)}</b>\n\n`
        + `💡 <i>Pour changer le statut : <code>/status ${ticket.id} commande_passee</code></i>`;

      const replyMarkup = {
        inline_keyboard: [
          [
            { text: '🔍 Voir en Ligne', url: `https://christalineshop.com/ticket/${ticket.id}` },
            { text: '💬 WhatsApp Client', url: `https://wa.me/229${ticket.client.whatsapp.replace(/\D/g, '')}` }
          ]
        ]
      };

      await sendTelegramMessage(msg, { chatIdOverride: chatId, replyMarkup });
      return NextResponse.json({ ok: true });
    }

    // ==========================================
    // COMMANDE : /ventes ou /groupbuys
    // ==========================================
    if (command === '/ventes' || command === '/groupbuys') {
      const groupBuys = await getAllGroupBuys();
      if (groupBuys.length === 0) {
        await sendTelegramMessage('📭 Aucune vente en groupe actuellement.', { chatIdOverride: chatId });
        return NextResponse.json({ ok: true });
      }

      let msg = `🔥 <b>VENTES EN GROUPE CHRISTALINE SHOP :</b>\n\n`;
      groupBuys.forEach((g, i) => {
        const pct = g.minQuantity > 0 ? Math.round((g.currentQuantity / g.minQuantity) * 100) : 100;
        const statusBadge = g.status === 'open' ? '🟢 En cours' : (g.status === 'goal_reached' ? '🎉 Objectif Atteint' : '⚪ Clôturée');
        msg += `<b>${i + 1}. ${g.title}</b>\n`
          + `   🏷️ ${statusBadge} • 📅 Date commande : <b>${g.orderDate}</b>\n`
          + `   💰 Prix : <b>${formatCFA(g.priceCFA)}</b>\n`
          + `   📊 Réservations : <b>${g.currentQuantity} / ${g.minQuantity}</b> (${pct}%)\n`
          + `   👥 Participants : <b>${g.participants.length} clients</b>\n\n`;
      });

      await sendTelegramMessage(msg, { chatIdOverride: chatId });
      return NextResponse.json({ ok: true });
    }

    // ==========================================
    // COMMANDE : /status [ID] [statut]
    // ==========================================
    if (command === '/status' || command === '/setstatus') {
      const targetId = (parts[1] || '').toUpperCase().trim();
      const rawStatus = (parts[2] || '').toLowerCase().trim();

      if (!targetId || !rawStatus) {
        const helpStatus = `⚠️ Format requis : <code>/status [ID] [nouveau_statut]</code>\n\n`
          + `<b>Statuts reconnus :</b>\n`
          + `• <code>devis_pret</code> (Devis calculé et prêt)\n`
          + `• <code>acompte_recu</code> (Acompte validé)\n`
          + `• <code>commande_passee</code> (Commande achetée fournisseur)\n`
          + `• <code>expedie</code> (Expédié en transit international)\n`
          + `• <code>en_douane</code> (En dédouanement Bénin)\n`
          + `• <code>colis_arrive</code> (Arrivé à Cotonou, prêt au retrait)\n`
          + `• <code>livre</code> (Livré au client)`;
        await sendTelegramMessage(helpStatus, { chatIdOverride: chatId });
        return NextResponse.json({ ok: true });
      }

      const ticket = await getTicketById(targetId);
      if (!ticket) {
        await sendTelegramMessage(`❌ Le ticket <code>#${targetId}</code> est introuvable.`, { chatIdOverride: chatId });
        return NextResponse.json({ ok: true });
      }

      const statusAliases: Record<string, QuoteStatus> = {
        'devis_pret': 'ready',
        'ready': 'ready',
        'devis_envoye': 'ready',
        'acompte_recu': 'paid_deposit',
        'paid_deposit': 'paid_deposit',
        'commande_passee': 'ordered',
        'ordered': 'ordered',
        'expedie': 'in_transit',
        'in_transit': 'in_transit',
        'expedie_chine': 'in_transit',
        'en_douane': 'customs',
        'customs': 'customs',
        'colis_arrive': 'ready_for_pickup',
        'ready_for_pickup': 'ready_for_pickup',
        'livre': 'delivered',
        'delivered': 'delivered',
        'annule': 'cancelled',
        'cancelled': 'cancelled'
      };

      const mappedStatus = statusAliases[rawStatus];
      if (!mappedStatus) {
        await sendTelegramMessage(`⚠️ Statut inconnu « ${rawStatus} ». Tapez <code>/status</code> pour voir la liste des statuts valides.`, { chatIdOverride: chatId });
        return NextResponse.json({ ok: true });
      }

      const previousStatus = ticket.quote.status;
      const updated = await updateTicket(ticket.id, {
        quote: {
          ...ticket.quote,
          status: mappedStatus
        },
        tracking: {
          ...ticket.tracking,
          currentStatus: mappedStatus,
          statusLabel: STATUS_MAP[mappedStatus]?.label || mappedStatus,
          events: createDefaultTimeline(mappedStatus, ticket.createdAt)
        }
      });

      const newLabel = STATUS_MAP[mappedStatus]?.label || mappedStatus;
      const prevLabel = STATUS_MAP[previousStatus]?.label || previousStatus;

      const successMsg = `✅ <b>STATUT DU TICKET #${ticket.id} MIS À JOUR !</b>\n\n`
        + `👤 Client : <b>${ticket.client.name}</b>\n`
        + `🔄 Statut : <s>${prevLabel}</s> ➡️ <b>${newLabel}</b>\n\n`
        + `🌐 <i>Le client peut voir l'actualisation immédiate sur son ticket en ligne.</i>`;

      await sendTelegramMessage(successMsg, { chatIdOverride: chatId });
      return NextResponse.json({ ok: true });
    }

    // Commande inconnue
    await sendTelegramMessage('❓ Commande non reconnue. Tapez <b>/help</b> pour afficher la liste des commandes.', { chatIdOverride: chatId });
    return NextResponse.json({ ok: true });

  } catch (err: any) {
    console.error('Erreur API /api/telegram/webhook:', err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'active', 
    service: 'Christaline Shop Telegram Webhook',
    timestamp: new Date().toISOString()
  });
}
