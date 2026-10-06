import { NextResponse } from 'next/server';
import { readSubscriptionData } from '@/lib/subscriptionServer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    const data = readSubscriptionData();

    // Bloquer formellement le mot de passe Admin de la boutique sur le Super Admin
    if (password && password.trim() === data.activeAdminPassword) {
      return NextResponse.json({
        success: false,
        error: "Accès refusé : Ce mot de passe est un accès Administrateur boutique (/admin). L'administrateur n'a pas l'autorisation d'accéder au tableau de bord Super Admin."
      }, { status: 403 });
    }

    if (password && password.trim() === data.superAdminPassword) {
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
