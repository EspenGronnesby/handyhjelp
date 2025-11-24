import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AgreementConfirmationRequest {
  contactPerson: string;
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { contactPerson, email }: AgreementConfirmationRequest = await req.json();
    
    console.log(`Sending agreement confirmation email to: ${email}`);

    const { data, error } = await resend.emails.send({
      from: "HandyHjelp <team@handyhjelp.no>",
      to: [email],
      subject: "Takk for din avtaleforespørsel – HandyHjelp | Levert med kvalitet",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2C3E50;">Hei ${contactPerson},</h2>
          
          <p style="font-size: 16px; line-height: 1.6;">
            Takk for at dere vurderer HandyHjelp som deres faste servicepartner! 🏠
          </p>
          
          <p style="font-size: 16px; line-height: 1.6;">
            Vi har mottatt forespørselen deres og vil gjennomgå den grundig. Dere kan forvente å bli kontaktet <strong>innen 1-3 virkedager</strong> for en uforpliktende samtale om deres behov.
          </p>
          
          <div style="margin: 30px 0; padding: 20px; background-color: #F8FAFC; border-radius: 8px;">
            <p style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">Har dere spørsmål i mellomtiden?</p>
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
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      
      // Send error notification to team
      try {
        await resend.emails.send({
          from: "HandyHjelp System <team@handyhjelp.no>",
          to: ["team@handyhjelp.no"],
          subject: "⚠️ Feil ved sending av avtalebekreftelse",
          html: `
            <h2>Feil ved sending av avtalebekreftelse</h2>
            <p><strong>Kontaktperson:</strong> ${contactPerson} (${email})</p>
            <p><strong>Feilmelding:</strong> ${error.message}</p>
          `,
        });
      } catch (notificationError) {
        console.error("Failed to send error notification:", notificationError);
      }
      
      throw error;
    }

    console.log("Agreement confirmation email sent successfully:", data);

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-agreement-confirmation function:", error);
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
