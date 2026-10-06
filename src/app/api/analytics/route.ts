import { NextResponse } from 'next/server';
import { getAnalyticsSummaryAsync, resetAnalyticsDataAsync } from '@/lib/analytics';

export async function GET() {
  try {
    const summary = await getAnalyticsSummaryAsync();
    return NextResponse.json({ success: true, summary });
  } catch (error) {
    console.error('Erreur API analytics summary:', error);
    return NextResponse.json({ success: false, error: 'Erreur lecture analytics' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await resetAnalyticsDataAsync();
    return NextResponse.json({ success: true, message: 'Statistiques réinitialisées' });
  } catch (error) {
    console.error('Erreur reset analytics:', error);
    return NextResponse.json({ success: false, error: 'Erreur reset' }, { status: 500 });
  }
}
