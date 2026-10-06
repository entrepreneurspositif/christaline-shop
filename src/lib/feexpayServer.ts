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
 * Nettoie et formate le numéro de téléphone béninois
 */
export function formatBeninPhoneForFeexPay(phone: string): string {
  let cleaned = phone.replace(/[^\d]/g, '');
  // Si le numéro commence par l'indicatif 229 répété ou 00229
  if (cleaned.startsWith('00229')) {
    cleaned = cleaned.substring(5);
  } else if (cleaned.startsWith('229') && cleaned.length > 10) {
    cleaned = cleaned.substring(3);
  }
  return cleaned;
}

/**
 * Teste la validité des identifiants FeexPay (Shop ID & API Token)
 */
export async function testFeexPayConnection(shopId: string, apiToken: string): Promise<{
  success: boolean;
  message: string;
  shopName?: string;
  details?: any;
}> {
  if (!shopId.trim() || !apiToken.trim()) {
    return {
      success: false,
      message: 'Shop ID et Clé API Token requis pour le test FeexPay.'
    };
  }

  try {
    // 1. Test de récupération de la boutique via l'API officielle FeexPay
    const url = `https://api.feexpay.me/api/shop/${encodeURIComponent(apiToken.trim())}/get_shop`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'ChristalineShop/1.0'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (res.status === 502 || res.status === 503) {
      return {
        success: false,
        message: 'L\'API FeexPay est temporairement en maintenance (Erreur 502 de FeexPay). Vos clés sont bien enregistrées dans Christaline Shop et seront utilisées dès que la passerelle FeexPay est en ligne.'
      };
    }

    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      return {
        success: true,
        message: `Connexion FeexPay réussie ! Boutique reconnue.`,
        shopName: data?.name || data?.shop_name || shopId,
        details: data
      };
    }

    if (res.status === 401 || res.status === 403) {
      return {
        success: false,
        message: 'Token API FeexPay non autorisé ou invalide. Veuillez vérifier votre clé API sur app.feexpay.me.'
      };
    }

    if (res.status === 404) {
      return {
        success: false,
        message: 'Boutique introuvable pour ce Token. Vérifiez que la boutique est bien active sur app.feexpay.me.'
      };
    }

    return {
      success: false,
      message: `FeexPay a retourné le code HTTP ${res.status}. Vérifiez votre Shop ID et Token.`
    };
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      return {
        success: false,
        message: 'Délai d\'attente dépassé vers api.feexpay.me (le serveur FeexPay met trop de temps à répondre).'
      };
    }
    return {
      success: false,
      message: `Erreur de connexion FeexPay : ${error?.message || 'Serveur distant injoignable'}`
    };
  }
}

/**
 * Envoie une requête RequestToPay Mobile Money vers FeexPay (Mode LIVE)
 */
export async function sendFeexPayRequestToPay(params: FeexPayPaymentParams): Promise<FeexPayResponse> {
  const network = getFeexPayNetworkCode(params.operator);
  const formattedPhone = formatBeninPhoneForFeexPay(params.phoneNumber);
  const endpoint = 'https://api.feexpay.me/api/transactions/requesttopay/integration';

  const payload = {
    phoneNumber: formattedPhone,
    amount: params.amount,
    reseau: network,
    description: params.description || `Abonnement Admin Christaline Shop (${params.reference})`,
    customId: params.reference,
    shop: params.shopId.trim(),
    token: params.apiToken.trim(),
    merchant_domain: params.merchantDomain || 'https://christaline-shop.vercel.app',
    payment_interface: 'WEB',
    currency: 'XOF',
    first_name: 'Administrateur',
    email: 'admin@christaline-shop.com',
    callback_info: {
      reference: params.reference
    }
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(endpoint, {
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

    if (res.status === 502 || res.status === 503) {
      return {
        success: false,
        reference: params.reference,
        status: 'FAILED',
        error: 'La passerelle FeexPay est momentanément indisponible (Code 502 Bad Gateway). Veuillez réessayer dans quelques instants.'
      };
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errMsg = data?.message || data?.error || data?.reason || `Erreur FeexPay HTTP ${res.status}`;
      return {
        success: false,
        reference: params.reference,
        status: 'FAILED',
        error: errMsg,
        rawResponse: data
      };
    }

    // FeexPay retourne généralement status: 'PENDING' ou 'SUCCESS' avec reference
    const status = (data?.status || 'PENDING').toUpperCase() as any;
    return {
      success: true,
      reference: data?.reference || params.reference,
      status: status,
      transaction_id: data?.transaction_id || data?.id,
      payment_url: data?.payment_url,
      message: data?.message || 'Demande de paiement envoyée sur votre mobile.',
      rawResponse: data
    };
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      return {
        success: false,
        reference: params.reference,
        status: 'TIMEOUT',
        error: 'Délai d\'attente FeexPay dépassé (timeout 12s).'
      };
    }
    return {
      success: false,
      reference: params.reference,
      status: 'FAILED',
      error: err?.message || 'Erreur réseau vers FeexPay'
    };
  }
}

/**
 * Vérifie le statut d'une transaction RequestToPay FeexPay
 */
export async function checkFeexPayTransactionStatus(reference: string): Promise<{
  status: 'SUCCESS' | 'PENDING' | 'FAILED' | 'TIMEOUT' | 'INSUFFICIENT_FUNDS';
  reference: string;
  raw?: any;
}> {
  const url = `https://api.feexpay.me/api/transactions/getrequesttopay/integration/${encodeURIComponent(reference)}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return { status: 'PENDING', reference };
    }

    const data = await res.json().catch(() => ({}));
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

    return { status: 'PENDING', reference, raw: data };
  } catch {
    return { status: 'PENDING', reference };
  }
}
