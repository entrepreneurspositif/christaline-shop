import { NextResponse } from 'next/server';
import { getPublicSubscriptionStatusAsync } from '@/lib/subscriptionServer';

export async function GET() {
  try {
    const status = await getPublicSubscriptionStatusAsync();
    return NextResponse.json({ success: true, status });
  } catch (error) {
    console.error('Erreur API subscription status:', error);
    return NextResponse.json({ success: false, error: 'Erreur lecture statut' }, { status: 500 });
  }
}
