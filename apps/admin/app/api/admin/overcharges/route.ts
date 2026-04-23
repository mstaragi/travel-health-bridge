import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/admin/overcharges
 * Fetch overcharge reports with status filters
 * Query params: status (pending|approved|rejected), limit, offset
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    let query = supabase
      .from('overcharge_reports')
      .select(
        `
        *,
        provider: providers(id, name, fee_min, fee_max),
        user_id
        `,
        { count: 'exact' }
      );

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      reports: data,
      total: count,
      offset,
      limit,
    });
  } catch (err) {
    console.error('Error fetching overcharge reports:', err);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/overcharges/[id]
 * Approve or reject an overcharge report
 * Body: { report_id, action: 'approve'|'reject', admin_notes }
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { report_id, action, admin_notes } = body;

    if (!report_id || !action) {
      return NextResponse.json(
        { error: 'Missing report_id or action' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Use approve or reject.' },
        { status: 400 }
      );
    }

    const updateData: any = {
      status: action === 'approve' ? 'approved' : 'rejected',
      admin_notes: admin_notes || null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('overcharge_reports')
      .update(updateData)
      .eq('id', report_id)
      .select()
      .single();

    if (error) throw error;

    // If approved, suspend the provider temporarily
    if (action === 'approve') {
      const report = data as any;
      await supabase
        .from('providers')
        .update({
          status: 'suspended',
          suspension_reason: 'Overcharge confirmed by admin',
          suspension_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        })
        .eq('id', report.provider_id);
    }

    return NextResponse.json({
      success: true,
      report: data,
    });
  } catch (err) {
    console.error('Error updating overcharge report:', err);
    return NextResponse.json(
      { error: 'Failed to update report' },
      { status: 500 }
    );
  }
}
