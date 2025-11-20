import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limiting: Track requests per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_WINDOW = 3;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  
  record.count++;
  return true;
}

// HTML sanitization
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

interface ContactRequest {
  name: string;
  email: string;
  phone: string;
  message: string;
  captchaToken: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting check
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    
    if (!checkRateLimit(clientIp)) {
      console.warn(`Rate limit exceeded for IP: ${clientIp}`);
      return new Response(
        JSON.stringify({ 
          error: "For mange forespørsler. Vennligst prøv igjen senere."
        }),
        {
          status: 429,
          headers: { 
            "Content-Type": "application/json", 
            ...corsHeaders 
          },
        }
      );
    }

    const { name, email, phone, message, captchaToken }: ContactRequest = await req.json();
    
    // Verify hCaptcha token
    if (!captchaToken) {
      return new Response(
        JSON.stringify({ error: "Captcha-verifisering mangler" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const captchaResponse = await fetch('https://hcaptcha.com/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `response=${captchaToken}&secret=${Deno.env.get('HCAPTCHA_SECRET')}`,
    });

    const captchaResult = await captchaResponse.json();
    if (!captchaResult.success) {
      console.warn('Captcha verification failed:', captchaResult);
      return new Response(
        JSON.stringify({ error: "Captcha-verifisering feilet" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
    
    // Input validation
    if (!name || !email || !phone || !message) {
      return new Response(
        JSON.stringify({ error: "Manglende obligatoriske felt" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Length validation
    if (name.length > 100 || message.length > 2000) {
      return new Response(
        JSON.stringify({ error: "Input er for lang" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Send email to HandyHjelp
    const emailResponse = await resend.emails.send({
      from: "HandyHjelp <onboarding@resend.dev>",
      to: ["Team@handyhjelp.no"],
      subject: `Ny kontaktmelding fra ${escapeHtml(name)}`,
      html: `
        <h2>Ny kontaktmelding fra nettsiden</h2>
        <p><strong>Navn:</strong> ${escapeHtml(name)}</p>
        <p><strong>E-post:</strong> ${escapeHtml(email)}</p>
        <p><strong>Telefon:</strong> ${escapeHtml(phone)}</p>
        <p><strong>Melding:</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
      `,
    });

    // Send automatic confirmation to customer
    await resend.emails.send({
      from: "HandyHjelp <onboarding@resend.dev>",
      to: [email],
      subject: "Takk for din henvendelse! 📧",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0891B2;">Hei ${escapeHtml(name)}!</h2>
          
          <p>Takk for at du tok kontakt med oss. Vi har mottatt din melding og vil svare deg så snart som mulig.</p>
          
          <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1e293b;">Din melding til oss:</h3>
            <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
          </div>
          
          <p>Vi jobber for å gi deg et svar innen kort tid. Vanligvis svarer vi innen 2 timer på hverdager mellom 07:00-17:00.</p>
          
          <p>Trenger du raskere hjelp? Ring oss gjerne på:</p>
          <p style="font-size: 20px; font-weight: bold; color: #0891B2;">📞 +47 41250553</p>
          
          <p style="margin-top: 30px;">Med vennlig hilsen,<br>
          <strong>HandyHjelp teamet</strong></p>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #64748b;">
            HandyHjelp - Din pålitelige partner for alle typer eiendomsvedlikehold
          </p>
        </div>
      `,
    });

    console.log("Contact email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
