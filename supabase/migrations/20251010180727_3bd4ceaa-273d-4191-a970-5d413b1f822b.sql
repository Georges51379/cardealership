-- ============================================
-- PHASE 1: Database Security & Validation
-- ============================================

-- 1. Create function to validate minimum bid increment ($100)
CREATE OR REPLACE FUNCTION validate_bid_amount()
RETURNS TRIGGER AS $$
DECLARE
  current_highest NUMERIC;
  min_increment NUMERIC := 100; -- $100 minimum increment
  auction_current NUMERIC;
BEGIN
  -- Get current highest bid for this auction
  SELECT COALESCE(MAX(bid_amount), 0) INTO current_highest
  FROM bids
  WHERE auction_id = NEW.auction_id;
  
  -- Get auction's starting bid
  SELECT current_bid INTO auction_current
  FROM auctions
  WHERE id = NEW.auction_id;
  
  -- If no bids yet, use auction's current_bid as baseline
  IF current_highest = 0 THEN
    current_highest := auction_current;
  END IF;
  
  -- Validate new bid is at least min_increment higher
  IF NEW.bid_amount < (current_highest + min_increment) THEN
    RAISE EXCEPTION 'Bid must be at least $% higher than current bid of $%', 
      min_increment, current_highest;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for bid validation
DROP TRIGGER IF EXISTS check_bid_amount ON bids;
CREATE TRIGGER check_bid_amount
  BEFORE INSERT ON bids
  FOR EACH ROW
  EXECUTE FUNCTION validate_bid_amount();

-- 2. Create function to auto-update auction on new bid
CREATE OR REPLACE FUNCTION update_auction_bid()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auctions
  SET 
    current_bid = NEW.bid_amount,
    total_bids = total_bids + 1,
    updated_at = NOW()
  WHERE id = NEW.auction_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for auto-updating auction
DROP TRIGGER IF EXISTS auto_update_auction ON bids;
CREATE TRIGGER auto_update_auction
  AFTER INSERT ON bids
  FOR EACH ROW
  EXECUTE FUNCTION update_auction_bid();

-- 3. Create function to prevent bidding on ended/inactive auctions
CREATE OR REPLACE FUNCTION check_auction_active()
RETURNS TRIGGER AS $$
DECLARE
  auction_end TIMESTAMP WITH TIME ZONE;
  auction_status TEXT;
BEGIN
  SELECT end_time, status INTO auction_end, auction_status
  FROM auctions
  WHERE id = NEW.auction_id;
  
  IF auction_status != 'active' THEN
    RAISE EXCEPTION 'Auction is no longer active';
  END IF;
  
  IF auction_end < NOW() THEN
    RAISE EXCEPTION 'Auction has ended';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to check auction before bid
DROP TRIGGER IF EXISTS check_auction_before_bid ON bids;
CREATE TRIGGER check_auction_before_bid
  BEFORE INSERT ON bids
  FOR EACH ROW
  EXECUTE FUNCTION check_auction_active();

-- 4. Add validation constraints to bids table
ALTER TABLE bids 
  DROP CONSTRAINT IF EXISTS valid_email,
  DROP CONSTRAINT IF EXISTS valid_name_length,
  DROP CONSTRAINT IF EXISTS positive_bid;

ALTER TABLE bids 
  ADD CONSTRAINT valid_email CHECK (bidder_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$'),
  ADD CONSTRAINT valid_name_length CHECK (LENGTH(TRIM(bidder_name)) BETWEEN 3 AND 100),
  ADD CONSTRAINT positive_bid CHECK (bid_amount > 0);

-- 5. Create rate limiting function
CREATE OR REPLACE FUNCTION check_bid_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  recent_bid_count INTEGER;
BEGIN
  -- Check if same email has bid more than 5 times in last minute
  SELECT COUNT(*) INTO recent_bid_count
  FROM bids
  WHERE bidder_email = NEW.bidder_email
    AND created_at > NOW() - INTERVAL '1 minute';
  
  IF recent_bid_count >= 5 THEN
    RAISE EXCEPTION 'Too many bids. Please wait before bidding again.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create rate limiting trigger
DROP TRIGGER IF EXISTS rate_limit_bids ON bids;
CREATE TRIGGER rate_limit_bids
  BEFORE INSERT ON bids
  FOR EACH ROW
  EXECUTE FUNCTION check_bid_rate_limit();

-- ============================================
-- PHASE 2: Enable Real-Time Updates
-- ============================================

-- Enable replica identity for real-time updates
ALTER TABLE auctions REPLICA IDENTITY FULL;
ALTER TABLE bids REPLICA IDENTITY FULL;

-- Add tables to realtime publication (if not already there)
ALTER PUBLICATION supabase_realtime ADD TABLE auctions;
ALTER PUBLICATION supabase_realtime ADD TABLE bids;