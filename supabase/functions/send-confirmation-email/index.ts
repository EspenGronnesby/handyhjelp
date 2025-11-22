import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConfirmationEmailRequest {
  name: string;
  email: string;
  phone?: string;
  customerType: 'private' | 'business';
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, phone, customerType }: ConfirmationEmailRequest = await req.json();

    console.log(`Sending confirmation email to: ${email}`);

    // Send confirmation email to customer
    const customerEmailResponse = await resend.emails.send({
      from: "HandyHjelp <team@handyhjelp.no>",
      to: [email],
      subject: "Takk for din forespørsel – HandyHjelp",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #0891B2 0%, #06B6D4 100%);
                color: white;
                padding: 30px 20px;
                text-align: center;
                border-radius: 8px 8px 0 0;
              }
              .content {
                background: #ffffff;
                padding: 30px 20px;
                border: 1px solid #e5e7eb;
                border-top: none;
              }
              .steps {
                background: #f8fafc;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
              }
              .step {
                display: flex;
                align-items: flex-start;
                margin-bottom: 15px;
              }
              .step-number {
                background: #0891B2;
                color: white;
                width: 28px;
                height: 28px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                margin-right: 12px;
                flex-shrink: 0;
              }
              .contact-info {
                background: #f0f9ff;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
              }
              .contact-item {
                margin-bottom: 10px;
              }
              .contact-label {
                font-weight: 600;
                color: #0891B2;
              }
              .footer {
                text-align: center;
                padding: 20px;
                color: #6b7280;
                font-size: 14px;
                border-top: 1px solid #e5e7eb;
              }
              .logo {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 10px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo">🏠 HandyHjelp</div>
              <h1 style="margin: 0; font-size: 28px;">Takk for din forespørsel!</h1>
            </div>
            
            <div class="content">
              <p style="font-size: 18px; margin-bottom: 20px;">Hei <strong>${name}</strong>,</p>
              
              <p>Takk for at du kontaktet HandyHjelp! 🏠</p>
              
              <p>Vi har mottatt din forespørsel og vil gjennomgå den så snart som mulig. Du kan forvente å høre fra oss <strong>innen 2 timer</strong> i vår åpningstid.</p>
              
              <div class="steps">
                <h3 style="margin-top: 0; color: #0891B2;">Hva skjer videre?</h3>
                <div class="step">
                  <div class="step-number">1</div>
                  <div>Vi vurderer oppdraget ditt og lager et skreddersydd tilbud</div>
                </div>
                <div class="step">
                  <div class="step-number">2</div>
                  <div>Du mottar et uforpliktende tilbud på SMS eller e-post</div>
                </div>
                <div class="step">
                  <div class="step-number">3</div>
                  <div>Hvis du aksepterer, avtaler vi tidspunkt som passer deg</div>
                </div>
              </div>
              
              <div class="contact-info">
                <h3 style="margin-top: 0; color: #0891B2;">Har du spørsmål i mellomtiden?</h3>
                <div class="contact-item">
                  <span class="contact-label">📞 Telefon:</span> <a href="tel:+4741250553" style="color: #0891B2; text-decoration: none;">+47 412 50 553</a>
                </div>
                <div class="contact-item">
                  <span class="contact-label">✉️ E-post:</span> <a href="mailto:team@handyhjelp.no" style="color: #0891B2; text-decoration: none;">team@handyhjelp.no</a>
                </div>
                <div class="contact-item">
                  <span class="contact-label">⏰ Åpningstid:</span> Man-Fre 07:00-17:00
                </div>
              </div>
              
              <p style="margin-top: 30px;">Med vennlig hilsen,<br><strong>HandyHjelp-teamet</strong></p>
            </div>
            
            <div class="footer">
              <strong>HandyHjelp – Din lokale altmuligmann</strong><br>
              <a href="https://handyhjelp.no" style="color: #0891B2; text-decoration: none;">www.handyhjelp.no</a>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Customer email sent successfully:", customerEmailResponse);

    return new Response(JSON.stringify({ 
      success: true,
      messageId: customerEmailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in send-confirmation-email function:", error);

    // Try to send error notification email to team
    try {
      const { name, email, phone, customerType } = await req.json();
      
      await resend.emails.send({
        from: "HandyHjelp System <team@handyhjelp.no>",
        to: ["team@handyhjelp.no"],
        subject: "⚠️ FEIL: Bekreftelsesmail kunne ikke sendes",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  padding: 20px;
                }
                .alert {
                  background: #fef2f2;
                  border: 2px solid #dc2626;
                  border-radius: 8px;
                  padding: 20px;
                  margin: 20px 0;
                }
                .info-box {
                  background: #f8fafc;
                  padding: 15px;
                  border-radius: 6px;
                  margin: 15px 0;
                }
                .info-row {
                  margin-bottom: 8px;
                }
                .label {
                  font-weight: 600;
                  color: #0891B2;
                }
              </style>
            </head>
            <body>
              <div class="alert">
                <h2 style="margin-top: 0; color: #dc2626;">⚠️ Feil ved sending av bekreftelsesmail</h2>
                <p>En bekreftelsesmail kunne ikke sendes til kunde.</p>
              </div>
              
              <div class="info-box">
                <h3 style="margin-top: 0;">Kundeinfo:</h3>
                <div class="info-row"><span class="label">Navn:</span> ${name}</div>
                <div class="info-row"><span class="label">E-post:</span> ${email}</div>
                <div class="info-row"><span class="label">Telefon:</span> ${phone || 'Ikke oppgitt'}</div>
                <div class="info-row"><span class="label">Type:</span> ${customerType === 'private' ? 'Privat' : 'Bedrift'}</div>
              </div>
              
              <div class="info-box">
                <h3 style="margin-top: 0;">Feilmelding:</h3>
                <pre style="background: #1f2937; color: #f9fafb; padding: 12px; border-radius: 4px; overflow-x: auto;">${error.message || 'Ukjent feil'}</pre>
              </div>
              
              <p><strong>⚠️ Vennligst kontakt kunden manuelt for å bekrefte at forespørselen er mottatt.</strong></p>
            </body>
          </html>
        `,
      });

      console.log("Error notification sent to team");
    } catch (notificationError) {
      console.error("Failed to send error notification:", notificationError);
    }

    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
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
