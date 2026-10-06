import { NextResponse } from 'next/server';
import { getAllTickets } from '@/lib/storage';

export async function GET() {
  try {
    const tickets = await getAllTickets();

    const total = tickets.length;
    const pendingQuote = tickets.filter(t => t.quote.status === 'pending').length;
    const quoteReady = tickets.filter(t => t.quote.status === 'ready' || t.quote.status === 'accepted').length;
    const inTransit = tickets.filter(t => ['paid_deposit', 'ordered', 'in_transit', 'customs', 'ready_for_pickup'].includes(t.quote.status)).length;
    const delivered = tickets.filter(t => t.quote.status === 'delivered').length;

    const totalVolumeCFA = tickets.reduce((sum, t) => sum + (t.quote.grandTotalCFA || 0), 0);
    const totalCollectedCFA = tickets.reduce((sum, t) => sum + (t.quote.depositPaidCFA || 0), 0);
    const totalRemainingCFA = tickets.reduce((sum, t) => sum + (t.quote.balanceRemainingCFA || 0), 0);

    return NextResponse.json({
      success: true,
      stats: {
        total,
        pendingQuote,
        quoteReady,
        inTransit,
        delivered,
        totalVolumeCFA,
        totalCollectedCFA,
        totalRemainingCFA
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ success: false, error: 'Erreur stats' }, { status: 500 });
  }
}
