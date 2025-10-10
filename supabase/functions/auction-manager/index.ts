import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting auction manager...');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Find auctions that have ended but are still active
    const { data: endedAuctions, error: fetchError } = await supabaseClient
      .from('auctions')
      .select('*')
      .eq('status', 'active')
      .lt('end_time', new Date().toISOString());

    if (fetchError) {
      console.error('Error fetching auctions:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${endedAuctions?.length || 0} ended auctions`);
    const results = [];

    for (const auction of endedAuctions || []) {
      console.log(`Processing auction: ${auction.car_name}`);
      
      // Get highest bid for this auction
      const { data: highestBid, error: bidError } = await supabaseClient
        .from('bids')
        .select('*')
        .eq('auction_id', auction.id)
        .order('bid_amount', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (bidError) {
        console.error(`Error fetching bids for auction ${auction.id}:`, bidError);
        continue;
      }

      // Close the auction
      const { error: updateError } = await supabaseClient
        .from('auctions')
        .update({ status: 'closed' })
        .eq('id', auction.id);

      if (updateError) {
        console.error(`Error closing auction ${auction.id}:`, updateError);
        continue;
      }

      console.log(`Auction ${auction.car_name} closed successfully`);

      // If there's a winner, record in sales_transactions
      if (highestBid) {
        const { error: saleError } = await supabaseClient
          .from('sales_transactions')
          .insert({
            auction_id: auction.id,
            customer_name: highestBid.bidder_name,
            customer_email: highestBid.bidder_email,
            amount: highestBid.bid_amount,
            sale_type: 'auction',
            transaction_date: new Date().toISOString()
          });

        if (saleError) {
          console.error(`Error recording sale for auction ${auction.id}:`, saleError);
        } else {
          console.log(`Winner recorded: ${highestBid.bidder_email} - $${highestBid.bid_amount}`);
        }

        results.push({
          auction: auction.car_name,
          winner: highestBid.bidder_email,
          amount: highestBid.bid_amount
        });
      } else {
        console.log(`No bids for auction ${auction.car_name}`);
        results.push({
          auction: auction.car_name,
          winner: null,
          amount: 0
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: endedAuctions?.length || 0,
        closed: results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error in auction manager:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
