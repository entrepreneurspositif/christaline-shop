import { NextResponse } from 'next/server';
import { AppSettings } from '@/lib/settings';
import { getSettingsAsync, saveSettingsAsync } from '@/lib/settingsServer';

export async function GET() {
  try {
    const settings = await getSettingsAsync();
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ success: false, error: 'Erreur paramètres' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Partial<AppSettings>;
    const current = await getSettingsAsync();
    const updated: AppSettings = {
      ...current,
      ...body,
      paymentInstructions: {
        ...current.paymentInstructions,
        ...(body.paymentInstructions || {})
      },
      telegram: {
        ...current.telegram,
        ...(body.telegram || {})
      },
      marketing: {
        facebookPixel: {
          ...current.marketing?.facebookPixel,
          ...(body.marketing?.facebookPixel || {})
        },
        tiktokPixel: {
          ...current.marketing?.tiktokPixel,
          ...(body.marketing?.tiktokPixel || {})
        },
        googleAnalytics: {
          ...current.marketing?.googleAnalytics,
          ...(body.marketing?.googleAnalytics || {})
        }
      }
    };
    await saveSettingsAsync(updated);
    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ success: false, error: 'Erreur sauvegarde paramètres' }, { status: 500 });
  }
}
