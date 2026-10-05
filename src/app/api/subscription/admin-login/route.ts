import { NextResponse } from 'next/server';
import { verifyAdminLogin } from '@/lib/subscriptionServer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json({ success: false, error: 'Mot de passe requis' }, { status: 400 });
    }

    const result = verifyAdminLogin(password.trim());

    if (!result.success) {
      return NextResponse.json(result, { status: result.expired ? 403 : 401 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erreur API admin-login:', error);
    return NextResponse.json({ success: false, error: 'Erreur vérification mot de passe' }, { status: 500 });
  }
}
