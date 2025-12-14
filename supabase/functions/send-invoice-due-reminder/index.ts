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
          from: "HandyHjelp <noreply@resend.dev>",
          to: [customerEmail],
          subject: `Vennlig påminnelse: Faktura ${invoice.invoice_number} forfaller i dag`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #0891B2, #06B6D4); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
                .highlight { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0891B2; }
                .amount { font-size: 24px; color: #0891B2; font-weight: bold; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
                .emoji { font-size: 48px; margin-bottom: 10px; }
              </style>
            </head>
            <body>
              <div class="header">
                <div class="emoji">☀️</div>
                <h1 style="margin: 0;">Vennlig påminnelse</h1>
              </div>
              <div class="content">
                <p>Hei ${customerName}! 👋</p>
                
                <p>Vi håper du har det fint! Dette er bare en vennlig påminnelse om at fakturaen din forfaller <strong>i dag</strong>.</p>
                
                <div class="highlight">
                  <p style="margin: 0 0 10px 0;"><strong>Fakturanummer:</strong> ${invoice.invoice_number}</p>
                  <p style="margin: 0;"><strong>Beløp:</strong> <span class="amount">${formattedAmount}</span></p>
                </div>
                
                <p>Hvis du allerede har betalt, kan du se bort fra denne meldingen – tusen takk! 🙏</p>
                
                <p>Har du spørsmål om fakturaen eller trenger litt mer tid? Bare ta kontakt med oss, så finner vi en løsning sammen. Vi er her for å hjelpe! 💪</p>
                
                <p>Ha en fantastisk dag videre! ☀️</p>
                
                <p style="margin-top: 30px;">
                  Med vennlig hilsen,<br>
                  <strong>Teamet hos HandyHjelp</strong> 🏠
                </p>
              </div>
              <div class="footer">
                <p>📞 +47 41250553 | ✉️ handyhjelp@gmail.com</p>
                <p>Ægirsvei 3, Kristiansand</p>
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
