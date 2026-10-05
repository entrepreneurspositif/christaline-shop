import { NextResponse } from 'next/server';
import { recordAnalyticsEvent, TrackingEventType } from '@/lib/analytics';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, path, referrer, utmSource, utmMedium, utmCampaign, utmContent, utmTerm, metadata, deviceType, sessionId } = body;

    if (!type || !path) {
      return NextResponse.json({ success: false, error: 'Type et path requis' }, { status: 400 });
    }

    const event = recordAnalyticsEvent({
      type: type as TrackingEventType,
      path,
      referrer,
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
      utmTerm,
      metadata,
      deviceType,
      sessionId
    });

    return NextResponse.json({ success: true, event });
  } catch (error) {
    console.error('Erreur API track:', error);
    return NextResponse.json({ success: false, error: 'Erreur enregistrement tracking' }, { status: 500 });
  }
}
