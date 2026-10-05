import { NextResponse } from 'next/server';
import { readSubscriptionData, writeSubscriptionData } from '@/lib/subscriptionServer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { masterPassword, monthlyFeeCFA, feexpayConfig, newMasterPassword } = body;

    const data = readSubscriptionData();

    if (masterPassword !== data.superAdminPassword) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    if (monthlyFeeCFA !== undefined && Number(monthlyFeeCFA) > 0) {
      data.monthlyFeeCFA = Number(monthlyFeeCFA);
    }

    if (feexpayConfig) {
      data.feexpayConfig = {
        ...data.feexpayConfig,
        ...feexpayConfig
      };
    }

    if (newMasterPassword && typeof newMasterPassword === 'string' && newMasterPassword.trim().length >= 4) {
      data.superAdminPassword = newMasterPassword.trim();
    }

    writeSubscriptionData(data);

    return NextResponse.json({
      success: true,
      message: 'Paramètres mis à jour avec succès',
      subscription: data
    });
  } catch (error) {
    console.error('Erreur update super admin:', error);
    return NextResponse.json({ success: false, error: 'Erreur mise à jour' }, { status: 500 });
  }
}
