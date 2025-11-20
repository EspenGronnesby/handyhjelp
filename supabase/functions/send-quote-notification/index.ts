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

interface QuoteRequest {
  type: "private" | "business";
  name: string;
  email: string;
  phone: string;
  address?: string;
  orgNumber?: string;
  companyName?: string;
  description: string;
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
    
    // Input validation
    if (!quoteData.name || !quoteData.email || !quoteData.phone || !quoteData.description) {
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
    const emailResponse = await resend.emails.send({
      from: "HandyHjelp <noreply@handyhjelp.no>",
      to: ["Team@handyhjelp.no"],
      subject: `Ny tilbudsforespørsel fra ${escapeHtml(quoteData.name)} (${customerType})`,
      html: emailHtml,
      replyTo: quoteData.email,
    });

    console.log("Email sent successfully:", emailResponse);

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
    console.error("Error in send-quote-notification function:", error);
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