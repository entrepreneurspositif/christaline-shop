'use client';

import React, { useEffect, useRef, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useSettings } from '@/context/SettingsContext';
import { extractAndPersistUtms, trackPageView } from '@/lib/trackingClient';

function PixelWatcher() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { settings } = useSettings();
  const initializedPixelsRef = useRef<{ fb?: string; tt?: string; ga?: string }>({});

  // 1. Initialisation des Pixels Marketing lorsque les settings sont disponibles
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const marketing = settings?.marketing;
    if (!marketing) return;

    // --- META / FACEBOOK PIXEL ---
    if (marketing.facebookPixel?.enabled && marketing.facebookPixel.pixelId?.trim()) {
      const fbId = marketing.facebookPixel.pixelId.trim();
      if (initializedPixelsRef.current.fb !== fbId) {
        initializedPixelsRef.current.fb = fbId;

        /* eslint-disable */
        (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
          if (f.fbq) return;
          n = f.fbq = function () {
            n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
          };
          if (!f._fbq) f._fbq = n;
          n.push = n;
          n.loaded = !0;
          n.version = '2.0';
          n.queue = [];
          t = b.createElement(e);
          t.async = !0;
          t.src = v;
          s = b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t, s);
        })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
        /* eslint-enable */

        if (window.fbq) {
          window.fbq('init', fbId);
          window.fbq('track', 'PageView');
        }
      }
    }

    // --- TIKTOK PIXEL ---
    if (marketing.tiktokPixel?.enabled && marketing.tiktokPixel.pixelId?.trim()) {
      const ttId = marketing.tiktokPixel.pixelId.trim();
      if (initializedPixelsRef.current.tt !== ttId) {
        initializedPixelsRef.current.tt = ttId;

        /* eslint-disable */
        (function (w: any, d: any, t: any) {
          w.TiktokAnalyticsObject = t;
          var ttq = (w[t] = w[t] || []);
          ttq.methods = [
            'page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie'
          ];
          ttq.setAndDefer = function (t: any, e: any) {
            t[e] = function () {
              t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
            };
          };
          for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
          ttq.instance = function (t: any) {
            for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(e, ttq.methods[n]);
            return e;
          };
          ttq.load = function (e: any, n: any) {
            var i = 'https://analytics.tiktok.com/i18n/pixel/events.js';
            ttq._i = ttq._i || {};
            ttq._i[e] = [];
            ttq._i[e]._u = i;
            ttq._t = ttq._t || {};
            ttq._t[e] = +new Date();
            ttq._o = ttq._o || {};
            ttq._o[e] = n || {};
            var o = d.createElement('script');
            o.type = 'text/javascript';
            o.async = !0;
            o.src = i + '?sdkid=' + e + '&lib=' + t;
            var a = d.getElementsByTagName('script')[0];
            a.parentNode.insertBefore(o, a);
          };
          ttq.load(ttId);
          ttq.page();
        })(window, document, 'ttq');
        /* eslint-enable */
      }
    }

    // --- GOOGLE ANALYTICS (G-TAG) ---
    if (marketing.googleAnalytics?.enabled && marketing.googleAnalytics.measurementId?.trim()) {
      const gaId = marketing.googleAnalytics.measurementId.trim();
      if (initializedPixelsRef.current.ga !== gaId) {
        initializedPixelsRef.current.ga = gaId;

        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        window.gtag = function () {
          window.dataLayer?.push(arguments);
        };
        window.gtag('js', new Date());
        window.gtag('config', gaId);
      }
    }
  }, [settings]);

  // 2. Traitement des UTMs et PageView à chaque navigation
  useEffect(() => {
    // Extraction et persistance en session
    extractAndPersistUtms();

    // Envoi de l'événement page_view
    trackPageView(pathname);
  }, [pathname, searchParams]);

  return null;
}

export default function PixelManager() {
  return (
    <Suspense fallback={null}>
      <PixelWatcher />
    </Suspense>
  );
}
