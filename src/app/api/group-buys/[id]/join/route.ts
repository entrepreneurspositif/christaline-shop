import { NextRequest, NextResponse } from 'next/server';
import { joinGroupBuy } from '@/lib/groupBuyStorage';
import { notifyGroupBuyJoinTelegram } from '@/lib/telegram';

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!body.clientName || !body.whatsapp || !body.city || !body.quantity) {
      return NextResponse.json(
        {
          success: false,
          error: 'Veuillez renseigner votre nom, votre numéro WhatsApp, votre ville et la quantité.'
        },
        { status: 400 }
      );
    }

    const result = await joinGroupBuy(id, {
      clientName: body.clientName,
      whatsapp: body.whatsapp,
      city: body.city,
      quantity: Number(body.quantity),
      variant: body.variant || '',
      notes: body.notes || ''
    });

    // Déclencher l'alerte Telegram pour la réservation de vente en groupe
    try {
      const url = new URL(req.url);
      const baseUrl = `${url.protocol}//${url.host}`;
      notifyGroupBuyJoinTelegram(result.groupBuy, result.participant, result.ticketId, baseUrl).catch(err => {
        console.error('Erreur alerte Telegram vente en groupe:', err);
      });
    } catch (e) {
      // Ignorer
    }

    return NextResponse.json({
      success: true,
      message: 'Votre réservation a été enregistrée avec succès !',
      ticketId: result.ticketId,
      participant: result.participant,
      groupBuy: result.groupBuy
    }, { status: 201 });
  } catch (error: any) {
    console.error('Erreur API POST /api/group-buys/[id]/join:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors de la réservation' },
      { status: 500 }
    );
  }
}
