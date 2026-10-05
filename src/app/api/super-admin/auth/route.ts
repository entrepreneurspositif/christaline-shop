import { NextResponse } from 'next/server';
import { readSubscriptionData } from '@/lib/subscriptionServer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    const data = readSubscriptionData();

    if (password === data.superAdminPassword) {
      return NextResponse.json({
        success: true,
        message: 'Authentification Super Admin réussie'
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Mot de passe Super Admin incorrect'
    }, { status: 401 });
  } catch (error) {
    console.error('Erreur super admin auth:', error);
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}
