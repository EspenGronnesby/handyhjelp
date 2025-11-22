import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface JobStatusEmailRequest {
  customerName: string;
  customerEmail: string;
  jobDescription: string;
  status: "started" | "completed";
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { customerName, customerEmail, jobDescription, status }: JobStatusEmailRequest = await req.json();
    
    console.log(`Sending ${status} email to: ${customerEmail}`);

    let subject: string;
    let html: string;

    if (status === "started") {
      subject = "Ditt oppdrag er i gang – HandyHjelp";
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2C3E50;">Hei ${customerName},</h2>
          
          <p style="font-size: 16px; line-height: 1.6;">
            Gode nyheter! Vi har startet arbeidet med ditt oppdrag:
          </p>
          
          <div style="background-color: #F1F5F9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="font-size: 16px; font-weight: bold; margin: 0;">
              "${jobDescription}"
            </p>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6;">
            Takk for tålmodigheten – vi jobber for å levere med kvalitet. Du vil motta en ny bekreftelse når oppdraget er fullført.
          </p>
          
          <div style="margin: 30px 0; padding: 20px; background-color: #F8FAFC; border-radius: 8px;">
            <p style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Har du spørsmål underveis?</p>
            <p style="margin: 5px 0;">📞 Ring oss: <a href="tel:+4741250553" style="color: #0891B2; text-decoration: none;">+47 412 50 553</a></p>
            <p style="margin: 5px 0;">📧 E-post: <a href="mailto:team@handyhjelp.no" style="color: #0891B2; text-decoration: none;">team@handyhjelp.no</a></p>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6;">
            Med vennlig hilsen,<br>
            <strong>HandyHjelp-teamet</strong>
          </p>
          
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
          
          <p style="font-size: 14px; color: #6B7280; text-align: center;">
            HandyHjelp – Levert med kvalitet<br>
            <a href="https://www.handyhjelp.no" style="color: #0891B2; text-decoration: none;">www.handyhjelp.no</a>
          </p>
        </div>
      `;
    } else {
      subject = "Oppdraget er fullført – Takk for tilliten! ✓";
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2C3E50;">Hei ${customerName},</h2>
          
          <p style="font-size: 16px; line-height: 1.6;">
            Oppdraget ditt er nå fullført:
          </p>
          
          <div style="background-color: #F1F5F9; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="font-size: 16px; font-weight: bold; margin: 0;">
              "${jobDescription}"
            </p>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6;">
            Takk for at du valgte HandyHjelp! Vi håper du er fornøyd med arbeidet.
          </p>
          
          <div style="margin: 30px 0; padding: 20px; background-color: #F8FAFC; border-radius: 8px;">
            <p style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Har du tilbakemeldinger eller nye oppdrag?</p>
            <p style="font-size: 16px; margin-bottom: 10px;">Vi er alltid klare til å hjelpe.</p>
            <p style="margin: 5px 0;">📞 Ring oss: <a href="tel:+4741250553" style="color: #0891B2; text-decoration: none;">+47 412 50 553</a></p>
            <p style="margin: 5px 0;">📧 E-post: <a href="mailto:team@handyhjelp.no" style="color: #0891B2; text-decoration: none;">team@handyhjelp.no</a></p>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6;">
            Med vennlig hilsen,<br>
            <strong>HandyHjelp-teamet</strong>
          </p>
          
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;">
          
          <p style="font-size: 14px; color: #6B7280; text-align: center;">
            HandyHjelp – Levert med kvalitet<br>
            <a href="https://www.handyhjelp.no" style="color: #0891B2; text-decoration: none;">www.handyhjelp.no</a>
          </p>
        </div>
      `;
    }

    const { data, error } = await resend.emails.send({
      from: "HandyHjelp <team@handyhjelp.no>",
      to: [customerEmail],
      subject: subject,
      html: html,
    });

    if (error) {
      console.error("Resend error:", error);
      
      // Send error notification to team
      try {
        await resend.emails.send({
          from: "HandyHjelp System <team@handyhjelp.no>",
          to: ["team@handyhjelp.no"],
          subject: "⚠️ Feil ved sending av jobbstatus-epost",
          html: `
            <h2>Feil ved sending av jobbstatus-epost</h2>
            <p><strong>Kunde:</strong> ${customerName} (${customerEmail})</p>
            <p><strong>Status:</strong> ${status}</p>
            <p><strong>Jobbeskrivelse:</strong> ${jobDescription}</p>
            <p><strong>Feilmelding:</strong> ${error.message}</p>
          `,
        });
      } catch (notificationError) {
        console.error("Failed to send error notification:", notificationError);
      }
      
      throw error;
    }

    console.log(`${status} email sent successfully:`, data);

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error(`Error in send-job-status-email function:`, error);
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
