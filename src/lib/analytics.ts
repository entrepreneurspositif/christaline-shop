import fs from 'fs';
import path from 'path';

export type TrackingEventType =
  | 'page_view'
  | 'view_content'
  | 'initiate_checkout'
  | 'lead_quote'
  | 'group_buy_joined'
  | 'whatsapp_click'
  | 'phone_click';

export interface AnalyticsEvent {
  id: string;
  type: TrackingEventType;
  timestamp: string;
  path: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  metadata?: Record<string, any>;
  deviceType?: 'mobile' | 'desktop' | 'tablet';
  sessionId?: string;
}

export interface AnalyticsData {
  events: AnalyticsEvent[];
}

export interface AnalyticsSummary {
  totalVisits: number;
  todayVisits: number;
  last7DaysVisits: number;
  totalLeads: number;
  totalGroupBuyReservations: number;
  totalWhatsappClicks: number;
  totalPhoneClicks: number;
  conversionRate: number;
  sourcesBreakdown: { source: string; count: number; percentage: number }[];
  campaignsBreakdown: { campaign: string; count: number }[];
  eventsTimeline: { date: string; visits: number; leads: number; reservations: number }[];
  funnel: {
    step: string;
    label: string;
    count: number;
  }[];
  recentEvents: AnalyticsEvent[];
}

const ANALYTICS_FILE = path.join(process.cwd(), 'data', 'analytics.json');
const MAX_STORED_EVENTS = 2500;

function readAnalyticsData(): AnalyticsData {
  try {
    if (fs.existsSync(ANALYTICS_FILE)) {
      const raw = fs.readFileSync(ANALYTICS_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed?.events)) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Erreur lecture analytics.json:', error);
  }
  return { events: [] };
}

