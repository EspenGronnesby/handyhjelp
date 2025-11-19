const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { points } = await req.json();

    if (typeof points !== 'number' || points < 0) {
      throw new Error('Valid points number is required');
    }

    // Conversion rate: 100 poeng = 1 kr
    const kronerValue = Math.floor(points / 100);
    const remainingPoints = points % 100;

    return new Response(
      JSON.stringify({ 
        points,
        kronerValue,
        remainingPoints,
        conversionRate: '100 poeng = 1 kr'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    console.error('Error in calculate-points-value:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
