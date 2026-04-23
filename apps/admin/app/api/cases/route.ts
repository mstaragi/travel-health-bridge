import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Service role for server-side operations
);

/**
 * POST /api/cases
 * Create a new case for admin investigation
 * Endpoint: Log case | Save case | Report overcharge escalation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { provider_id, user_id, case_summary, severity = 'medium', status = 'open' } = body;

    // Validation
    if (!provider_id || !case_summary) {
      return NextResponse.json(
        { error: 'Missing required fields: provider_id, case_summary' },
        { status: 400 }
      );
    }

    // Insert case into Supabase
    const { data, error } = await supabase
      .from('cases')
      .insert({
        provider_id,
        user_id: user_id || null,
        case_summary,
        severity,
        status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to create case' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, case: data }, { status: 201 });
  } catch (err) {
    console.error('API error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/cases?status=open&limit=50
 * Fetch cases with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'open';
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    let query = supabase
      .from('cases')
      .select('*', { count: 'exact' })
      .eq('status', status)
      .order('created_at', { ascending: false })
      .limit(limit);

    const { data, count, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch cases' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, cases: data, total: count });
  } catch (err) {
    console.error('API error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
