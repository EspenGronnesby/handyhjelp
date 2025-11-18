import { corsHeaders } from '../_shared/cors.ts';

interface LoginRequest {
  email: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: LoginRequest = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Ugyldig e-postadresse' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Login attempt for email: ${email}`);

    // Call the external Supabase API
    const externalApiUrl = 'https://odbqdzmdlelotqfuxbwf.supabase.co/functions/v1/customer-login';
    const externalApiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kYnFkem1kbGVsb3RxZnV4YndmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1OTY1NTQsImV4cCI6MjA3NTE3MjU1NH0.g4P9Zc_-IvlaXY9RgzjMykB0wNAV7bVim0jD4dabPyY';

    const response = await fetch(externalApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': externalApiKey,
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    return new Response(
      JSON.stringify(data),
      { 
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'En feil oppstod under innlogging' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
