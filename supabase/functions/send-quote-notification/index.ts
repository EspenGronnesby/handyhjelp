import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface QuoteRequest {
  type: "private" | "business";
  name: string;
  email: string;
  phone: string;
  orgNumber?: string;
  companyName?: string;
  description: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const quoteData: QuoteRequest = await req.json();
    
    console.log("Processing quote request:", { type: quoteData.type, email: quoteData.email });

    // Create email content
    const customerType = quoteData.type === "business" ? "Bedrift" : "Privatperson";
    const companyInfo = quoteData.type === "business" && quoteData.companyName 
      ? `\n<strong>Bedrift:</strong> ${quoteData.companyName}\n<strong>Org.nummer:</strong> ${quoteData.orgNumber}\n`
      : "";

    const emailHtml = `
      <h2>Ny tilbudsforespørsel fra HandyHjelp</h2>
      
      <h3>Kundeinformasjon</h3>
      <p><strong>Type:</strong> ${customerType}</p>
      <p><strong>Navn:</strong> ${quoteData.name}</p>
      <p><strong>E-post:</strong> ${quoteData.email}</p>
      <p><strong>Telefon:</strong> ${quoteData.phone}</p>
      ${companyInfo}
      
      <h3>Oppdragsbeskrivelse</h3>
      <p>${quoteData.description.replace(/\n/g, '<br>')}</p>
      
      <hr>
      <p><em>Denne forespørselen kom fra HandyHjelp.no</em></p>
    `;

    // Send email to HandyHjelp
    const emailResponse = await resend.emails.send({
      from: "HandyHjelp <noreply@handyhjelp.no>",
      to: ["handyhjelp@gmail.com"],
      subject: `Ny tilbudsforespørsel fra ${quoteData.name} (${customerType})`,
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