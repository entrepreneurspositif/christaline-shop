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
        enabled: feexpayConfig.enabled !== undefined ? !!feexpayConfig.enabled : true,
        shopId: feexpayConfig.shopId !== undefined ? String(feexpayConfig.shopId).trim() : data.feexpayConfig.shopId,
        apiToken: feexpayConfig.apiToken !== undefined ? String(feexpayConfig.apiToken).trim() : data.feexpayConfig.apiToken,
        mode: (feexpayConfig.mode === 'LIVE' || feexpayConfig.mode === 'SANDBOX') ? feexpayConfig.mode : data.feexpayConfig.mode,
        callbackUrl: feexpayConfig.callbackUrl !== undefined ? String(feexpayConfig.callbackUrl).trim() : data.feexpayConfig.callbackUrl
      };
    }

    if (newMasterPassword && typeof newMasterPassword === 'string' && newMasterPassword.trim().length >= 4) {
      data.superAdminPassword = newMasterPassword.trim();
    }

    if (body.adminTelegramChatId !== undefined) {
      data.adminTelegramChatId = String(body.adminTelegramChatId).trim();
    }

    if (body.adminTelegramBotToken !== undefined) {
      data.adminTelegramBotToken = String(body.adminTelegramBotToken).trim();
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
