import { NextRequest, NextResponse } from 'next/server';

// Mock data storage (in real app, this would be in database)
let mockInvoices = [
  {
    id: '1',
    clientId: '1',
    type: 'quotation',
    number: 'QF-123456',
    date: '2024-01-01',
    dueDate: null,
    items: [
      {
        id: '1',
        description: 'طراحی وبسایت',
        quantity: 1,
        unitPrice: 5000000,
        total: 5000000
      }
    ],
    payments: [],
    subtotal: 5000000,
    discount: 0,
    tax: 450000,
    total: 5450000,
    paidAmount: 0,
    remainingAmount: 5450000,
    status: 'draft',
    notes: '',
    terms: '',
    createdAt: '2024-01-01'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const type = searchParams.get('type');
    
    console.log('📋 Fetching invoices...', { clientId, type });

    let filteredInvoices = mockInvoices;

    if (clientId) {
      filteredInvoices = filteredInvoices.filter(invoice => invoice.clientId === clientId);
    }

    if (type) {
      filteredInvoices = filteredInvoices.filter(invoice => invoice.type === type);
    }

    console.log('✅ Invoices fetched successfully:', filteredInvoices.length);

    return NextResponse.json({
      success: true,
      invoices: filteredInvoices
    });

  } catch (error) {
    console.error('❌ Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت فاکتورها' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      clientId,
      type,
      number,
      date,
      dueDate,
      items,
      payments,
      subtotal,
      discount,
      tax,
      total,
      paidAmount,
      remainingAmount,
      notes,
      terms
    } = body;

    console.log('📝 Creating new invoice:', { type, number, clientId });

    // Validate required fields
    if (!clientId || !type || !number || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'اطلاعات ضروری فاکتور ناقص است' },
        { status: 400 }
      );
    }

    // Create new invoice
    const invoice = {
      id: Date.now().toString(),
      clientId,
      type,
      number,
      date,
      dueDate: dueDate || null,
      items,
      payments: payments || [],
      subtotal,
      discount: discount || 0,
      tax: tax || 0,
      total,
      paidAmount: paidAmount || 0,
      remainingAmount: remainingAmount || total,
      status: 'draft',
      notes: notes || '',
      terms: terms || '',
      createdAt: new Date().toISOString().split('T')[0]
    };

    // Add to mock data
    mockInvoices.push(invoice);

    console.log('✅ Invoice created successfully:', invoice);

    return NextResponse.json({
      success: true,
      invoice: {
        id: invoice.id,
        number: invoice.number,
        type: invoice.type,
        total: invoice.total,
        status: invoice.status,
        clientId: invoice.clientId
      }
    });

  } catch (error) {
    console.error('❌ Error creating invoice:', error);
    return NextResponse.json(
      { error: 'خطا در ایجاد فاکتور: ' + (error instanceof Error ? error.message : 'خطای نامشخص') },
      { status: 500 }
    );
  }
}
