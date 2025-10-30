import { NextRequest, NextResponse } from 'next/server';

// Note: Using ephemeral in-memory behavior; frontend will update state after response

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceId = params.id;
    const body = await request.json();
    const { amount, method = 'cash', date = new Date().toISOString().split('T')[0], reference } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'مبلغ نامعتبر است' }, { status: 400 });
    }

    // Respond with a payment record; client will merge into local state
    const payment = {
      id: Date.now().toString(),
      amount,
      method,
      date,
      reference: reference || null,
    };

    return NextResponse.json({ success: true, payment, invoiceId });
  } catch (error) {
    console.error('❌ Error registering payment:', error);
    return NextResponse.json({ error: 'خطا در ثبت واریز' }, { status: 500 });
  }
}


