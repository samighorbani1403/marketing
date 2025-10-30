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
    sentToManager: false
  }
];

// Mock manager panel data
let managerClients = [];

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clientId = params.id;
    
    console.log('📤 Sending client to manager:', clientId);

    // Find client
    const client = mockClients.find(c => c.id === clientId);
    
    if (!client) {
      return NextResponse.json(
        { error: 'مشتری یافت نشد' },
        { status: 404 }
      );
    }

    // Check if client is already sent to manager
    if (client.sentToManager) {
      return NextResponse.json(
        { error: 'این مشتری قبلاً به مدیر ارسال شده است' },
        { status: 400 }
      );
    }

    // Check if client status is active
    if (client.status !== 'active') {
      return NextResponse.json(
        { error: 'فقط مشتریان فعال قابل ارسال به مدیر هستند' },
        { status: 400 }
      );
    }

    // Add to manager panel
    const managerClient = {
      ...client,
      sentToManager: true,
      status: 'approved',
      sentAt: new Date().toISOString(),
      managerNotes: '',
      managerStatus: 'pending_review'
    };

    managerClients.push(managerClient);

    // Update original client
    const clientIndex = mockClients.findIndex(c => c.id === clientId);
    mockClients[clientIndex] = {
      ...mockClients[clientIndex],
      sentToManager: true,
      status: 'approved'
    };

    console.log('✅ Client sent to manager successfully:', client.name);

    return NextResponse.json({
      success: true,
      message: 'مشتری با موفقیت به پنل مدیر ارسال شد',
      client: {
        id: managerClient.id,
        name: managerClient.name,
        company: managerClient.company,
        status: managerClient.status,
        sentAt: managerClient.sentAt
      }
    });

  } catch (error) {
    console.error('❌ Error sending client to manager:', error);
    return NextResponse.json(
      { error: 'خطا در ارسال مشتری به مدیر' },
      { status: 500 }
    );
  }
}

// Get manager clients (for future manager panel)
export async function GET(request: NextRequest) {
  try {
    console.log('📋 Fetching manager clients...');

    return NextResponse.json({
      success: true,
      clients: managerClients,
      total: managerClients.length
    });

  } catch (error) {
    console.error('❌ Error fetching manager clients:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت مشتریان مدیر' },
      { status: 500 }
    );
  }
}
