import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { pointsToUse } = await req.json();

    if (typeof pointsToUse !== 'number' || pointsToUse < 200) {
      throw new Error('Minimum 200 poeng kreves for å bruke poeng');
    }

    // Check user's balance
    const { data: loyaltyData, error: balanceError } = await supabaseClient
      .from('loyalty_points')
      .select('balance')
      .eq('user_id', user.id)
      .single();

    if (balanceError || !loyaltyData) {
      throw new Error('Kunne ikke hente poengsaldo');
    }

    if (loyaltyData.balance < pointsToUse) {
      throw new Error(`Utilstrekkelig saldo. Du har ${loyaltyData.balance} poeng.`);
    }

    // Calculate discount value (10 poeng = 1 kr)
    const discountValue = Math.floor(pointsToUse / 10);

    // Generate unique discount code
    const discountCode = `POENG${Date.now().toString().slice(-8)}`;

    // Deduct points using service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error: deductError } = await supabaseAdmin.rpc('award_points', {
      p_user_id: user.id,
      p_amount: -pointsToUse,
      p_type: 'spent',
      p_description: `Brukt ${pointsToUse} poeng (${discountValue} kr rabatt) - Kode: ${discountCode}`
    });

    if (deductError) {
      console.error('Error deducting points:', deductError);
      throw new Error('Kunne ikke trekke poeng');
    }

    // Create notification
    await supabaseAdmin.from('notifications').insert({
      user_id: user.id,
      type: 'loyalty',
      title: 'Poeng brukt!',
      message: `Du har brukt ${pointsToUse} poeng og fått ${discountValue} kr rabatt. Rabattkode: ${discountCode}`,
      read: false
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        pointsUsed: pointsToUse,
        discountValue,
        discountCode,
        message: `${discountValue} kr rabatt aktivert!`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    console.error('Error in apply-points-discount:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
