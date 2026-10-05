import { NextResponse } from 'next/server';
import { 
  readSubscriptionData, 
  superAdminManualGeneratePassword, 
  superAdminExtendDays, 
  superAdminRevokeAccess 
} from '@/lib/subscriptionServer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { masterPassword, action, days } = body;

    const data = readSubscriptionData();

    if (masterPassword !== data.superAdminPassword) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    if (action === 'generate_password') {
      const res = superAdminManualGeneratePassword();
      return NextResponse.json({
        success: true,
        message: 'Nouveau mot de passe généré pour 1 mois (30 jours)',
        newPassword: res.newPassword,
        expiresAt: res.expiresAt
      });
    }

    if (action === 'extend_days') {
      const extensionDays = Number(days) || 30;
      const res = superAdminExtendDays(extensionDays);
      return NextResponse.json({
        success: true,
        message: `Accès administrateur prolongé de ${extensionDays} jours`,
        expiresAt: res.expiresAt,
        daysRemaining: res.daysRemaining
      });
    }

    if (action === 'revoke_access') {
      superAdminRevokeAccess();
      return NextResponse.json({
        success: true,
        message: 'Accès administrateur révoqué immédiatement (marqué comme expiré)'
      });
    }

    return NextResponse.json({ success: false, error: 'Action non reconnue' }, { status: 400 });
  } catch (error) {
    console.error('Erreur action super admin:', error);
    return NextResponse.json({ success: false, error: 'Erreur exécution action' }, { status: 500 });
  }
}
