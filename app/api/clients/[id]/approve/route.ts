import { NextRequest, NextResponse } from 'next/server';

// Mock data storage (in real app, this would be in database)
let mockClients = [
  {
    id: '1',
    name: 'مشتری تست',
    email: 'test@example.com',
    phone: '09123456789',
    company: 'شرکت تست',
    city: 'تهران',
    source: 'website',
    status: 'active',
    stage: 'lead',
    notes: 'مشتری تست',
    createdAt: '2024-01-01',
    sentToManager: false,
    isContractual: false,
    approvalPercentage: 0
  },
  {
    id: '2',
    name: 'مشتری نمونه',
    email: 'sample@example.com',
    phone: '09123456788',
    company: 'شرکت نمونه',
    city: 'اصفهان',
    source: 'referral',
    status: 'potential',
    stage: 'qualified',
    notes: 'مشتری نمونه برای تست',
    createdAt: '2024-01-02',
    sentToManager: false,
    isContractual: false,
    approvalPercentage: 0
  }
];

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clientId = params.id;
    
    console.log('✅ Approving client:', clientId);

    // Find client
    const client = mockClients.find(c => c.id === clientId);
    
    if (!client) {
      return NextResponse.json(
        { error: 'مشتری یافت نشد' },
        { status: 404 }
      );
    }

    // Check if client is already contractual
    if (client.isContractual) {
      return NextResponse.json(
        { error: 'این مشتری قبلاً به عنوان مشتری قراردادی بازاریاب تأیید شده است' },
        { status: 400 }
      );
    }

    // Check if client status is active
    if (client.status !== 'active') {
      return NextResponse.json(
        { error: 'فقط مشتریان فعال قابل تأیید هستند' },
        { status: 400 }
      );
    }

    // Update client to contractual
    const clientIndex = mockClients.findIndex(c => c.id === clientId);
    mockClients[clientIndex] = {
      ...mockClients[clientIndex],
      isContractual: true,
      approvalPercentage: 100,
      status: 'contractual',
      approvedAt: new Date().toISOString()
    };

    console.log('✅ Client approved successfully:', client.name);

    return NextResponse.json({
      success: true,
      message: 'مشتری با موفقیت تأیید شد و به لیست مشتریان قراردادی بازاریاب منتقل شد',
      client: {
        id: mockClients[clientIndex].id,
        name: mockClients[clientIndex].name,
        company: mockClients[clientIndex].company,
        status: mockClients[clientIndex].status,
        isContractual: mockClients[clientIndex].isContractual,
        approvalPercentage: mockClients[clientIndex].approvalPercentage
      }
    });

  } catch (error) {
    console.error('❌ Error approving client:', error);
    return NextResponse.json(
      { error: 'خطا در تأیید مشتری' },
      { status: 500 }
    );
  }
}
