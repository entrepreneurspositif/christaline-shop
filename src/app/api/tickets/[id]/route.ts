import { NextResponse } from 'next/server';
import { getTicketById, updateTicket, getAllTickets, saveTickets, createDefaultTimeline } from '@/lib/storage';
import { QuoteStatus, OrderItem, TrackingEvent, STATUS_MAP } from '@/lib/types';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ticket = getTicketById(id);

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
    const ticket = getTicketById(id);

    if (!ticket) {
      return NextResponse.json({ success: false, error: 'Ticket introuvable' }, { status: 404 });
    }

    const body = await request.json();

    // 1. Mise à jour des articles (devis individuel)
    let updatedItems = ticket.items;
    if (body.items && Array.isArray(body.items)) {
      updatedItems = body.items.map((it: Partial<OrderItem> & { id: string }) => {
        const existing = ticket.items.find(e => e.id === it.id);
        if (!existing) return it as OrderItem;

        const unitPriceCFA = typeof it.unitPriceCFA === 'number' ? it.unitPriceCFA : existing.unitPriceCFA;
        const shippingFeeCFA = typeof it.shippingFeeCFA === 'number' ? it.shippingFeeCFA : existing.shippingFeeCFA;
        const serviceFeeCFA = typeof it.serviceFeeCFA === 'number' ? it.serviceFeeCFA : existing.serviceFeeCFA;
        const customsFeeCFA = typeof it.customsFeeCFA === 'number' ? it.customsFeeCFA : existing.customsFeeCFA;
        const quantity = typeof it.quantity === 'number' ? it.quantity : existing.quantity;

        // Calcul du total pour cet article individuel
        const totalItemCFA = (unitPriceCFA * quantity) + shippingFeeCFA + serviceFeeCFA + customsFeeCFA;

        return {
          ...existing,
          ...it,
          unitPriceCFA,
          shippingFeeCFA,
          serviceFeeCFA,
          customsFeeCFA,
          quantity,
          totalItemCFA,
          status: it.status || (unitPriceCFA > 0 ? 'quoted' : existing.status)
        };
      });
    }

    // 2. Mise à jour du devis global
    let updatedQuote = { ...ticket.quote };
    if (body.quote) {
      // Si des articles ont été modifiés, on recalcule les totaux automatiquement sauf si explicitement écrasés
      const subtotalItems = updatedItems.reduce((acc, it) => acc + (it.unitPriceCFA * it.quantity), 0);
      const totalShipping = updatedItems.reduce((acc, it) => acc + it.shippingFeeCFA, 0);
      const totalService = updatedItems.reduce((acc, it) => acc + it.serviceFeeCFA, 0);
      const totalCustoms = updatedItems.reduce((acc, it) => acc + it.customsFeeCFA, 0);
      
      const discount = typeof body.quote.discountCFA === 'number' ? body.quote.discountCFA : ticket.quote.discountCFA;
      const grandTotal = typeof body.quote.grandTotalCFA === 'number' && body.quote.grandTotalCFA > 0
        ? body.quote.grandTotalCFA
        : (subtotalItems + totalShipping + totalService + totalCustoms - discount);

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
        subtotalItemsCFA: subtotalItems,
        totalShippingCFA: totalShipping,
        totalServiceFeeCFA: totalService,
        totalCustomsCFA: totalCustoms,
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

      // Mettre à jour la timeline
      updatedTracking.events = createDefaultTimeline(newStatus, ticket.createdAt);
    }

    if (body.tracking) {
      updatedTracking = {
        ...updatedTracking,
        ...body.tracking,
      };

      if (body.tracking.customEvent) {
        // Ajouter un événement personnalisé à la timeline
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
          location: body.tracking.customEvent.location || 'Hub Christaline',
          completed: true,
          current: true,
        };
        // Marquer les précédents comme non 'current'
        const previousEvents = updatedTracking.events.map(e => ({ ...e, current: false }));
        updatedTracking.events = [...previousEvents, customEv];
      }
    }

    // Mise à jour finale
    const updated = updateTicket(id, {
      items: updatedItems,
      quote: updatedQuote,
      tracking: updatedTracking,
      client: body.client ? { ...ticket.client, ...body.client } : ticket.client,
    });

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
    const tickets = getAllTickets();
    const filtered = tickets.filter(t => t.id.toUpperCase() !== id.trim().toUpperCase());

    if (filtered.length === tickets.length) {
      return NextResponse.json({ success: false, error: 'Ticket non trouvé' }, { status: 404 });
    }

    saveTickets(filtered);
    return NextResponse.json({ success: true, message: 'Ticket supprimé' });
  } catch (error) {
    console.error('Error deleting ticket:', error);
    return NextResponse.json({ success: false, error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}
