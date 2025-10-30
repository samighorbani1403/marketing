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
  },
  {
    id: '2',
    clientId: '2',
    type: 'invoice',
    number: 'INV-789012',
    date: '2024-01-02',
    dueDate: '2024-01-16',
    items: [
      {
        id: '2',
        description: 'خدمات مشاوره',
        quantity: 10,
        unitPrice: 500000,
        total: 5000000
      }
    ],
    payments: [
      {
        id: '1',
        amount: 2500000,
        method: 'bank_transfer',
        date: '2024-01-05',
        reference: 'REF-001'
      }
    ],
    subtotal: 5000000,
    discount: 0,
    tax: 450000,
    total: 5450000,
    paidAmount: 2500000,
    remainingAmount: 2950000,
    status: 'sent',
    notes: 'پرداخت نقدی',
    terms: 'پرداخت در 14 روز',
    createdAt: '2024-01-02'
  }
];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceId = params.id;
    
    console.log('📋 Fetching invoice:', invoiceId);

    const invoice = mockInvoices.find(i => i.id === invoiceId);

    if (!invoice) {
      return NextResponse.json(
        { error: 'فاکتور یافت نشد' },
        { status: 404 }
      );
    }

    console.log('✅ Invoice fetched successfully:', invoice.number);

    return NextResponse.json({
      success: true,
      invoice
    });

  } catch (error) {
    console.error('❌ Error fetching invoice:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت فاکتور' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceId = params.id;
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
      status,
      notes,
      terms
    } = body;

    console.log('📝 Updating invoice:', { invoiceId, number, type });

    // Find invoice index
    const invoiceIndex = mockInvoices.findIndex(i => i.id === invoiceId);
    
    if (invoiceIndex === -1) {
      return NextResponse.json(
        { error: 'فاکتور یافت نشد' },
        { status: 404 }
      );
    }

    // Update invoice
    mockInvoices[invoiceIndex] = {
      ...mockInvoices[invoiceIndex],
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
      status: status || 'draft',
      notes: notes || '',
      terms: terms || ''
    };

    console.log('✅ Invoice updated successfully:', mockInvoices[invoiceIndex]);

    return NextResponse.json({
      success: true,
      invoice: {
        id: mockInvoices[invoiceIndex].id,
        number: mockInvoices[invoiceIndex].number,
        type: mockInvoices[invoiceIndex].type,
        total: mockInvoices[invoiceIndex].total,
        status: mockInvoices[invoiceIndex].status,
        clientId: mockInvoices[invoiceIndex].clientId
      }
    });

  } catch (error) {
    console.error('❌ Error updating invoice:', error);
    return NextResponse.json(
      { error: 'خطا در ویرایش فاکتور: ' + (error instanceof Error ? error.message : 'خطای نامشخص') },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceId = params.id;
    
    console.log('🗑️ Deleting invoice:', invoiceId);

    // Find invoice index
    const invoiceIndex = mockInvoices.findIndex(i => i.id === invoiceId);
    
    if (invoiceIndex === -1) {
      return NextResponse.json(
        { error: 'فاکتور یافت نشد' },
        { status: 404 }
      );
    }

    // Remove invoice
    const deletedInvoice = mockInvoices[invoiceIndex];
    mockInvoices.splice(invoiceIndex, 1);

    console.log('✅ Invoice deleted successfully:', deletedInvoice.number);

    return NextResponse.json({
      success: true,
      message: 'فاکتور با موفقیت حذف شد',
      deletedInvoice: {
        id: deletedInvoice.id,
        number: deletedInvoice.number,
        type: deletedInvoice.type
      }
    });

  } catch (error) {
    console.error('❌ Error deleting invoice:', error);
    return NextResponse.json(
      { error: 'خطا در حذف فاکتور' },
      { status: 500 }
    );
  }
}
