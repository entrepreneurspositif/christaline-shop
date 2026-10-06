import { NextRequest, NextResponse } from 'next/server';
import { getAllGroupBuys, createGroupBuy } from '@/lib/groupBuyStorage';

export async function GET(req: NextRequest) {
  try {
    const items = await getAllGroupBuys();
    return NextResponse.json({ success: true, count: items.length, groupBuys: items });
  } catch (error: any) {
    console.error('Erreur API GET /api/group-buys:', error);
    return NextResponse.json(
      { success: false, error: 'Impossible de récupérer les ventes en groupe' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.title || !body.priceCFA || !body.minQuantity || !body.orderDate) {
      return NextResponse.json(
        {
          success: false,
          error: 'Les champs Titre, Prix FCFA, Quantité minimum et Date de commande sont obligatoires.'
        },
        { status: 400 }
      );
    }

    const newItem = await createGroupBuy({
      title: body.title,
      description: body.description || '',
      imageUrl: body.imageUrl || '',
      priceCFA: Number(body.priceCFA),
      originalPriceCFA: body.originalPriceCFA ? Number(body.originalPriceCFA) : undefined,
      minQuantity: Number(body.minQuantity),
      orderDate: body.orderDate,
      shippingMode: body.shippingMode === 'sea' ? 'sea' : 'air',
      platform: body.platform || 'shein',
      variants: Array.isArray(body.variants) ? body.variants : (body.variants ? body.variants.split(',').map((v: string) => v.trim()).filter(Boolean) : []),
      status: body.status || 'open'
    });

    return NextResponse.json({ success: true, groupBuy: newItem }, { status: 201 });
  } catch (error: any) {
    console.error('Erreur API POST /api/group-buys:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors de la création de la vente en groupe' },
      { status: 500 }
    );
  }
}
