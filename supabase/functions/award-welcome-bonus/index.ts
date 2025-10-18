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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { userId } = await req.json();

    if (!userId) {
      throw new Error('userId is required');
    }

    console.log('Awarding welcome bonus to user:', userId);

    // Check if user already has loyalty points (to avoid duplicate bonuses)
    const { data: existingPoints } = await supabaseClient
      .from('loyalty_points')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existingPoints) {
      console.log('User already has loyalty points, skipping welcome bonus');
      return new Response(
        JSON.stringify({ message: 'Welcome bonus already awarded' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Award 500 welcome points using the database function
    const { data, error } = await supabaseClient.rpc('award_points', {
      p_user_id: userId,
      p_amount: 500,
      p_type: 'welcome',
      p_description: 'Velkommen til HandyHjelp Kundeklubb! 🎉'
    });

    if (error) {
      console.error('Error awarding welcome bonus:', error);
      throw error;
    }

    console.log('Welcome bonus awarded successfully:', data);

    // Create notification
    await supabaseClient.from('notifications').insert({
      user_id: userId,
      type: 'loyalty',
      title: 'Velkommen til Kundeklubben!',
      message: 'Du har fått 500 velkomstpoeng! Start å samle poeng ved å bestille tjenester.',
      read: false
    });

    return new Response(
      JSON.stringify({ success: true, transactionId: data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    console.error('Error in award-welcome-bonus:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
