import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface PushPayload {
  user_id: string;
  title: string;
  body: string;
  data: {
    screen: string;
    params?: any;
    [key: string]: any;
  }
}

serve(async (req) => {
  try {
    const payload: PushPayload = await req.json()
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // 1. Fetch user Expo Push Token
    const { data: profile, error: profileErr } = await supabaseClient
      .from('user_profiles')
      .select('expo_push_token')
      .eq('id', payload.user_id)
      .single()

    if (profileErr || !profile?.expo_push_token) {
      throw new Error(`Push token not found for user ${payload.user_id}`)
    }

    // 2. Post to Expo Push API
    const expoRes = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: profile.expo_push_token,
        sound: 'default',
        title: payload.title,
        body: payload.body,
        data: payload.data,
      })
    })

    const expoReceipt = await expoRes.json()

    // 3. Log to notification_log
    await supabaseClient.from('notification_log').insert({
      user_id: payload.user_id,
      title: payload.title,
      body: payload.body,
      data: payload.data
    })

    return new Response(
      JSON.stringify({ success: true, receipt: expoReceipt }),
      { headers: { "Content-Type": "application/json" } },
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { "Content-Type": "application/json" }, status: 400 },
    )
  }
})
