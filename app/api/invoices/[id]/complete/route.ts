import { NextRequest, NextResponse } from 'next/server';

// Ephemeral endpoint: confirms completion; frontend updates state locally
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceId = params.id;
    return NextResponse.json({ success: true, invoiceId, status: 'paid' });
  } catch (error) {
    console.error('❌ Error completing invoice:', error);
    return NextResponse.json({ error: 'خطا در تکمیل فاکتور' }, { status: 500 });
  }
}


