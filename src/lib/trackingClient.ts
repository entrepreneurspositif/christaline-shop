// Client-side tracking utility for Christaline Shop
// Supports: Internal Analytics + Meta (Facebook) Pixel + TikTok Pixel + Google Analytics

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    ttq?: {
      track: (eventName: string, params?: any) => void;
      page: () => void;
      load: (pixelId: string) => void;
    };
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export interface UtmParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

const SESSION_STORAGE_KEY = 'cs_utm_tracking';
const SESSION_ID_KEY = 'cs_session_id';

export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';
  let sid = sessionStorage.getItem(SESSION_ID_KEY);
  if (!sid) {
    sid = 'sess_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
    sessionStorage.setItem(SESSION_ID_KEY, sid);
  }
  return sid;
}

export function detectDeviceType(): 'mobile' | 'desktop' | 'tablet' {
  if (typeof window === 'undefined') return 'desktop';
  const ua = navigator.userAgent.toLowerCase();
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/mobile|iphone|ipod|blackberry|opera mini|iemobile|wpdesktop/i.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

export function extractAndPersistUtms(): UtmParams {
  if (typeof window === 'undefined') return {};

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const source = urlParams.get('utm_source');
    const medium = urlParams.get('utm_medium');
    const campaign = urlParams.get('utm_campaign');
    const content = urlParams.get('utm_content');
    const term = urlParams.get('utm_term');

    // Si des UTM sont dans l'URL actuelle, on les sauvegarde
    if (source || campaign) {
      const utms: UtmParams = {
        utm_source: source || undefined,
        utm_medium: medium || undefined,
        utm_campaign: campaign || undefined,
        utm_content: content || undefined,
        utm_term: term || undefined
      };
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(utms));
      return utms;
    }

    // Sinon on regarde s'il y a déjà une source en session
    const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }

    // Si direct avec referrer
    if (document.referrer) {
      const refUrl = new URL(document.referrer);
      let detectedSource = 'referral';
      if (refUrl.hostname.includes('facebook.com') || refUrl.hostname.includes('fb.me')) {
        detectedSource = 'facebook';
      } else if (refUrl.hostname.includes('tiktok.com')) {
        detectedSource = 'tiktok';
      } else if (refUrl.hostname.includes('instagram.com')) {
        detectedSource = 'instagram';
      } else if (refUrl.hostname.includes('whatsapp.com')) {
        detectedSource = 'whatsapp';
      } else if (refUrl.hostname.includes('google.')) {
        detectedSource = 'google';
      }

      const utms: UtmParams = { utm_source: detectedSource };
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(utms));
      return utms;
    }
  } catch (e) {
    // Silently ignore URL parsing issues
  }

  return { utm_source: 'direct' };
}

// Fonction interne pour envoyer à l'API interne
async function sendInternalEvent(
  type: string,
  path?: string,
  metadata?: Record<string, any>
) {
  if (typeof window === 'undefined') return;

  try {
    const utms = extractAndPersistUtms();
    const sessionId = getOrCreateSessionId();
    const deviceType = detectDeviceType();
    const currentPath = path || window.location.pathname;

    const payload = {
      type,
      path: currentPath,
      referrer: document.referrer || undefined,
      utmSource: utms.utm_source,
      utmMedium: utms.utm_medium,
      utmCampaign: utms.utm_campaign,
      utmContent: utms.utm_content,
      utmTerm: utms.utm_term,
      metadata,
      deviceType,
      sessionId
    };

    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true
    }).catch(() => {});
  } catch (err) {
    // ignore
  }
}

// ==============================================================
// ÉVÉNEMENTS MARKETING PUBLICS
// ==============================================================

// 1. PageView
export function trackPageView(path?: string) {
  if (typeof window === 'undefined') return;

  // Interne
  sendInternalEvent('page_view', path);

  // Facebook Pixel
  if (window.fbq) {
    window.fbq('track', 'PageView');
  }

  // TikTok Pixel
  if (window.ttq?.page) {
    window.ttq.page();
  }

  // Google Analytics
  if (window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: path || window.location.pathname
    });
  }
}

