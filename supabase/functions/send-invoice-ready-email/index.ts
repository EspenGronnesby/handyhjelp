import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvoiceReadyPayload {
  userId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  dueDate: string;
  invoiceNumber: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("send-invoice-ready-email function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload: InvoiceReadyPayload = await req.json();
    console.log("Received payload:", payload);

    const { userId, customerName, customerEmail, amount, dueDate, invoiceNumber } = payload;

    const formattedAmount = new Intl.NumberFormat("nb-NO", {
      style: "currency",
      currency: "NOK",
    }).format(amount);

    const formattedDate = new Date(dueDate).toLocaleDateString("nb-NO", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    // Send email to customer
    const emailResponse = await resend.emails.send({
      from: "HandyHjelp <onboarding@resend.dev>",
      to: [customerEmail],
      subject: `Faktura ${invoiceNumber} er klar`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #0891B2;">Faktura tilgjengelig</h1>
          <p>Hei ${customerName},</p>
          <p>Din faktura for utført arbeid er nå klar.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Fakturadetaljer</h3>
            <p><strong>Fakturanummer:</strong> ${invoiceNumber}</p>
            <p><strong>Beløp:</strong> ${formattedAmount}</p>
            <p><strong>Forfallsdato:</strong> ${formattedDate}</p>
          </div>
          
          <p>Du kan laste ned fakturaen fra din kundeside på handyhjelp.no</p>
          
          <a href="https://handyhjelp.no/dashboard/aktivitet" 
             style="display: inline-block; background-color: #0891B2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">
            Se faktura
          </a>
          
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            Ved spørsmål, kontakt oss på handyhjelp@gmail.com eller +47 41250553.
          </p>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    // Create notification for customer
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    await supabase.from("notifications").insert({
      user_id: userId,
      type: "invoice",
      title: "Faktura tilgjengelig",
      message: `Faktura ${invoiceNumber} på ${formattedAmount} er nå klar. Forfallsdato: ${formattedDate}`,
      read: false,
    });

    console.log("Customer notification created");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-invoice-ready-email:", error);
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
