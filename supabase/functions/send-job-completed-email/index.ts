import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "https://esm.sh/resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface JobCompleteRequest {
  jobId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { jobId }: JobCompleteRequest = await req.json();

    if (!jobId) {
      return new Response(
        JSON.stringify({ error: "jobId mangler" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Fetch job and related quote/profile information
    const { data: job, error: jobError } = await supabaseClient
      .from('jobs')
      .select(`
        *,
        quotes (
          name,
          email,
          description,
          address,
          company_name
        ),
        profiles (
          full_name,
          email
        )
      `)
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      console.error("Error fetching job:", jobError);
      return new Response(
        JSON.stringify({ error: "Kunne ikke hente jobb" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Update job status to completed and set completed_date
    const { error: updateError } = await supabaseClient
      .from('jobs')
      .update({ 
        status: 'completed',
        completed_date: new Date().toISOString()
      })
      .eq('id', jobId);

    if (updateError) {
      console.error("Error updating job status:", updateError);
      return new Response(
        JSON.stringify({ error: "Kunne ikke oppdatere jobbstatus" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Determine customer email (from quote or profile)
    const customerEmail = job.quotes?.email || job.profiles?.email;
    const customerName = job.quotes?.company_name || job.quotes?.name || job.profiles?.full_name || 'Kunde';
    const projectDescription = job.quotes?.description || 'Deres prosjekt';
    const projectAddress = job.quotes?.address || 'Oppgitt lokasjon';

    if (!customerEmail) {
      console.error("No customer email found for job:", jobId);
      return new Response(
        JSON.stringify({ error: "Kunde e-post ikke funnet" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Send email to customer
    const emailResponse = await resend.emails.send({
      from: "HandyHjelp <onboarding@resend.dev>",
      to: [customerEmail],
      subject: "Prosjektet ditt er ferdigstilt! ✅",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">Gratulerer ${customerName}!</h2>
          
          <p>Vi er glade for å kunne informere deg om at arbeidet på ditt prosjekt nå er ferdigstilt.</p>
          
          <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1e293b;">Prosjektdetaljer:</h3>
            <p><strong>Beskrivelse:</strong> ${projectDescription}</p>
            <p><strong>Lokasjon:</strong> ${projectAddress}</p>
          </div>
          
          <p>Takk for at du valgte HandyHjelp! Vi setter stor pris på tilliten din og håper du er fornøyd med resultatet.</p>
          
          <div style="background-color: #dbeafe; padding: 15px; border-left: 4px solid #0891B2; margin: 20px 0;">
            <p style="margin: 0;"><strong>Har du tilbakemeldinger?</strong></p>
            <p style="margin: 5px 0 0 0;">Vi vil gjerne høre fra deg! Din mening betyr mye for oss.</p>
          </div>
          
          <p>Skulle det være noe du lurer på, er vi alltid tilgjengelige:</p>
          <ul>
            <li>📞 Telefon: +47 41250553</li>
            <li>📧 E-post: handyhjelp@gmail.com</li>
          </ul>
          
          <p style="margin-top: 30px;">Vi ser frem til å hjelpe deg igjen i fremtiden!</p>
          
          <p>Med vennlig hilsen,<br>
          <strong>HandyHjelp teamet</strong></p>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #64748b;">
            HandyHjelp - Din pålitelige partner for alle typer eiendomsvedlikehold
          </p>
        </div>
      `,
    });

    console.log("Job completed email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-job-completed-email function:", error);
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
