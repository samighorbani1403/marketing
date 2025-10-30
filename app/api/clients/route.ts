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

export async function GET(request: NextRequest) {
  try {
    console.log('📋 Fetching clients...');

    console.log('✅ Clients fetched successfully:', mockClients.length);

    return NextResponse.json({
      success: true,
      clients: mockClients
    });

  } catch (error) {
    console.error('❌ Error fetching clients:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت مشتریان' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
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

    console.log('📝 Creating new client:', { name, email, company });

    // Validate required fields
    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'نام مشتری الزامی است' },
        { status: 400 }
      );
    }

    // Create new client
    const client = {
      id: Date.now().toString(),
      name: name.trim(),
      email: email?.trim() || null,
      phone: phone?.trim() || null,
      company: company?.trim() || null,
      city: city?.trim() || null,
      source: source?.trim() || null,
      status: status || 'potential',
      stage: stage || 'lead',
      notes: notes?.trim() || null,
      createdAt: new Date().toISOString().split('T')[0]
    };

    // Add to mock data
    mockClients.push(client);

    console.log('✅ Client created successfully:', client);

    return NextResponse.json({
      success: true,
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
        company: client.company,
        status: client.status,
        stage: client.stage
      }
    });

  } catch (error) {
    console.error('❌ Error creating client:', error);
    return NextResponse.json(
      { error: 'خطا در ایجاد مشتری: ' + (error instanceof Error ? error.message : 'خطای نامشخص') },
      { status: 500 }
    );
  }
}