import { NextRequest, NextResponse } from 'next/server';

// Mock data storage (in real app, this would be in database)
let mockCampaigns = [
  {
    id: '1',
    name: 'کمپین ایمیل بازاریابی',
    clientId: '1',
    clientName: 'مشتری تست',
    type: 'email',
    status: 'active',
    budget: 5000000,
    startDate: '2024-01-15',
    endDate: '2024-02-15',
    description: 'کمپین ایمیل برای معرفی محصولات جدید',
    targetAudience: 'مشتریان موجود و بالقوه',
    objectives: 'افزایش فروش و آگاهی از برند',
    metrics: {
      impressions: 10000,
      clicks: 500,
      conversions: 50,
      cost: 2500000
    },
    createdAt: '2024-01-10'
  },
  {
    id: '2',
    name: 'کمپین پیامک تبلیغاتی',
    clientId: '2',
    clientName: 'مشتری نمونه',
    type: 'sms',
    status: 'draft',
    budget: 2000000,
    startDate: '2024-02-01',
    endDate: '2024-02-28',
    description: 'کمپین پیامک برای اطلاع‌رسانی تخفیفات',
    targetAudience: 'مشتریان ثبت‌نام شده',
    objectives: 'افزایش بازدید از فروشگاه',
    metrics: {
      impressions: 0,
      clicks: 0,
      conversions: 0,
      cost: 0
    },
    createdAt: '2024-01-20'
  },
  {
    id: '3',
    name: 'کمپین شبکه‌های اجتماعی',
    clientId: '3',
    clientName: 'مشتری قراردادی',
    type: 'social',
    status: 'completed',
    budget: 8000000,
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    description: 'کمپین تبلیغاتی در اینستاگرام و تلگرام',
    targetAudience: 'جوانان 18-35 سال',
    objectives: 'افزایش فالوور و تعامل',
    metrics: {
      impressions: 50000,
      clicks: 2500,
      conversions: 200,
      cost: 6000000
    },
    createdAt: '2023-12-25'
  },
  {
    id: '4',
    name: 'کمپین تلفنی فروش',
    clientId: '1',
    clientName: 'مشتری تست',
    type: 'phone',
    status: 'paused',
    budget: 3000000,
    startDate: '2024-01-20',
    endDate: '2024-02-20',
    description: 'تماس تلفنی مستقیم با مشتریان',
    targetAudience: 'لیست مشتریان VIP',
    objectives: 'فروش مستقیم و رزرو جلسات',
    metrics: {
      impressions: 1000,
      clicks: 0,
      conversions: 25,
      cost: 1500000
    },
    createdAt: '2024-01-15'
  }
];

export async function GET(request: NextRequest) {
  try {
    console.log('📋 Fetching campaigns...');

    const campaigns = mockCampaigns.map(campaign => ({
      id: campaign.id,
      name: campaign.name,
      clientId: campaign.clientId,
      clientName: campaign.clientName,
      type: campaign.type,
      status: campaign.status,
      budget: campaign.budget,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      description: campaign.description,
      targetAudience: campaign.targetAudience,
      objectives: campaign.objectives,
      metrics: campaign.metrics,
      createdAt: campaign.createdAt
    }));

    console.log('✅ Campaigns fetched successfully:', campaigns.length);

    return NextResponse.json({
      success: true,
      campaigns
    });

  } catch (error) {
    console.error('❌ Error fetching campaigns:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت کمپین‌ها' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      clientId,
      type,
      budget,
      startDate,
      endDate,
      description,
      targetAudience,
      objectives,
      status = 'draft'
    } = body;

    console.log('📝 Creating new campaign:', { name, clientId, type, budget });

    // Basic validation
    if (!name || !clientId || !type || !startDate) {
      return NextResponse.json(
        { error: 'نام، مشتری، نوع و تاریخ شروع الزامی است' },
        { status: 400 }
      );
    }
    const parsedBudget = parseInt(budget);
    if (isNaN(parsedBudget) || parsedBudget < 0) {
      return NextResponse.json(
        { error: 'بودجه نامعتبر است' },
        { status: 400 }
      );
    }

    // Find client name
    const clientName = 'مشتری جدید'; // In real app, fetch from clients API

    // Create campaign
    const newCampaign = {
      id: (mockCampaigns.length + 1).toString(),
      name,
      clientId,
      clientName,
      type,
      status,
      budget: parsedBudget,
      startDate,
      endDate: endDate || null,
      description: description || null,
      targetAudience: targetAudience || null,
      objectives: objectives || null,
      metrics: {
        impressions: 0,
        clicks: 0,
        conversions: 0,
        cost: 0
      },
      createdAt: new Date().toISOString().split('T')[0]
    };

    mockCampaigns.push(newCampaign);

    console.log('✅ Campaign created successfully:', newCampaign);

    return NextResponse.json({
      success: true,
      campaign: {
        id: newCampaign.id,
        name: newCampaign.name,
        clientName: newCampaign.clientName,
        type: newCampaign.type,
        status: newCampaign.status,
        budget: newCampaign.budget
      }
    });

  } catch (error) {
    console.error('❌ Error creating campaign:', error);
    return NextResponse.json(
      { error: 'خطا در ایجاد کمپین' },
      { status: 500 }
    );
  }
}
