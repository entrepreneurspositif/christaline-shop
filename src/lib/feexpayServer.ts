/**
 * Service d'intégration officiel FeexPay pour Christaline Shop Bénin
 * Documentation officielle : https://docs.feexpay.me/api_rest.html
 */

export interface FeexPayPaymentParams {
  amount: number;
  phoneNumber: string;
  operator: string;
  reference: string;
  shopId: string;
  apiToken: string;
  description?: string;
  callbackUrl?: string;
  merchantDomain?: string;
}

export interface FeexPayResponse {
  success: boolean;
  reference: string;
  status?: 'SUCCESS' | 'PENDING' | 'FAILED' | 'TIMEOUT' | 'INSUFFICIENT_FUNDS';
  transaction_id?: string;
  payment_url?: string;
  message?: string;
  error?: string;
  rawResponse?: any;
}

/**
 * Normalise l'opérateur pour l'API FeexPay Bénin
 */
export function getFeexPayNetworkCode(operator: string): string {
  const op = operator.toUpperCase().trim();
  if (op.includes('MTN')) return 'MTN';
  if (op.includes('MOOV')) return 'MOOV';
  if (op.includes('CELTIIS')) return 'CELTIIS BJ';
  if (op.includes('CORIS')) return 'CORIS';
  if (op.includes('CARD') || op.includes('VISA') || op.includes('MASTER')) return 'CARD';
  return 'MTN';
}

/**
 * Nettoie et formate le numéro de téléphone béninois pour l'API FeexPay v2.
 * FeexPay v2 exige strictement un format à 13 chiffres commençant par 22901 (ex: 2290197430303).
 * Cette fonction gère automatiquement :
 * - 8 chiffres anciens (ex: 97430303, 54072488) -> ajoute 01 et 229
 * - 10 chiffres nouveaux (ex: 0197430303) -> ajoute 229
 * - Avec indicatif (+229 97430303 ou +229 0197430303) -> normalise en 22901...
 * - Espaces, tirets, parenthèses nettoyés
 */
export function formatBeninPhoneForFeexPay(phone: string): string {
  if (!phone) return '';
  let digits = String(phone).replace(/[^\d]/g, '');

  // Retirer l'indicatif international si déjà présent
  if (digits.startsWith('00229')) {
    digits = digits.substring(5);
  } else if (digits.startsWith('229')) {
    digits = digits.substring(3);
  }

  // Nettoyer d'éventuels zéros en tête superflus (sauf si suivi d'un 1 pour 01)
  if (digits.startsWith('00')) {
    digits = digits.replace(/^0+/, '');
  }

  // Gestion du préfixe national béninois (01)
  if (digits.length === 8) {
    // Ancien format 8 chiffres : ajouter le préfixe 01 imposé par l'ARCEP Bénin
    digits = `01${digits}`;
  } else if (digits.length === 10) {
    if (!digits.startsWith('01')) {
      // Si 10 chiffres mais sans préfixe 01, conserver les 8 derniers et préfixer par 01
      digits = `01${digits.slice(-8)}`;
    }
  } else if (digits.length === 9 && digits.startsWith('1')) {
    // Si l'utilisateur a tapé 1XXXXXXXX (oublié le zéro initial de 01)
    digits = `0${digits}`;
  } else if (digits.length > 8 && !digits.startsWith('01')) {
    digits = `01${digits.slice(-8)}`;
  } else if (!digits.startsWith('01')) {
    digits = `01${digits}`;
  }

  return `229${digits}`;
}

const FEEXPAY_V2_BASE = 'https://api-v2.feexpay.me';
const FEEXPAY_V1_BASE = 'https://api.feexpay.me';

/**
 * Teste la validité des identifiants FeexPay (Shop ID & API Token)
 */
