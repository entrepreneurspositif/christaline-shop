import { NextResponse } from 'next/server';
import { updateDeliveredOrder, deleteDeliveredOrder } from '@/lib/deliveredOrdersStorage';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await updateDeliveredOrder(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Colis introuvable' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Colis mis à jour', order: updated });
  } catch (error: any) {
    console.error('Erreur PUT /api/delivered-orders/[id]:', error);
    return NextResponse.json({ success: false, error: 'Erreur mise à jour colis' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ok = await deleteDeliveredOrder(id);
    if (!ok) {
      return NextResponse.json({ success: false, error: 'Colis introuvable' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Colis supprimé de la galerie' });
  } catch (error: any) {
    console.error('Erreur DELETE /api/delivered-orders/[id]:', error);
    return NextResponse.json({ success: false, error: 'Erreur suppression colis' }, { status: 500 });
  }
}
