SELECT cron.schedule(
  'send-reminders-15min',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url:='https://project--419325fd-29d5-4b6b-9511-1f855561c6b8.lovable.app/api/public/hooks/send-reminders',
    headers:='{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpdXpqc3JrdmVjYXd4am92ZGRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwMTM2NjYsImV4cCI6MjA5OTU4OTY2Nn0.RFueW_gYSeWoA4YZ7pLQUl2vGqgiqMcvHcMr186-quk"}'::jsonb,
    body:='{}'::jsonb
  );
  $$
);