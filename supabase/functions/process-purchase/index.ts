import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { car_id, customer_name, customer_email, customer_phone, notes, sale_type } = await req.json();

    console.log('Processing purchase request:', { car_id, customer_name, customer_email, sale_type });

    // Validate required fields
    if (!car_id || !customer_name || !customer_email || !sale_type) {
      throw new Error('Missing required fields');
    }

    // Validate sale type
    if (!['purchase', 'rental'].includes(sale_type)) {
      throw new Error('Invalid sale type. Must be "purchase" or "rental"');
    }

    // Fetch car details
    const { data: car, error: carError } = await supabaseClient
      .from('cars')
      .select('id, name, price, status')
      .eq('id', car_id)
      .single();

    if (carError || !car) {
      console.error('Car fetch error:', carError);
      throw new Error('Car not found');
    }

    if (car.status !== 'active') {
      throw new Error('This car is no longer available');
    }

    // Calculate amount based on sale type
    // Purchase: full price
    // Rental: 1% of price as daily rate (MVP pricing)
    const amount = sale_type === 'purchase' ? car.price : Math.round(car.price * 0.01);

    console.log(`Processing ${sale_type} for ${car.name} - Amount: $${amount}`);

    // Create sales transaction
    const { data: transaction, error: transactionError } = await supabaseClient
      .from('sales_transactions')
      .insert({
        car_id: car.id,
        customer_name: customer_name.trim(),
        customer_email: customer_email.trim(),
        amount: amount,
        sale_type: sale_type,
        transaction_date: new Date().toISOString(),
      })
      .select()
      .single();

    if (transactionError) {
      console.error('Transaction error:', transactionError);
      throw new Error('Failed to create transaction');
    }

    console.log(`Transaction created successfully: ${transaction.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        transaction_id: transaction.id,
        car_name: car.name,
        amount: amount,
        sale_type: sale_type,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error in process-purchase function:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message || 'An unexpected error occurred',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
