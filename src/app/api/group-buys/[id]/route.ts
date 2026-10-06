import { NextRequest, NextResponse } from 'next/server';
import { getGroupBuyById, updateGroupBuy, deleteGroupBuy } from '@/lib/groupBuyStorage';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const item = await getGroupBuyById(id);

    if (!item) {
      return NextResponse.json(
        { success: false, error: 'Vente en groupe introuvable' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, groupBuy: item });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération de la vente en groupe' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const updates = await req.json();

    const updated = await updateGroupBuy(id, updates);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Vente en groupe introuvable' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, groupBuy: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const deleted = await deleteGroupBuy(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Vente en groupe introuvable ou déjà supprimée' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Vente en groupe supprimée avec succès' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}
