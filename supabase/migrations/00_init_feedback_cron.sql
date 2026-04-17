-- Enable the pg_cron extension
create extension if not exists pg_cron;

-- Add new columns to feedback table
alter table target_schema.feedback -- (Assumption: replace target_schema with public)
add column if not exists prior_recommendation_source text,
add column if not exists visited_recommended_provider boolean,
add column if not exists language_comfort text check (language_comfort in ('yes', 'partial', 'no'));

-- Create notification log table
create table if not exists public.notification_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  title text,
  body text,
  data jsonb,
  sent_at timestamp with time zone default now()
);

-- We assume triage_sessions has a feedback_sent boolean.
alter table public.triage_sessions
add column if not exists feedback_sent boolean default false;

-- Create pg_cron trigger: run every hour
-- It checks for triage_sessions where provider was recommended > 24 hours ago, and feedback hasn't been sent.
select cron.schedule(
  'invoke-feedback-push',
  '0 * * * *',
  $$
  do $block$
  declare
    r record;
  begin
    for r in
      select id, user_id from public.triage_sessions
      where provider_recommended_at < now() - interval '24 hours'
      and feedback_sent = false
    loop
      -- Call the Edge Function using pg_net (requires pg_net extension)
      -- This requires pg_net extension to be enabled
      perform net.http_post(
          url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/send-notification',
          headers:=jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer YOUR_ANON_KEY'
          ),
          body:=jsonb_build_object(
            'user_id', r.user_id,
            'title', 'Did you get the medical help you needed?',
            'body', 'Tap to share a quick update and help future travelers.',
            'data', jsonb_build_object('screen', 'feedback', 'sessionId', r.id)
          )
      );
      
      -- Mark as sent
      update public.triage_sessions set feedback_sent = true where id = r.id;
    end loop;
  end;
  $block$;
  $$
);
