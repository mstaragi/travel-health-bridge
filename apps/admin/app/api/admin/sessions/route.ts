import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/admin/sessions
 * Fetch triage sessions with joined feedback data
 * Query params: city_id, date_from, date_to, limit, offset
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cityId = searchParams.get('city_id');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    let query = supabase
      .from('triage_sessions')
      .select(
        `
        *,
        feedback: feedback(
          id,
          prior_recommendation_source,
          visited,
          visited_recommended_provider,
          cost_accurate,
          star_rating,
          language_comfort,
          reuse_intent,
          notes,
          created_at
        )
        `,
        { count: 'exact' }
      );

    if (cityId) query = query.eq('city_id', cityId);

    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }
    if (dateTo) {
      query = query.lte('created_at', dateTo);
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      sessions: data,
      total: count,
      offset,
      limit,
    });
  } catch (err) {
    console.error('Error fetching sessions:', err);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/sessions/search
 * Advanced search with multiple filters
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      city_id,
      urgency,
      language,
      date_from,
      date_to,
      has_feedback,
      limit = 50,
      offset = 0,
    } = body;

    let query = supabase
      .from('triage_sessions')
      .select('*', { count: 'exact' });

    if (city_id) query = query.eq('city_id', city_id);
    if (urgency) query = query.eq('urgency', urgency);
    if (language) query = query.contains('languages', [language]);

    if (date_from) query = query.gte('created_at', date_from);
    if (date_to) query = query.lte('created_at', date_to);

    if (has_feedback !== undefined) {
      if (has_feedback) {
        query = query.not('feedback_submitted_at', 'is', null);
      } else {
        query = query.is('feedback_submitted_at', null);
      }
    }

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      sessions: data,
      total: count,
      offset,
      limit,
    });
  } catch (err) {
    console.error('Error searching sessions:', err);
    return NextResponse.json(
      { error: 'Failed to search sessions' },
      { status: 500 }
    );
  }
}
