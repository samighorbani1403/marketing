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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id;

    console.log('📋 Fetching campaign:', campaignId);

    const campaign = mockCampaigns.find(c => c.id === campaignId);

    if (!campaign) {
      return NextResponse.json(
        { error: 'کمپین یافت نشد' },
        { status: 404 }
      );
    }

    console.log('✅ Campaign fetched successfully:', campaign.name);

    return NextResponse.json({
      success: true,
      campaign: {
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
      }
    });

  } catch (error) {
    console.error('❌ Error fetching campaign:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت کمپین' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id;
    const body = await request.json();
    const {
      name,
      type,
      budget,
      startDate,
      endDate,
      description,
      targetAudience,
      objectives,
      status
    } = body;

    console.log('📝 Updating campaign:', { campaignId, name, type, budget });

    const campaignIndex = mockCampaigns.findIndex(c => c.id === campaignId);

    if (campaignIndex === -1) {
      return NextResponse.json(
        { error: 'کمپین یافت نشد' },
        { status: 404 }
      );
    }

    // Update campaign
    mockCampaigns[campaignIndex] = {
      ...mockCampaigns[campaignIndex],
      name,
      type,
      budget: parseInt(budget),
      startDate,
      endDate: endDate || null,
      description: description || null,
      targetAudience: targetAudience || null,
      objectives: objectives || null,
      status
    };

    console.log('✅ Campaign updated successfully:', mockCampaigns[campaignIndex].name);

    return NextResponse.json({
      success: true,
      campaign: {
        id: mockCampaigns[campaignIndex].id,
        name: mockCampaigns[campaignIndex].name,
        clientName: mockCampaigns[campaignIndex].clientName,
        type: mockCampaigns[campaignIndex].type,
        status: mockCampaigns[campaignIndex].status,
        budget: mockCampaigns[campaignIndex].budget
      }
    });

  } catch (error) {
    console.error('❌ Error updating campaign:', error);
    return NextResponse.json(
      { error: 'خطا در ویرایش کمپین' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id;

    console.log('🗑️ Deleting campaign:', campaignId);

    const campaignIndex = mockCampaigns.findIndex(c => c.id === campaignId);

    if (campaignIndex === -1) {
      return NextResponse.json(
        { error: 'کمپین یافت نشد' },
        { status: 404 }
      );
    }

    const deletedCampaign = mockCampaigns[campaignIndex];
    mockCampaigns.splice(campaignIndex, 1);

    console.log('✅ Campaign deleted successfully:', deletedCampaign.name);

    return NextResponse.json({
      success: true,
      message: 'کمپین با موفقیت حذف شد'
    });

  } catch (error) {
    console.error('❌ Error deleting campaign:', error);
    return NextResponse.json(
      { error: 'خطا در حذف کمپین' },
      { status: 500 }
    );
  }
}
