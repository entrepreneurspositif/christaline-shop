import { NextResponse } from 'next/server';
import { getTicketById, updateTicket, deleteTicket, createDefaultTimeline } from '@/lib/storage';
import { QuoteStatus, OrderItem, TrackingEvent, STATUS_MAP } from '@/lib/types';
import { notifyTicketStatusUpdateTelegram } from '@/lib/telegram';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ticket = await getTicketById(id);

    if (!ticket) {
      return NextResponse.json({ success: false, error: 'Ticket introuvable' }, { status: 404 });
    }

    return NextResponse.json({ success: true, ticket });
  } catch (error) {
    console.error('Error getting ticket:', error);
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ticket = await getTicketById(id);

    if (!ticket) {
      return NextResponse.json({ success: false, error: 'Ticket introuvable' }, { status: 404 });
    }

    const body = await request.json();

    // 1. Mise à jour des articles
    let updatedItems = ticket.items;
    if (body.items && Array.isArray(body.items)) {
      updatedItems = body.items.map((it: Partial<OrderItem> & { id: string }) => {
        const existing = ticket.items.find(e => e.id === it.id);
        if (!existing) return it as OrderItem;

        const quantity = typeof it.quantity === 'number' && it.quantity > 0 ? it.quantity : existing.quantity;
        const unitPriceCFA = typeof it.unitPriceCFA === 'number' ? it.unitPriceCFA : existing.unitPriceCFA;
        const shippingFeeCFA = typeof it.shippingFeeCFA === 'number' ? it.shippingFeeCFA : (existing.shippingFeeCFA || 0);
        const serviceFeeCFA = typeof it.serviceFeeCFA === 'number' ? it.serviceFeeCFA : (existing.serviceFeeCFA || 0);
        const customsFeeCFA = typeof it.customsFeeCFA === 'number' ? it.customsFeeCFA : (existing.customsFeeCFA || 0);

        // Si l'admin a renseigné directement le prix total de l'article, on le prend en priorité
        let totalItemCFA: number;
        if (typeof it.totalItemCFA === 'number' && it.totalItemCFA > 0) {
          totalItemCFA = it.totalItemCFA;
        } else if (unitPriceCFA > 0) {
          totalItemCFA = (unitPriceCFA * quantity) + shippingFeeCFA + serviceFeeCFA + customsFeeCFA;
        } else {
          totalItemCFA = existing.totalItemCFA || 0;
        }

        return {
          ...existing,
          ...it,
          quantity,
          unitPriceCFA: unitPriceCFA || totalItemCFA,
          shippingFeeCFA,
          serviceFeeCFA,
          customsFeeCFA,
          totalItemCFA,
          status: it.status || (totalItemCFA > 0 ? 'quoted' : existing.status)
        };
      });
    }

    // 2. Mise à jour du devis global
    let updatedQuote = { ...ticket.quote };
    if (body.quote) {
      const itemsSum = updatedItems.reduce((acc, it) => acc + (it.totalItemCFA || 0), 0);
      const discount = typeof body.quote.discountCFA === 'number' ? body.quote.discountCFA : (ticket.quote.discountCFA || 0);
      
      const grandTotal = typeof body.quote.grandTotalCFA === 'number' && body.quote.grandTotalCFA > 0
        ? body.quote.grandTotalCFA
        : Math.max(0, itemsSum - discount);

      const depositRequired = typeof body.quote.depositRequiredCFA === 'number' 
        ? body.quote.depositRequiredCFA 
        : (ticket.quote.depositRequiredCFA || Math.round(grandTotal * 0.6));

      const depositPaid = typeof body.quote.depositPaidCFA === 'number' 
        ? body.quote.depositPaidCFA 
        : ticket.quote.depositPaidCFA;

      const balanceRemaining = Math.max(0, grandTotal - depositPaid);

      updatedQuote = {
        ...updatedQuote,
        ...body.quote,
        subtotalItemsCFA: itemsSum,
        discountCFA: discount,
        grandTotalCFA: grandTotal,
        depositRequiredCFA: depositRequired,
        depositPaidCFA: depositPaid,
        balanceRemainingCFA: balanceRemaining,
        quotedAt: updatedQuote.quotedAt || new Date().toISOString()
      };
    }

    // 3. Mise à jour du statut & du suivi colis
    let updatedTracking = { ...ticket.tracking };
    const newStatus: QuoteStatus | undefined = body.status || body.quote?.status;

    if (newStatus && newStatus !== ticket.quote.status) {
      updatedQuote.status = newStatus;
      updatedTracking.currentStatus = newStatus;
      updatedTracking.statusLabel = STATUS_MAP[newStatus]?.label || newStatus;
      updatedTracking.events = createDefaultTimeline(newStatus, ticket.createdAt);
    }

    if (body.tracking) {
      updatedTracking = {
        ...updatedTracking,
        ...body.tracking,
      };

      if (body.tracking.customEvent) {
        const customEv: TrackingEvent = {
          id: `ev-${Date.now()}`,
          title: body.tracking.customEvent.title,
          description: body.tracking.customEvent.description,
          date: new Date().toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          location: body.tracking.customEvent.location || 'Hub Cotonou',
          completed: true,
          current: true,
        };
        const previousEvents = updatedTracking.events.map(e => ({ ...e, current: false }));
        updatedTracking.events = [...previousEvents, customEv];
      }
    }

    const updated = await updateTicket(id, {
      items: updatedItems,
      quote: updatedQuote,
      tracking: updatedTracking,
      client: body.client ? { ...ticket.client, ...body.client } : ticket.client,
    });

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Échec de la mise à jour' }, { status: 500 });
    }

    // Déclencher notification Telegram si le statut ou l'acompte a changé
    try {
      const statusChanged = updated.quote.status !== ticket.quote.status;
      const depositChanged = updated.quote.depositPaidCFA !== ticket.quote.depositPaidCFA;
      if (statusChanged || depositChanged) {
        const url = new URL(request.url);
        const baseUrl = `${url.protocol}//${url.host}`;
        notifyTicketStatusUpdateTelegram(updated, ticket.quote.status, updated.quote.status, baseUrl).catch(err => {
          console.error('Erreur alerte Telegram status ticket:', err);
        });
      }
    } catch (e) {
      // Ignorer
    }

    return NextResponse.json({ success: true, ticket: updated });
  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json({ success: false, error: 'Erreur lors de la mise à jour' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await deleteTicket(id);

    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Ticket non trouvé' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Ticket supprimé' });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    return NextResponse.json({ success: false, error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}
