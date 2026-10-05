import { NextResponse } from 'next/server';
import { testTelegramConnection } from '@/lib/telegram';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { botToken, chatId } = body;

    if (!botToken || !chatId) {
      return NextResponse.json(
        { success: false, error: 'Le Bot Token et le Chat ID sont obligatoires pour effectuer le test.' },
        { status: 400 }
      );
    }

    const result = await testTelegramConnection(botToken, chatId);
    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error: any) {
    console.error('Erreur API /api/telegram/test:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors du test de connexion' },
      { status: 500 }
    );
  }
}