function writeAnalyticsData(data: AnalyticsData) {
  try {
    const dir = path.dirname(ANALYTICS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    // Conserver les MAX_STORED_EVENTS plus récents
    if (data.events.length > MAX_STORED_EVENTS) {
      data.events = data.events.slice(-MAX_STORED_EVENTS);
    }
    fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Erreur écriture analytics.json:', error);
  }
}

import { getDatabase } from './mongodb';

export function recordAnalyticsEvent(eventData: Omit<AnalyticsEvent, 'id' | 'timestamp'>): AnalyticsEvent {
  const data = readAnalyticsData();
  const event: AnalyticsEvent = {
    ...eventData,
    id: `ev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    utmSource: eventData.utmSource?.trim() ? eventData.utmSource.trim().toLowerCase() : 'direct'
  };

  data.events.push(event);
  writeAnalyticsData(data);

  // Écrire également dans MongoDB Atlas en arrière-plan
  getDatabase().then(db => {
    if (db) {
      db.collection('analytics').updateOne(
        { _id: 'store_analytics' as any },
        { 
          $push: { 
            events: { 
              $each: [event], 
              $slice: -MAX_STORED_EVENTS 
            } as any
          } 
        },
        { upsert: true }
      ).catch(e => console.error('Erreur écriture analytics MongoDB:', e));
    }
  }).catch(() => {});

  return event;
}

export function computeAnalyticsSummary(events: AnalyticsEvent[]): AnalyticsSummary {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  let totalVisits = 0;
  let todayVisits = 0;
  let last7DaysVisits = 0;
  let totalInitiateCheckout = 0;
  let totalLeads = 0;
  let totalGroupBuyReservations = 0;
  let totalWhatsappClicks = 0;
  let totalPhoneClicks = 0;

  const sourceCounts: Record<string, number> = {};
  const campaignCounts: Record<string, number> = {};
  const timelineMap: Record<string, { visits: number; leads: number; reservations: number }> = {};

  // Initialiser les 7 derniers jours dans la timeline
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split('T')[0];
    timelineMap[dateStr] = { visits: 0, leads: 0, reservations: 0 };
  }

  for (const ev of events) {
    const evDate = new Date(ev.timestamp);
    const dateStr = ev.timestamp.split('T')[0];

    if (ev.type === 'page_view') {
      totalVisits++;
      if (dateStr === todayStr) todayVisits++;
      if (evDate >= sevenDaysAgo) last7DaysVisits++;

      // Sources
      const src = ev.utmSource || 'direct';
      sourceCounts[src] = (sourceCounts[src] || 0) + 1;

      // Campagnes
      if (ev.utmCampaign) {
        campaignCounts[ev.utmCampaign] = (campaignCounts[ev.utmCampaign] || 0) + 1;
      }

      if (timelineMap[dateStr]) {
        timelineMap[dateStr].visits++;
      }
    } else if (ev.type === 'initiate_checkout') {
      totalInitiateCheckout++;
    } else if (ev.type === 'lead_quote') {
      totalLeads++;
      if (timelineMap[dateStr]) {
        timelineMap[dateStr].leads++;
      }
    } else if (ev.type === 'group_buy_joined') {
      totalGroupBuyReservations++;
      if (timelineMap[dateStr]) {
        timelineMap[dateStr].reservations++;
      }
    } else if (ev.type === 'whatsapp_click') {
      totalWhatsappClicks++;
    } else if (ev.type === 'phone_click') {
      totalPhoneClicks++;
    }
  }

  // Taux de conversion global (leads + réservations) / visites
  const totalConversions = totalLeads + totalGroupBuyReservations;
  const conversionRate = totalVisits > 0 ? Number(((totalConversions / totalVisits) * 100).toFixed(1)) : 0;

  // Breakdown par source
  const sourcesBreakdown = Object.entries(sourceCounts)
    .map(([source, count]) => ({
      source,
      count,
      percentage: totalVisits > 0 ? Number(((count / totalVisits) * 100).toFixed(1)) : 0
    }))
    .sort((a, b) => b.count - a.count);

  // Breakdown par campagne
  const campaignsBreakdown = Object.entries(campaignCounts)
    .map(([campaign, count]) => ({ campaign, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Timeline des 7 derniers jours
  const eventsTimeline = Object.entries(timelineMap).map(([date, counts]) => ({
    date,
    visits: counts.visits,
    leads: counts.leads,
    reservations: counts.reservations
  }));

  // Funnel de conversion
  const funnel = [
    { step: 'visites', label: '1. Visites de la boutique', count: totalVisits },
    { step: 'initiate_checkout', label: '2. Clics formulaire / engagement', count: totalInitiateCheckout },
    { step: 'leads', label: '3. Devis demandés (Tickets)', count: totalLeads },
    { step: 'group_buys', label: '4. Ventes en groupe rejointes', count: totalGroupBuyReservations },
    { step: 'contacts', label: '5. Clics WhatsApp / Contact', count: totalWhatsappClicks + totalPhoneClicks }
  ];

  return {
    totalVisits,
    todayVisits,
    last7DaysVisits,
    totalLeads,
    totalGroupBuyReservations,
    totalWhatsappClicks,
    totalPhoneClicks,
    conversionRate,
    sourcesBreakdown,
    campaignsBreakdown,
    eventsTimeline,
    funnel,
    recentEvents: events.slice(-30).reverse()
  };
}

export async function getAnalyticsSummaryAsync(): Promise<AnalyticsSummary> {
  try {
    const db = await getDatabase();
    if (db) {
      const doc = await db.collection('analytics').findOne({ _id: 'store_analytics' as any });
      if (doc && Array.isArray(doc.events)) {
        return computeAnalyticsSummary(doc.events);
      }
    }
  } catch (err) {
    console.error('Erreur getAnalyticsSummaryAsync MongoDB:', err);
  }
  return getAnalyticsSummary();
}

export function getAnalyticsSummary(): AnalyticsSummary {
  const data = readAnalyticsData();
  return computeAnalyticsSummary(data.events);
}

export async function resetAnalyticsDataAsync() {
  writeAnalyticsData({ events: [] });
  try {
    const db = await getDatabase();
    if (db) {
      await db.collection('analytics').updateOne(
        { _id: 'store_analytics' as any },
        { $set: { events: [], _id: 'store_analytics' } },
        { upsert: true }
      );
    }
  } catch (e) {
    console.error('Erreur reset analytics MongoDB:', e);
  }
}

export function resetAnalyticsData() {
  writeAnalyticsData({ events: [] });
}