// 2. ViewContent (Article groupe, fiche devis)
export function trackViewContent(contentName: string, contentCategory?: string, value?: number) {
  if (typeof window === 'undefined') return;

  sendInternalEvent('view_content', undefined, { contentName, contentCategory, value });

  if (window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_name: contentName,
      content_category: contentCategory || 'Products',
      currency: 'XOF',
      value: value || 0
    });
  }

  if (window.ttq?.track) {
    window.ttq.track('ViewContent', {
      content_name: contentName,
      content_type: 'product',
      currency: 'XOF',
      value: value || 0
    });
  }

  if (window.gtag) {
    window.gtag('event', 'view_item', {
      item_name: contentName,
      item_category: contentCategory,
      currency: 'XOF',
      value
    });
  }
}

// 3. InitiateCheckout (Commencer à remplir la commande ou rejoindre vente de groupe)
export function trackInitiateCheckout(context: string, estimatedValue?: number) {
  if (typeof window === 'undefined') return;

  sendInternalEvent('initiate_checkout', undefined, { context, estimatedValue });

  if (window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      content_name: context,
      currency: 'XOF',
      value: estimatedValue || 0
    });
  }

  if (window.ttq?.track) {
    window.ttq.track('InitiateCheckout', {
      content_name: context,
      currency: 'XOF',
      value: estimatedValue || 0
    });
  }

  if (window.gtag) {
    window.gtag('event', 'begin_checkout', {
      currency: 'XOF',
      value: estimatedValue
    });
  }
}

// 4. Lead (Demande de devis soumise avec ticket généré)
export function trackLead(ticketId: string, itemsCount: number, platform?: string) {
  if (typeof window === 'undefined') return;

  sendInternalEvent('lead_quote', undefined, { ticketId, itemsCount, platform });

  if (window.fbq) {
    window.fbq('track', 'Lead', {
      content_name: `Devis Ticket ${ticketId}`,
      content_category: platform || 'Shein/Temu',
      num_items: itemsCount
    });
  }

  if (window.ttq?.track) {
    window.ttq.track('SubmitForm', {
      content_name: `Ticket ${ticketId}`,
      content_type: 'lead'
    });
  }

  if (window.gtag) {
    window.gtag('event', 'generate_lead', {
      transaction_id: ticketId,
      items_count: itemsCount
    });
  }
}

// 5. Purchase / Réservation Vente en Groupe
export function trackGroupBuyReservation(itemTitle: string, amountCFA: number, quantity: number, participantName: string) {
  if (typeof window === 'undefined') return;

  sendInternalEvent('group_buy_joined', undefined, { itemTitle, amountCFA, quantity, participantName });

  if (window.fbq) {
    window.fbq('track', 'Purchase', {
      content_name: itemTitle,
      content_type: 'product_group',
      value: amountCFA,
      currency: 'XOF',
      num_items: quantity
    });
  }

  if (window.ttq?.track) {
    window.ttq.track('CompletePayment', {
      content_name: itemTitle,
      value: amountCFA,
      currency: 'XOF',
      quantity
    });
  }

  if (window.gtag) {
    window.gtag('event', 'purchase', {
      currency: 'XOF',
      value: amountCFA,
      items: [{ item_name: itemTitle, quantity }]
    });
  }
}

// 6. Contact (Clic WhatsApp ou Appel direct)
export function trackContactClick(channel: 'whatsapp' | 'phone', target?: string) {
  if (typeof window === 'undefined') return;

  sendInternalEvent(channel === 'whatsapp' ? 'whatsapp_click' : 'phone_click', undefined, { channel, target });

  if (window.fbq) {
    window.fbq('track', 'Contact', {
      content_name: channel === 'whatsapp' ? 'WhatsApp Christaline' : 'Appel Téléphonique Christaline',
      channel
    });
  }

  if (window.ttq?.track) {
    window.ttq.track('Contact', {
      content_name: channel
    });
  }

  if (window.gtag) {
    window.gtag('event', 'contact', {
      method: channel
    });
  }
}
