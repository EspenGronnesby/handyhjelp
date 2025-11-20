import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";
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

interface QuoteRequest {
  type: "private" | "business";
  name: string;
  email: string;
  phone: string;
  address?: string;
  orgNumber?: string;
  companyName?: string;
  description: string;
  quoteId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('[send-quote-notification] Function invoked');
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting check
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    
    console.log('[send-quote-notification] Processing request from IP:', clientIp);
    
    if (!checkRateLimit(clientIp)) {
      console.warn(`Rate limit exceeded for IP: ${clientIp}`);
      return new Response(
        JSON.stringify({ 
          success: false,
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

    const quoteData: QuoteRequest = await req.json();
    console.log('[send-quote-notification] Quote data received:', { 
      type: quoteData.type, 
      email: quoteData.email,
      hasName: !!quoteData.name,
      hasDescription: !!quoteData.description 
    });
    
    // Input validation
    if (!quoteData.name || !quoteData.email || !quoteData.phone || !quoteData.description) {
      console.error('[send-quote-notification] Missing required fields');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Manglende obligatoriske felt"
        }),
        {
          status: 400,
          headers: { 
            "Content-Type": "application/json", 
            ...corsHeaders 
          },
        }
      );
    }

    // Length validation
    if (quoteData.name.length > 100 || quoteData.description.length > 2000) {
      console.error('[send-quote-notification] Input too long');
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Input er for lang"
        }),
        {
          status: 400,
          headers: { 
            "Content-Type": "application/json", 
            ...corsHeaders 
          },
        }
      );
    }
    
    console.log("Processing quote request:", { type: quoteData.type, email: quoteData.email });

    // Create email content with HTML sanitization
    const customerType = quoteData.type === "business" ? "Bedrift" : "Privatperson";
    const companyInfo = quoteData.type === "business" && quoteData.companyName 
      ? `\n<strong>Bedrift:</strong> ${escapeHtml(quoteData.companyName)}\n<strong>Org.nummer:</strong> ${escapeHtml(quoteData.orgNumber || '')}\n`
      : "";
    const addressInfo = quoteData.type === "private" && quoteData.address
      ? `<p><strong>Adresse:</strong> ${escapeHtml(quoteData.address)}</p>`
      : "";

    const emailHtml = `
      <h2>Ny tilbudsforespørsel fra HandyHjelp</h2>
      
      <h3>Kundeinformasjon</h3>
      <p><strong>Type:</strong> ${customerType}</p>
      <p><strong>Navn:</strong> ${escapeHtml(quoteData.name)}</p>
      <p><strong>E-post:</strong> ${escapeHtml(quoteData.email)}</p>
      <p><strong>Telefon:</strong> ${escapeHtml(quoteData.phone)}</p>
      ${addressInfo}
      ${companyInfo}
      
      <h3>Oppdragsbeskrivelse</h3>
      <p>${escapeHtml(quoteData.description).replace(/\n/g, '<br>')}</p>
      
      <hr>
      <p><em>Denne forespørselen kom fra HandyHjelp.no</em></p>
    `;

    // Send email to HandyHjelp
    console.log('[send-quote-notification] Sending email to Team@handyhjelp.no');
    const emailResponse = await resend.emails.send({
      from: "HandyHjelp <team@handyhjelp.no>",
      to: ["Team@handyhjelp.no"],
      subject: `Ny tilbudsforespørsel fra ${escapeHtml(quoteData.name)} (${customerType})`,
      html: emailHtml,
      replyTo: quoteData.email,
    });

    console.log('[send-quote-notification] Team email sent successfully:', {
      id: emailResponse.data?.id,
      error: emailResponse.error
    });

    // Send confirmation email to customer
    console.log('[send-quote-notification] Sending confirmation email to customer:', quoteData.email);
    const customerEmailResponse = await resend.emails.send({
      from: "HandyHjelp <team@handyhjelp.no>",
      to: [quoteData.email],
      subject: "Takk for din tilbudsforespørsel! 📋",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0891B2;">Hei ${escapeHtml(quoteData.name)}!</h2>
          
          <p>Takk for at du tok kontakt med oss. Vi har mottatt din tilbudsforespørsel og vil svare deg så snart som mulig.</p>
          
          <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1e293b;">Din forespørsel:</h3>
            <p style="white-space: pre-wrap;">${escapeHtml(quoteData.description)}</p>
          </div>
          
          <p>Vi jobber for å gi deg et uforpliktende tilbud innen kort tid. Vanligvis svarer vi innen 2 timer på hverdager mellom 07:00-17:00.</p>
          
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

    console.log('[send-quote-notification] Customer email sent successfully:', {
      id: customerEmailResponse.data?.id,
      error: customerEmailResponse.error
    });

    // Log emails to database for tracking
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Log team email
    if (emailResponse.data?.id) {
      await supabase.from('email_logs').insert({
        email_id: emailResponse.data.id,
        event_type: 'sent',
        recipient: 'Team@handyhjelp.no',
        subject: `Ny tilbudsforespørsel fra ${escapeHtml(quoteData.name)}`,
        from_email: 'team@handyhjelp.no',
        related_quote_id: quoteData.quoteId || null,
        metadata: emailResponse.data
      });
    }

    // Log customer email
    if (customerEmailResponse.data?.id) {
      await supabase.from('email_logs').insert({
        email_id: customerEmailResponse.data.id,
        event_type: 'sent',
        recipient: quoteData.email,
        subject: 'Takk for din tilbudsforespørsel! 📋',
        from_email: 'team@handyhjelp.no',
        related_quote_id: quoteData.quoteId || null,
        metadata: customerEmailResponse.data
      });
    }

    console.log('[send-quote-notification] ✅ Both emails sent and logged successfully');

    return new Response(JSON.stringify({ 
      success: true,
      emailId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('[send-quote-notification] ❌ Error:', error);
    console.error('[send-quote-notification] Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || "Unknown error occurred"
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);