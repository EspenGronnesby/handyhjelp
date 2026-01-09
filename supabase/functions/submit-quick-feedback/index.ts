import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const FUNCTION_NAME = "submit-quick-feedback";

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

const RATING_CONFIG = {
  happy: { emoji: '😊', label: 'Fornøyd', color: '#10B981' },
  neutral: { emoji: '😐', label: 'Nøytral', color: '#F59E0B' },
  sad: { emoji: '😟', label: 'Misfornøyd', color: '#EF4444' }
};

const generateHtmlResponse = (title: string, message: string, emoji: string, color: string) => {
  return `
    <!DOCTYPE html>
    <html lang="no">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} - HandyHjelp</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: Arial, sans-serif; 
          background-color: #f8fafc; 
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .container { 
          max-width: 500px; 
          width: 100%;
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header { 
          background: linear-gradient(135deg, ${color}, ${color}dd); 
          padding: 40px 20px; 
          text-align: center; 
        }
        .logo { 
          color: white; 
          font-size: 24px; 
          font-weight: bold; 
          margin-bottom: 15px; 
        }
        .emoji { 
          font-size: 64px; 
          margin-bottom: 15px;
        }
        .header h1 { 
          color: white; 
          font-size: 24px; 
          font-weight: 600;
        }
        .content { 
          padding: 30px; 
          text-align: center; 
        }
        .message { 
          font-size: 16px; 
          color: #374151; 
          line-height: 1.6; 
          margin-bottom: 25px;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #0891B2, #06B6D4);
          color: white;
          padding: 12px 30px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          transition: transform 0.2s;
        }
        .cta-button:hover { transform: translateY(-2px); }
        .footer { 
          background-color: #f8fafc; 
          padding: 20px; 
          text-align: center; 
          border-top: 1px solid #e5e7eb;
          font-size: 14px;
          color: #6b7280;
        }
        .footer a { color: #0891B2; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">HandyHjelp</div>
          <div class="emoji">${emoji}</div>
          <h1>${title}</h1>
        </div>
        <div class="content">
          <p class="message">${message}</p>
          <a href="https://handyhjelp.no" class="cta-button">Besøk HandyHjelp</a>
        </div>
        <div class="footer">
          <strong>Levert med kvalitet</strong><br>
          <a href="https://handyhjelp.no">www.handyhjelp.no</a>
        </div>
      </div>
    </body>
    </html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  const token = url.searchParams.get('token');
  const rating = url.searchParams.get('rating') as 'happy' | 'neutral' | 'sad' | null;

  log.info("Feedback request received", { token: token?.substring(0, 8), rating });

  // Validate parameters
  if (!token || !rating) {
    return new Response(
      generateHtmlResponse(
        'Ugyldig lenke',
        'Beklager, denne lenken er ikke gyldig. Vennligst bruk lenken fra e-posten du mottok.',
        '❌',
        '#EF4444'
      ),
      { status: 400, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  if (!['happy', 'neutral', 'sad'].includes(rating)) {
    return new Response(
      generateHtmlResponse(
        'Ugyldig tilbakemelding',
        'Beklager, denne tilbakemeldingen er ikke gyldig.',
        '❌',
        '#EF4444'
      ),
      { status: 400, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
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
      throw fetchError;
    }

    if (!feedback) {
      return new Response(
        generateHtmlResponse(
          'Lenken er utløpt',
          'Beklager, denne tilbakemeldingslenken er ikke lenger gyldig.',
          '⏰',
          '#F59E0B'
        ),
        { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
    }

    // Check if already used
    if (feedback.token_used_at) {
      const previousRating = feedback.rating as 'happy' | 'neutral' | 'sad';
      const config = RATING_CONFIG[previousRating];
      return new Response(
        generateHtmlResponse(
          'Allerede registrert',
          `Du har allerede gitt tilbakemelding på dette oppdraget. Din tilbakemelding: ${config.label} ${config.emoji}`,
          '✅',
          '#0891B2'
        ),
        { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
      );
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
      throw updateError;
    }

    log.info("Feedback submitted successfully", { token: token.substring(0, 8), rating });

    const config = RATING_CONFIG[rating];
    return new Response(
      generateHtmlResponse(
        'Takk for tilbakemeldingen!',
        `Din tilbakemelding er registrert. Vi setter stor pris på at du tok deg tid til å svare!`,
        config.emoji,
        config.color
      ),
      { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );

  } catch (error) {
    log.error("Unexpected error", error);
    return new Response(
      generateHtmlResponse(
        'Noe gikk galt',
        'Beklager, vi kunne ikke registrere tilbakemeldingen din. Vennligst prøv igjen senere.',
        '😕',
        '#EF4444'
      ),
      { status: 500, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }
};

serve(handler);