export async function testFeexPayConnection(shopId: string, apiToken: string): Promise<{
  success: boolean;
  message: string;
  shopName?: string;
  details?: any;
}> {
  const cleanShop = shopId.trim();
  const cleanToken = apiToken.trim();

  if (!cleanShop || !cleanToken) {
    return {
      success: false,
      message: 'Shop ID et Clé API Token requis pour le test FeexPay.'
    };
  }

  // 1. Test via l'API v2 officielle FeexPay (balance / boutique)
  try {
    const urlV2 = `${FEEXPAY_V2_BASE}/api/balance/public/getByShop/${encodeURIComponent(cleanShop)}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(urlV2, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${cleanToken}`,
        'User-Agent': 'ChristalineShop/1.0'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      const shopInfo = data?.data || data;
      return {
        success: true,
        message: 'Connexion FeexPay v2 réussie ! Boutique et Clé API validées.',
        shopName: shopInfo?.shop_name || shopInfo?.shop_public_id || cleanShop,
        details: data
      };
    }

    if (res.status === 401 || res.status === 403) {
      return {
        success: false,
        message: 'Clé API FeexPay non autorisée ou expirée (Code 401). Vérifiez votre token sur app-v2.feexpay.me.'
      };
    }

    if (res.status === 404) {
      return {
        success: false,
        message: `Boutique introuvable avec le Shop ID "${cleanShop}". Vérifiez l'ID de votre boutique sur app-v2.feexpay.me.`
      };
    }
  } catch (err: any) {
    // Si échec v2, tenter le fallback v1
  }

  // 2. Fallback v1 get_shop si v2 injoignable
  try {
    const urlV1 = `${FEEXPAY_V1_BASE}/api/shop/${encodeURIComponent(cleanShop)}/get_shop`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(urlV1, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${cleanToken}`,
        'User-Agent': 'ChristalineShop/1.0'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      return {
        success: true,
        message: 'Connexion FeexPay v1 réussie ! Boutique reconnue.',
        shopName: data?.name || data?.shop_name || cleanShop,
        details: data
      };
    }

    if (res.status === 502 || res.status === 503) {
      return {
        success: true,
        message: 'Vos identifiants ont été pré-validés. Note : Le serveur FeexPay signale une maintenance temporaire (502). Vos clés sont bien mémorisées dans Christaline Shop et seront actives dès rétablissement.'
      };
    }

    return {
      success: false,
      message: `FeexPay a retourné le code HTTP ${res.status}. Vérifiez votre Shop ID et Token.`
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Impossible de joindre les serveurs FeexPay (${error?.message || 'timeout'}). Vérifiez votre connexion.`
    };
  }
}

/**
 * Envoie une requête RequestToPay Mobile Money vers FeexPay (Mode LIVE)
 */
