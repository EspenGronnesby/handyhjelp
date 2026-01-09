import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting invoice due date reminder check...");

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    console.log(`Checking for invoices due on: ${today}`);

    // Find all unpaid invoices due today
    const { data: invoices, error: fetchError } = await supabase
      .from('invoices')
      .select(`
        *,
        jobs!inner (
          quotes!inner (
            name,
            email,
            company_name,
            type
          )
        )
      `)
      .eq('due_date', today)
      .eq('status', 'pending');

    if (fetchError) {
      console.error("Error fetching invoices:", fetchError);
      throw fetchError;
    }

    console.log(`Found ${invoices?.length || 0} invoices due today`);

    if (!invoices || invoices.length === 0) {
      return new Response(
        JSON.stringify({ message: "No invoices due today", count: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let sentCount = 0;
    const errors: string[] = [];

    for (const invoice of invoices) {
      const customerName = invoice.jobs.quotes.type === 'business' 
        ? invoice.jobs.quotes.company_name 
        : invoice.jobs.quotes.name;
      const customerEmail = invoice.jobs.quotes.email;
      const formattedAmount = new Intl.NumberFormat('nb-NO', { 
        style: 'currency', 
        currency: 'NOK' 
      }).format(invoice.amount);

      console.log(`Sending reminder to ${customerEmail} for invoice ${invoice.invoice_number}`);

      try {
        const emailResponse = await resend.emails.send({
          from: "HandyHjelp <team@handyhjelp.no>",
          to: [customerEmail],
          subject: `Vennlig påminnelse: Faktura ${invoice.invoice_number} forfaller i dag`,
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
                .highlight { background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0891B2; }
                .amount { font-size: 24px; color: #0891B2; font-weight: bold; }
                .contact-info { background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 25px 0; }
                .footer { background-color: #f8fafc; padding: 20px; text-align: center; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <div class="logo">HandyHjelp</div>
                  <h1>Vennlig påminnelse</h1>
                </div>
                <div class="content">
                  <p style="font-size: 18px;">Hei <strong>${customerName}</strong>,</p>
                  
                  <p style="font-size: 16px; line-height: 1.6;">Vi håper du har det fint! Dette er bare en vennlig påminnelse om at fakturaen din forfaller <strong>i dag</strong>.</p>
                  
                  <div class="highlight">
                    <p style="margin: 0 0 10px 0;"><strong>Fakturanummer:</strong> ${invoice.invoice_number}</p>
                    <p style="margin: 0;"><strong>Beløp:</strong> <span class="amount">${formattedAmount}</span></p>
                  </div>
                  
                  <p style="font-size: 16px; line-height: 1.6;">Hvis du allerede har betalt, kan du se bort fra denne meldingen – tusen takk!</p>
                  
                  <p style="font-size: 16px; line-height: 1.6;">Har du spørsmål om fakturaen eller trenger litt mer tid? Bare ta kontakt med oss, så finner vi en løsning sammen.</p>
                  
                  <div class="contact-info">
                    <h3 style="margin-top: 0; color: #0891B2;">Kontakt oss</h3>
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

        console.log(`Email sent successfully to ${customerEmail}:`, emailResponse);
        sentCount++;

        // Create notification for the user
        await supabase.from('notifications').insert({
          user_id: invoice.user_id,
          type: 'invoice',
          title: 'Faktura forfaller i dag',
          message: `Faktura ${invoice.invoice_number} på ${formattedAmount} forfaller i dag. Husk å betale!`,
          read: false
        });

      } catch (emailError: any) {
        console.error(`Error sending email to ${customerEmail}:`, emailError);
        errors.push(`${customerEmail}: ${emailError.message}`);
      }
    }

    console.log(`Reminder process complete. Sent: ${sentCount}, Errors: ${errors.length}`);

    return new Response(
      JSON.stringify({ 
        message: "Invoice reminders processed",
        sent: sentCount,
        total: invoices.length,
        errors: errors.length > 0 ? errors : undefined
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in send-invoice-due-reminder:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
