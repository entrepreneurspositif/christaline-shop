import { NextResponse } from 'next/server';
import { getAllDeliveredOrders, createDeliveredOrder, resetToDefaultDeliveredOrders } from '@/lib/deliveredOrdersStorage';

export async function GET() {
  try {
    const orders = await getAllDeliveredOrders();
    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    console.error('Erreur GET /api/delivered-orders:', error);
    return NextResponse.json({ success: false, error: 'Erreur chargement colis reçus' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.action === 'reset_default') {
      const orders = await resetToDefaultDeliveredOrders();
      return NextResponse.json({ success: true, message: 'Réinitialisé aux exemples d’origine', orders });
    }

    const {
      clientName,
      location,
      platform,
      shippingMode,
      transitDays,
      deliveryDate,
      title,
      itemsSummary,
      rating,
      review,
      imageUrl,
      ticketId
    } = body;

    if (!clientName?.trim() || !title?.trim() || !imageUrl?.trim()) {
      return NextResponse.json({ 
        success: false, 
        error: 'Nom du client, titre et photo requis.' 
      }, { status: 400 });
    }

    const newOrder = await createDeliveredOrder({
      clientName: clientName.trim(),
      location: location?.trim() || 'Cotonou, Bénin',
      platform: platform || 'Shein',
      shippingMode: shippingMode === 'sea' ? 'sea' : 'air',
      transitDays: Number(transitDays) > 0 ? Number(transitDays) : 18,
      deliveryDate: deliveryDate?.trim() || 'Récemment livré',
      title: title.trim(),
      itemsSummary: itemsSummary?.trim() || title.trim(),
      rating: Number(rating) >= 1 && Number(rating) <= 5 ? Number(rating) : 5,
      review: review?.trim() || 'Commande bien reçue et conforme aux attentes !',
      imageUrl: imageUrl.trim(),
      ticketId: ticketId?.trim() ? ticketId.trim().toUpperCase() : `CS-${Math.floor(100000 + Math.random() * 900000)}`,
      verified: true
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Colis reçu ajouté à la galerie avec succès !', 
      order: newOrder 
    });
  } catch (error: any) {
    console.error('Erreur POST /api/delivered-orders:', error);
    return NextResponse.json({ 
      success: false, 
      error: error?.message || 'Erreur lors de l’ajout du colis reçu' 
    }, { status: 500 });
  }
}
