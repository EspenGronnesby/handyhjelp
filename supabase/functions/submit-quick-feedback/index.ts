import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const FUNCTION_NAME = "submit-quick-feedback";
const REDIRECT_URL = "https://handyhjelp.no";

const log = {
  info: (message: string, data?: Record<string, unknown>) => {
    console.log(JSON.stringify({
      level: "INFO",
      function: FUNCTION_NAME,
      timestamp: new Date().toISOString(),
      message,
      ...data
    }));
  },
  error: (message: string, error?: unknown, data?: Record<string, unknown>) => {
    console.error(JSON.stringify({
      level: "ERROR",
      function: FUNCTION_NAME,
      timestamp: new Date().toISOString(),
      message,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error,
      ...data
    }));
  }
};

const handler = async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  const token = url.searchParams.get('token');
  const rating = url.searchParams.get('rating') as 'happy' | 'neutral' | 'sad' | null;

  log.info("Feedback request received", { token: token?.substring(0, 8), rating });

  // Validate parameters - redirect to homepage on error
  if (!token || !rating || !['happy', 'neutral', 'sad'].includes(rating)) {
    log.error("Invalid parameters", null, { token: !!token, rating });
    return new Response(null, {
      status: 302,
      headers: { "Location": REDIRECT_URL }
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Check if token exists and is not used
    const { data: feedback, error: fetchError } = await supabase
      .from('quick_feedback')
      .select('*')
      .eq('token', token)
      .maybeSingle();

    if (fetchError) {
      log.error("Error fetching feedback", fetchError);
      return new Response(null, {
        status: 302,
        headers: { "Location": REDIRECT_URL }
      });
    }

    // Token not found or already used - just redirect
    if (!feedback || feedback.token_used_at) {
      log.info("Token not found or already used", { token: token.substring(0, 8) });
      return new Response(null, {
        status: 302,
        headers: { "Location": REDIRECT_URL }
      });
    }

    // Get IP address
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                      req.headers.get('x-real-ip') || 
                      'unknown';

    // Update feedback with rating
    const { error: updateError } = await supabase
      .from('quick_feedback')
      .update({
        rating: rating,
        token_used_at: new Date().toISOString(),
        ip_address: ipAddress
      })
      .eq('token', token);

    if (updateError) {
      log.error("Error updating feedback", updateError);
    } else {
      log.info("Feedback submitted successfully", { token: token.substring(0, 8), rating });
    }

    // Always redirect to homepage
    return new Response(null, {
      status: 302,
      headers: { "Location": REDIRECT_URL }
    });

  } catch (error) {
    log.error("Unexpected error", error);
    return new Response(null, {
      status: 302,
      headers: { "Location": REDIRECT_URL }
    });
  }
};

serve(handler);
