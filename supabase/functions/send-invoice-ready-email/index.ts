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
      from: "HandyHjelp <team@handyhjelp.no>",
      to: [customerEmail],
      subject: `Faktura ${invoiceNumber} er klar`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8fafc; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #0891B2, #06B6D4); padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .logo { color: white; font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
            .invoice-details { background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .contact-info { background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 25px 0; }
            .cta-button { display: inline-block; background-color: #0891B2; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; }
            .footer { background-color: #f8fafc; padding: 20px; text-align: center; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">HandyHjelp</div>
              <h1>Faktura tilgjengelig</h1>
            </div>
            
            <div class="content">
              <p style="font-size: 18px;">Hei <strong>${customerName}</strong>,</p>
              
              <p style="font-size: 16px; line-height: 1.6;">Din faktura for utført arbeid er nå klar.</p>
              
              <div class="invoice-details">
                <h3 style="margin-top: 0; color: #0891B2;">Fakturadetaljer</h3>
                <p style="margin: 8px 0;"><strong>Fakturanummer:</strong> ${invoiceNumber}</p>
                <p style="margin: 8px 0;"><strong>Beløp:</strong> ${formattedAmount}</p>
                <p style="margin: 8px 0;"><strong>Forfallsdato:</strong> ${formattedDate}</p>
              </div>
              
              <p style="font-size: 16px; line-height: 1.6;">Du kan laste ned fakturaen fra din kundeside på handyhjelp.no</p>
              
              <div style="text-align: center; margin: 25px 0;">
                <a href="https://handyhjelp.no/dashboard/aktivitet" class="cta-button">
                  Se faktura
                </a>
              </div>
              
              <div class="contact-info">
                <h3 style="margin-top: 0; color: #0891B2;">Har du spørsmål?</h3>
                <p style="margin: 8px 0;"><strong>Telefon:</strong> <a href="tel:+4741250553" style="color: #0891B2; text-decoration: none;">+47 412 50 553</a></p>
                <p style="margin: 8px 0;"><strong>E-post:</strong> <a href="mailto:team@handyhjelp.no" style="color: #0891B2; text-decoration: none;">team@handyhjelp.no</a></p>
                <p style="margin: 8px 0;"><strong>Åpningstid:</strong> Man-Fre 09:00-17:00</p>
              </div>
              
              <p style="font-size: 16px; line-height: 1.6;">
                Med vennlig hilsen,<br>
                <strong>HandyHjelp-teamet</strong>
              </p>
            </div>
            
            <div class="footer">
              <strong>Levert med kvalitet</strong><br>
              <a href="https://handyhjelp.no" style="color: #0891B2; text-decoration: none;">www.handyhjelp.no</a>
            </div>
          </div>
        </body>
        </html>
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
