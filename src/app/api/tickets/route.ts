import { NextResponse } from 'next/server';
import { getAllTickets, createNewTicket, CreateTicketPayload } from '@/lib/storage';
import { notifyNewTicketTelegram } from '@/lib/telegram';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let tickets = await getAllTickets();

    if (status && status !== 'all') {
      tickets = tickets.filter(t => t.quote.status === status);
    }

    if (search) {
      const q = search.toLowerCase().trim();
      tickets = tickets.filter(t => 
        t.id.toLowerCase().includes(q) ||
        t.client.name.toLowerCase().includes(q) ||
        t.client.phone.includes(q) ||
        t.client.city.toLowerCase().includes(q) ||
        t.items.some(item => item.name.toLowerCase().includes(q) || item.platform.toLowerCase().includes(q))
      );
    }

    return NextResponse.json({ success: true, tickets });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json({ success: false, error: 'Erreur lors de la récupération des tickets' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as CreateTicketPayload;

    if (!body.client || !body.client.name || !body.client.phone) {
      return NextResponse.json(
        { success: false, error: 'Le nom et le numéro de téléphone sont requis.' },
        { status: 400 }
      );
    }

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Veuillez ajouter au moins un produit avec son lien.' },
        { status: 400 }
      );
    }

    // Valider les liens de chaque produit
    for (const item of body.items) {
      if (!item.url || !item.url.trim()) {
        return NextResponse.json(
          { success: false, error: 'Chaque produit doit comporter un lien valide vers Shein, Temu, Alibaba, etc.' },
          { status: 400 }
        );
      }
    }

    const created = await createNewTicket(body);

    // Déclencher l'alerte Telegram en arrière-plan sans bloquer la réponse HTTP
    try {
      const url = new URL(request.url);
      const baseUrl = `${url.protocol}//${url.host}`;
      notifyNewTicketTelegram(created, baseUrl).catch(err => {
        console.error('Erreur notification Telegram ticket:', err);
      });
    } catch (e) {
      // Ignorer
    }

    return NextResponse.json({ success: true, ticket: created }, { status: 201 });
  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json({ success: false, error: 'Erreur lors de la création du ticket' }, { status: 500 });
  }
}
