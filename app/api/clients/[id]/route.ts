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
  },
  {
    id: '3',
    name: 'مشتری قراردادی',
    email: 'contractual@example.com',
    phone: '09123456787',
    company: 'شرکت قراردادی',
    city: 'مشهد',
    source: 'website',
    status: 'contractual',
    stage: 'closed',
    notes: 'مشتری قراردادی بازاریاب',
    createdAt: '2024-01-03',
    sentToManager: true,
    isContractual: true,
    approvalPercentage: 100
  }
];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clientId = params.id;
    
    console.log('📋 Fetching client:', clientId);

    const client = mockClients.find(c => c.id === clientId);

    if (!client) {
      return NextResponse.json(
        { error: 'مشتری یافت نشد' },
        { status: 404 }
      );
    }

    console.log('✅ Client fetched successfully:', client.name);

    return NextResponse.json({
      success: true,
      client
    });

  } catch (error) {
    console.error('❌ Error fetching client:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت مشتری' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clientId = params.id;
    const body = await request.json();
    const { 
      name, 
      email, 
      phone, 
      company, 
      city, 
      source, 
      status, 
      stage, 
      notes 
    } = body;

    console.log('📝 Updating client:', { clientId, name, email });

    // Validate required fields
    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'نام مشتری الزامی است' },
        { status: 400 }
      );
    }

    // Find client index
    const clientIndex = mockClients.findIndex(c => c.id === clientId);
    
    if (clientIndex === -1) {
      return NextResponse.json(
        { error: 'مشتری یافت نشد' },
        { status: 404 }
      );
    }

    // Update client
    mockClients[clientIndex] = {
      ...mockClients[clientIndex],
      name: name.trim(),
      email: email?.trim() || null,
      phone: phone?.trim() || null,
      company: company?.trim() || null,
      city: city?.trim() || null,
      source: source?.trim() || null,
      status: status || 'potential',
      stage: stage || 'lead',
      notes: notes?.trim() || null
    };

    console.log('✅ Client updated successfully:', mockClients[clientIndex]);

    return NextResponse.json({
      success: true,
      client: {
        id: mockClients[clientIndex].id,
        name: mockClients[clientIndex].name,
        email: mockClients[clientIndex].email,
        company: mockClients[clientIndex].company,
        status: mockClients[clientIndex].status,
        stage: mockClients[clientIndex].stage
      }
    });

  } catch (error) {
    console.error('❌ Error updating client:', error);
    return NextResponse.json(
      { error: 'خطا در ویرایش مشتری: ' + (error instanceof Error ? error.message : 'خطای نامشخص') },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clientId = params.id;
    
    console.log('🗑️ Deleting client:', clientId);

    // Find client index
    const clientIndex = mockClients.findIndex(c => c.id === clientId);
    
    if (clientIndex === -1) {
      return NextResponse.json(
        { error: 'مشتری یافت نشد' },
        { status: 404 }
      );
    }

    // Remove client
    const deletedClient = mockClients[clientIndex];
    mockClients.splice(clientIndex, 1);

    console.log('✅ Client deleted successfully:', deletedClient.name);

    return NextResponse.json({
      success: true,
      message: 'مشتری با موفقیت حذف شد',
      deletedClient: {
        id: deletedClient.id,
        name: deletedClient.name
      }
    });

  } catch (error) {
    console.error('❌ Error deleting client:', error);
    return NextResponse.json(
      { error: 'خطا در حذف مشتری' },
      { status: 500 }
    );
  }
}