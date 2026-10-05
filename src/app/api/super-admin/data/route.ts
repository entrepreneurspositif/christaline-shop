import { NextResponse } from 'next/server';
import { readSubscriptionData } from '@/lib/subscriptionServer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { masterPassword } = body;

    const data = readSubscriptionData();

    if (masterPassword !== data.superAdminPassword) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    const now = Date.now();
    const expiresAtMs = new Date(data.passwordExpiresAt).getTime();
    const isExpired = now >= expiresAtMs;
    const daysRemaining = Math.max(0, Math.ceil((expiresAtMs - now) / (1000 * 60 * 60 * 24)));

    return NextResponse.json({
      success: true,
      subscription: {
        ...data,
        isExpired,
        daysRemaining
      }
    });
  } catch (error) {
    console.error('Erreur data super admin:', error);
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}
