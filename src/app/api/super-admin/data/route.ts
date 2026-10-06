import { NextResponse } from 'next/server';
import { readSubscriptionDataAsync } from '@/lib/subscriptionServer';
import { getMongoConnectionStatus } from '@/lib/mongodb';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { masterPassword } = body;

    const data = await readSubscriptionDataAsync();

    if (masterPassword !== data.superAdminPassword) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    const now = Date.now();
    const expiresAtMs = new Date(data.passwordExpiresAt).getTime();
    const isExpired = now >= expiresAtMs;
    const daysRemaining = Math.max(0, Math.ceil((expiresAtMs - now) / (1000 * 60 * 60 * 24)));

    const mongoStatus = getMongoConnectionStatus();

    return NextResponse.json({
      success: true,
      subscription: {
        ...data,
        isExpired,
        daysRemaining,
        mongoConfigured: mongoStatus.configured,
        mongoConnected: mongoStatus.connected,
        mongoError: mongoStatus.error,
        mongoUri: process.env.MONGODB_URI || ''
      }
    });
  } catch (error) {
    console.error('Erreur data super admin:', error);
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}
