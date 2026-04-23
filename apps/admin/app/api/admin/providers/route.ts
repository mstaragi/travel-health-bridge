import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/admin/providers
 * Fetch providers with filters for admin console
 * Query params: status, city_id, search, limit, offset
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const cityId = searchParams.get('city_id');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    let query = supabase
      .from('providers')
      .select(
        `
        *,
        overcharge_reports: overcharge_reports(count),
        feedback: feedback(count),
        referrals: referrals(count)
        `,
        { count: 'exact' }
      );

    // Apply filters
    if (status) query = query.eq('status', status);
    if (cityId) query = query.eq('city_id', cityId);
    if (search) query = query.ilike('name', `%${search}%`);

    // Pagination
    query = query.order('updated_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      providers: data,
      total: count,
      offset,
      limit,
    });
  } catch (err) {
    console.error('Error fetching providers:', err);
    return NextResponse.json(
      { error: 'Failed to fetch providers' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/providers/[id]
 * Update provider status (suspend/activate), reliability score, etc.
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider_id, status, reliability_score, notes } = body;

    if (!provider_id) {
      return NextResponse.json(
        { error: 'Missing provider_id' },
        { status: 400 }
      );
    }

    const updateData: any = { updated_at: new Date().toISOString() };
    if (status) updateData.status = status;
    if (reliability_score !== undefined) updateData.reliability_score = reliability_score;
    if (notes) updateData.admin_notes = notes;

    const { data, error } = await supabase
      .from('providers')
      .update(updateData)
      .eq('id', provider_id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      provider: data,
    });
  } catch (err) {
    console.error('Error updating provider:', err);
    return NextResponse.json(
      { error: 'Failed to update provider' },
      { status: 500 }
    );
  }
}
