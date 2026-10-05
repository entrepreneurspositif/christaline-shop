import { NextResponse } from 'next/server';
import { AppSettings } from '@/lib/settings';
import { getSettings, saveSettings } from '@/lib/settingsServer';

export async function GET() {
  try {
    const settings = getSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ success: false, error: 'Erreur paramètres' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Partial<AppSettings>;
    const current = getSettings();
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
      }
    };
    saveSettings(updated);
    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ success: false, error: 'Erreur sauvegarde paramètres' }, { status: 500 });
  }
}
