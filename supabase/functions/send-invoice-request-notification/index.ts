import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvoiceRequestPayload {
  jobId: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  jobDescription: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-invoice-request-notification function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: InvoiceRequestPayload = await req.json();
    console.log("Received payload:", payload);

    const { jobId, userId, customerName, customerEmail, jobDescription } = payload;

    // Send email to admin
    const emailResponse = await resend.emails.send({
      from: "HandyHjelp <onboarding@resend.dev>",
      to: ["handyhjelp@gmail.com"],
      subject: `Ny fakturaforespørsel fra ${customerName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #0891B2;">Ny fakturaforespørsel</h1>
          <p>En kunde har bedt om faktura for en fullført jobb.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Kundedetaljer</h3>
            <p><strong>Navn:</strong> ${customerName}</p>
            <p><strong>E-post:</strong> ${customerEmail}</p>
          </div>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Jobbdetaljer</h3>
            <p><strong>Beskrivelse:</strong> ${jobDescription}</p>
            <p><strong>Jobb-ID:</strong> ${jobId}</p>
          </div>
          
          <p>Logg inn på admin-dashboardet for å legge til faktura.</p>
          
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            Dette er en automatisk generert e-post fra HandyHjelp.
          </p>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    // Create notification for admin
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get admin user IDs
    const { data: adminRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    if (adminRoles && adminRoles.length > 0) {
      for (const admin of adminRoles) {
        await supabase.from("notifications").insert({
          user_id: admin.user_id,
          type: "invoice_request",
          title: "Ny fakturaforespørsel",
          message: `${customerName} har bedt om faktura for en fullført jobb.`,
          read: false,
        });
      }
      console.log("Admin notifications created");
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-invoice-request-notification:", error);
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
