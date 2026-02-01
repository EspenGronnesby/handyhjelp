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

    const { referralCode } = await req.json();

    if (!referralCode) {
      throw new Error('Referral code is required');
    }

    // Use admin client to validate referral code (users can no longer read all codes for security)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Validate referral code using admin client
    const { data: referralData, error: codeError } = await supabaseAdmin
      .from('referral_codes')
      .select('referrer_user_id, uses_count')
      .eq('code', referralCode)
      .single();

    if (codeError || !referralData) {
      throw new Error('Ugyldig referansekode');
    }

    // Check if user is trying to use their own code
    if (referralData.referrer_user_id === user.id) {
      throw new Error('Du kan ikke bruke din egen referansekode');
    }

    // Check if user has already used a referral code
    const { data: existingReferral } = await supabaseClient
      .from('points_transactions')
      .select('id')
      .eq('user_id', user.id)
      .eq('transaction_type', 'referral')
      .limit(1);

    if (existingReferral && existingReferral.length > 0) {
      throw new Error('Du har allerede brukt en referansekode');
    }

    // supabaseAdmin already declared above

    // Award 250 points to the new user (referee)
    await supabaseAdmin.rpc('award_points', {
      p_user_id: user.id,
      p_amount: 250,
      p_type: 'referral',
      p_description: `Referansebonus fra kode: ${referralCode}`
    });

    // Award 250 points to the referrer
    await supabaseAdmin.rpc('award_points', {
      p_user_id: referralData.referrer_user_id,
      p_amount: 250,
      p_type: 'referral',
      p_description: `Referansebonus - ny kunde anbefalt`
    });

    // Increment uses_count
    await supabaseAdmin
      .from('referral_codes')
      .update({ uses_count: referralData.uses_count + 1 })
      .eq('code', referralCode);

    // Create notifications for both users
    await supabaseAdmin.from('notifications').insert([
      {
        user_id: user.id,
        type: 'loyalty',
        title: 'Referansebonus mottatt!',
        message: 'Du har fått 250 poeng for å bruke en referansekode! 🎉',
        read: false
      },
      {
        user_id: referralData.referrer_user_id,
        type: 'loyalty',
        title: 'Noen brukte din referansekode!',
        message: 'Du har fått 250 poeng for å anbefale HandyHjelp! 🎁',
        read: false
      }
    ]);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Dere har begge fått 250 poeng! 🎉'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    console.error('Error in process-referral:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