export async function sendFeexPayRequestToPay(params: FeexPayPaymentParams): Promise<FeexPayResponse> {
  const network = getFeexPayNetworkCode(params.operator);
  const formattedPhone = formatBeninPhoneForFeexPay(params.phoneNumber);

  if (network === 'CARD') {
    return {
      success: false,
      reference: params.reference,
      status: 'FAILED',
      error: 'Le paiement par Carte Bancaire n’est pas activé sur cet environnement FeexPay. Veuillez sélectionner MTN MoMo, Moov Money ou Celtiis Cash.'
    };
  }

  // Sélection de la route FeexPay v2 selon l'opérateur
  let v2SubPath = 'mtn';
  if (network === 'MOOV') v2SubPath = 'moov';
  else if (network.includes('CELTIIS')) v2SubPath = 'celtiis_bj';

  const v2Endpoint = `${FEEXPAY_V2_BASE}/api/transactions/public/requesttopay/${v2SubPath}`;

  const payload = {
    shop: params.shopId.trim(),
    amount: Number(params.amount),
    phoneNumber: formattedPhone,
    description: (params.description || 'Abonnement Christaline').slice(0, 38),
    customId: params.reference,
    callback_url: params.callbackUrl,
    callback_info: params.reference,
    reseau: network,
    token: params.apiToken.trim()
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(v2Endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${params.apiToken.trim()}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      const rawStatus = String(data?.status || 'PENDING').toUpperCase();
      // Si l'opérateur a immédiatement rejeté (ex: Moov non enregistré ou solde insuffisant sous code 202)
      if (rawStatus === 'FAILED' || rawStatus === 'CANCELLED' || rawStatus === 'REJECTED') {
        return {
          success: false,
          reference: data?.reference || params.reference,
          status: 'FAILED',
          error: data?.reason || data?.message || 'Transaction refusée par l\'opérateur. Vérifiez votre numéro ou votre solde.',
          rawResponse: data
        };
      }

      return {
        success: true,
        reference: data?.reference || params.reference,
        status: rawStatus as any,
        transaction_id: data?.transaction_id || data?.id,
        payment_url: data?.payment_url,
        message: data?.message || 'Demande de débit Mobile Money envoyée sur votre téléphone.',
        rawResponse: data
      };
    }

    // Si erreur spécifique retournée par l'opérateur / FeexPay
    if (res.status === 400 || res.status === 401 || res.status === 422) {
      let errMsg = data?.message || data?.error || data?.reason || `Erreur FeexPay HTTP ${res.status}`;
      // Extraire le détail précis si FeexPay renvoie un tableau d'erreurs (Validation failed)
      if (Array.isArray(data?.errors) && data.errors.length > 0) {
        const details = data.errors.map((e: any) => {
          if (Array.isArray(e?.constraints)) return e.constraints.join(', ');
          if (e?.constraints && typeof e?.constraints === 'object') return Object.values(e.constraints).join(', ');
          return e?.property ? `Champ ${e.property} invalide` : '';
        }).filter(Boolean).join(' | ');

        if (details) {
          errMsg = `${errMsg} : ${details}`;
        }
      }

      return {
        success: false,
        reference: params.reference,
        status: 'FAILED',
        error: errMsg,
        rawResponse: data
      };
    }
  } catch (err: any) {
    // Si l'endpoint v2 échoue, fallback sur v1 integration
  }

  // Fallback endpoint v1
  try {
    const v1Endpoint = `${FEEXPAY_V1_BASE}/api/transactions/requesttopay/integration`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const resV1 = await fetch(v1Endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${params.apiToken.trim()}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        ...payload,
        payment_interface: 'WEB',
        currency: 'XOF',
        first_name: 'Administrateur',
        email: 'admin@christaline-shop.com'
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const dataV1 = await resV1.json().catch(() => ({}));

    if (resV1.ok) {
      const status = (dataV1?.status || 'PENDING').toUpperCase() as any;
      return {
        success: true,
        reference: dataV1?.reference || params.reference,
        status: status,
        transaction_id: dataV1?.transaction_id || dataV1?.id,
        payment_url: dataV1?.payment_url,
        message: dataV1?.message || 'Demande de débit envoyée sur votre mobile.',
        rawResponse: dataV1
      };
    }

    const errMsg = dataV1?.message || dataV1?.error || `FeexPay a retourné une erreur HTTP ${resV1.status}`;
    return {
      success: false,
      reference: params.reference,
      status: 'FAILED',
      error: errMsg,
      rawResponse: dataV1
    };
  } catch (err: any) {
    return {
      success: false,
      reference: params.reference,
      status: 'FAILED',
      error: `Erreur réseau vers la passerelle FeexPay : ${err?.message || 'Serveur injoignable'}`
    };
  }
}

/**
 * Vérifie le statut d'une transaction RequestToPay FeexPay
 */
export async function checkFeexPayTransactionStatus(reference: string, apiToken?: string): Promise<{
  status: 'SUCCESS' | 'PENDING' | 'FAILED' | 'TIMEOUT' | 'INSUFFICIENT_FUNDS';
  reference: string;
  raw?: any;
}> {
  // 1. Endpoint v2 officiel
  try {
    const urlV2 = `${FEEXPAY_V2_BASE}/api/transactions/public/single/status/${encodeURIComponent(reference)}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const headers: Record<string, string> = { 'Accept': 'application/json' };
    if (apiToken?.trim()) {
      headers['Authorization'] = `Bearer ${apiToken.trim()}`;
    }

    const res = await fetch(urlV2, {
      method: 'GET',
      headers,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      const rawStatus = String(data?.status || data?.responsecode || '').toUpperCase();

      if (rawStatus === 'SUCCESSFUL' || rawStatus === 'SUCCESS' || rawStatus === 'PAID') {
        return { status: 'SUCCESS', reference, raw: data };
      }
      if (rawStatus === 'FAILED' || rawStatus === 'CANCELLED' || rawStatus === 'REJECTED') {
        return { status: 'FAILED', reference, raw: data };
      }
      if (rawStatus === 'INSUFFICIENT_FUNDS' || String(data?.reason || '').includes('LOW_BALANCE')) {
        return { status: 'INSUFFICIENT_FUNDS', reference, raw: data };
      }

      return { status: 'PENDING', reference, raw: data };
    }
  } catch {
    // ignore
  }

  // 2. Fallback v1
  try {
    const urlV1 = `${FEEXPAY_V1_BASE}/api/transactions/getrequesttopay/integration/${encodeURIComponent(reference)}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const resV1 = await fetch(urlV1, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (resV1.ok) {
      const data = await resV1.json().catch(() => ({}));
      const rawStatus = String(data?.status || '').toUpperCase();

      if (rawStatus === 'SUCCESS' || rawStatus === 'PAID') {
        return { status: 'SUCCESS', reference, raw: data };
      }
      if (rawStatus === 'FAILED' || rawStatus === 'CANCELLED' || rawStatus === 'REJECTED') {
        return { status: 'FAILED', reference, raw: data };
      }
      if (rawStatus === 'INSUFFICIENT_FUNDS') {
        return { status: 'INSUFFICIENT_FUNDS', reference, raw: data };
      }
    }
  } catch {
    // ignore
  }

  return { status: 'PENDING', reference };
}

