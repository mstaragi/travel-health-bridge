import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0'

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send'

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Check Server-side IST Quiet Hours
    const now = new Date()
    const utcHours = now.getUTCHours()
    const utcMinutes = now.getUTCMinutes()
    
    let istHours = (utcHours + 5) % 24
    let istMinutes = utcMinutes + 30
    if (istMinutes >= 60) {
      istHours = (istHours + 1) % 24
    }

    // Enforce 10pm - 7am IST quiet hours
    if (istHours >= 22 || istHours < 7) {
      console.log(`Quiet hours in IST (${istHours}:${istMinutes}). Skipping batch.`)
      return new Response(JSON.stringify({ message: 'Quiet hours enforced' }), { status: 200 })
    }

    // 2. Query sessions needing feedback (4-24h old)
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

    const { data: sessions, error: sessionErr } = await supabase
      .from('triage_sessions')
      .select(`
        id,
        user_id,
        feedback_sent,
        recommended_provider:recommended_provider_id (name)
      `)
      .eq('feedback_sent', false)
      .lt('created_at', fourHoursAgo)
      .gt('created_at', twentyFourHoursAgo)
      .not('user_id', 'is', null)

    if (sessionErr) throw sessionErr
    if (!sessions || sessions.length === 0) {
      return new Response(JSON.stringify({ message: 'No sessions pending' }), { status: 200 })
    }

    const messages = []
    const sessionIdsToUpdate = []

    for (const session of sessions) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('expo_push_token, notification_prefs')
        .eq('id', session.user_id)
        .single()

      if (profile?.expo_push_token && profile.notification_prefs?.follow_up) {
        messages.push({
          to: profile.expo_push_token,
          sound: 'default',
          title: 'How was your visit?',
          body: `Help others by sharing your experience at ${session.recommended_provider?.name || 'the clinic'}.`,
          data: { 
            type: 'FEEDBACK', 
            sessionId: session.id,
            url: `/(feedback)/${session.id}` 
          },
        })
        sessionIdsToUpdate.push(session.id)
      }
    }

    // 3. Deliver via Expo
    if (messages.length > 0) {
      const res = await fetch(EXPO_PUSH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(messages),
      })
      
      const resData = await res.json()
      console.log('Expo Response:', resData)

      // 4. Mark as sent to avoid spam
      await supabase
        .from('triage_sessions')
        .update({ feedback_sent: true })
        .in('id', sessionIdsToUpdate)
    }

    return new Response(JSON.stringify({ sent: messages.length }), { status: 200 })

  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }
})
