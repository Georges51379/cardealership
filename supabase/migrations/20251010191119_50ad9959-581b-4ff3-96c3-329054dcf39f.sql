-- Allow 'closed' status for auctions
ALTER TABLE public.auctions DROP CONSTRAINT IF EXISTS auctions_status_check;
ALTER TABLE public.auctions ADD CONSTRAINT auctions_status_check 
  CHECK (status = ANY (ARRAY['active'::text, 'inactive'::text, 'closed'::text]));