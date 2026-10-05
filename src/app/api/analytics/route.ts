import { NextResponse } from 'next/server';
import { getAnalyticsSummary, resetAnalyticsData } from '@/lib/analytics';

export async function GET() {
  try {
    const summary = getAnalyticsSummary();
    return NextResponse.json({ success: true, summary });
  } catch (error) {
    console.error('Erreur API analytics summary:', error);
    return NextResponse.json({ success: false, error: 'Erreur lecture analytics' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    resetAnalyticsData();
    return NextResponse.json({ success: true, message: 'Statistiques réinitialisées' });
  } catch (error) {
    console.error('Erreur reset analytics:', error);
    return NextResponse.json({ success: false, error: 'Erreur reset' }, { status: 500 });
  }
}
