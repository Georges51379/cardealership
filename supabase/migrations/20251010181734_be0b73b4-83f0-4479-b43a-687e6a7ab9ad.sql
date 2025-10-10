-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Add auction_id to sales_transactions for better tracking
ALTER TABLE sales_transactions 
ADD COLUMN IF NOT EXISTS auction_id UUID REFERENCES auctions(id);

-- Create cron job to automatically close ended auctions every 5 minutes
SELECT cron.schedule(
  'close-ended-auctions',
  '*/5 * * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://wrteaoncoflxevnxwyze.supabase.co/functions/v1/auction-manager',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydGVhb25jb2ZseGV2bnh3eXplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwODUxNTUsImV4cCI6MjA3NTY2MTE1NX0.LUHdAebzILPZl-hHf_NqsXyBY4fCPfdpCDoiLH94-CA'
      ),
      body := '{}'::jsonb
    ) AS request_id;
  $$
);