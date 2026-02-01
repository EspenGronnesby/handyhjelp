import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const FUNCTION_NAME = "submit-quick-feedback";
const REDIRECT_URL = "https://handyhjelp.no";

// Rate limiting - 1 request per 10 minutes per IP
const rateLimits = new Map<string, number>();
const COOLDOWN_MS = 600000; // 10 minutes

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const lastTime = rateLimits.get(ip);

  if (rateLimits.size > 10000) {
    for (const [key, value] of rateLimits.entries()) {
      if (now - value > COOLDOWN_MS) rateLimits.delete(key);
    }
  }

  if (!lastTime || now - lastTime >= COOLDOWN_MS) {
    rateLimits.set(ip, now);
    return true;
  }
  return false;
}

function getClientIP(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
}

const getThankYouHtml = () => `
<!DOCTYPE html>
<html lang="no">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="refresh" content="1.5;url=${REDIRECT_URL}">
  <title>Tusen takk! - HandyHjelp</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: #f8fafc;
    }
    .header {
      background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%);
      padding: 20px;
      text-align: center;
    }
    .logo {
      color: white;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .content {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      text-align: center;
    }
    .checkmark {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 24px;
      animation: scaleIn 0.3s ease-out;
    }
    .checkmark svg {
      width: 40px;
      height: 40px;
      color: white;
    }
    h1 {
      font-size: 32px;
      color: #1e3a5f;
      margin-bottom: 12px;
      animation: fadeIn 0.4s ease-out 0.1s both;
    }
    p {
      font-size: 16px;
      color: #64748b;
      animation: fadeIn 0.4s ease-out 0.2s both;
    }
    @keyframes scaleIn {
      from { transform: scale(0); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">HandyHjelp</div>
  </div>
  <div class="content">
    <div class="checkmark">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
      </svg>
    </div>
    <h1>Tusen takk!</h1>
    <p>Du blir videresendt...</p>
  </div>
  <script>
    setTimeout(() => window.location.href = '${REDIRECT_URL}', 1500);
  </script>
</body>
</html>
`;

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
  const clientIP = getClientIP(req);

  // Rate limiting check (1 per 10 minutes)
  if (!checkRateLimit(clientIP)) {
    log.info("Rate limit exceeded for quick feedback", { clientIP });
    return new Response(null, {
      status: 302,
      headers: { "Location": REDIRECT_URL }
    });
  }

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

    // Show thank you page then redirect
    return new Response(getThankYouHtml(), {
      status: 200,
      headers: { 
        "Content-Type": "text/html; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "no-cache, no-store, must-revalidate"
      }
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
