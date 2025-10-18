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
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const now = new Date().toISOString();

    const { data: campaigns, error } = await supabaseClient
      .from('loyalty_campaigns')
      .select('*')
      .eq('active', true)
      .lte('start_date', now)
      .gte('end_date', now)
      .order('multiplier', { ascending: false });

    if (error) {
      throw error;
    }

    // Get the highest multiplier (best campaign)
    const bestMultiplier = campaigns && campaigns.length > 0 
      ? campaigns[0].multiplier 
      : 1.0;

    return new Response(
      JSON.stringify({ 
        campaigns: campaigns || [],
        activeMultiplier: bestMultiplier,
        hasCampaign: campaigns && campaigns.length > 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    console.error('Error in check-active-campaigns:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
