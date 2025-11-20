import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature",
};

interface ResendWebhookEvent {
  type: string;
  created_at: string;
  data: {
    email_id?: string;
    from?: string;
    to?: string[];
    subject?: string;
    created_at?: string;
    error?: {
      message: string;
      name: string;
    };
    [key: string]: any;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received webhook request");

    // Get the webhook signature headers
    const svixId = req.headers.get("svix-id");
    const svixTimestamp = req.headers.get("svix-timestamp");
    const svixSignature = req.headers.get("svix-signature");

    console.log("Webhook headers:", { svixId, svixTimestamp, svixSignature });

    // Get the raw body
    const body = await req.text();
    console.log("Webhook body:", body);

    // Verify webhook signature using Resend's signing secret
    const webhookSecret = Deno.env.get("RESEND_WEBHOOK_SECRET");
    if (!webhookSecret) {
      console.error("RESEND_WEBHOOK_SECRET not configured");
      return new Response(
        JSON.stringify({ error: "Webhook secret not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Verify the webhook signature
    if (svixId && svixTimestamp && svixSignature) {
      // Create the signed content
      const signedContent = `${svixId}.${svixTimestamp}.${body}`;
      
      // Resend uses HMAC SHA256
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(webhookSecret.split("_")[1]), // Remove whsec_ prefix
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );
      
      const signature = await crypto.subtle.sign(
        "HMAC",
        key,
        encoder.encode(signedContent)
      );
      
      const expectedSignature = Array.from(new Uint8Array(signature))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      
      // Compare signatures (Resend sends multiple signatures separated by spaces)
      const signatures = svixSignature.split(" ");
      const isValid = signatures.some(sig => {
        const sigValue = sig.split(",")[1]; // Format is "v1,signature"
        return sigValue === expectedSignature;
      });

      if (!isValid) {
        console.error("Invalid webhook signature - rejecting request");
        return new Response(
          JSON.stringify({ error: "Invalid signature" }),
          {
            status: 401,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
    }

    // Parse the event
    const event: ResendWebhookEvent = JSON.parse(body);
    console.log("Parsed event:", event);

    // Map Resend event types to our event types
    const eventTypeMap: { [key: string]: string } = {
      "email.sent": "sent",
      "email.delivered": "delivered",
      "email.delivery_delayed": "delivery_delayed",
      "email.complained": "complained",
      "email.bounced": "bounced",
      "email.failed": "failed",
      "email.opened": "opened",
      "email.clicked": "clicked",
    };

    const mappedEventType = eventTypeMap[event.type];
    if (!mappedEventType) {
      console.warn(`Unknown event type: ${event.type}`);
      return new Response(
        JSON.stringify({ message: "Event type not tracked" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Create Supabase client with service role for admin operations
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extract email data
    const emailId = event.data.email_id;
    const recipient = event.data.to?.[0] || "unknown";
    const subject = event.data.subject || null;
    const fromEmail = event.data.from || "team@handyhjelp.no";
    const errorMessage = event.data.error?.message || null;

    if (!emailId) {
      console.error("No email_id in event data");
      return new Response(
        JSON.stringify({ error: "No email_id in event" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Processing ${mappedEventType} event for email ${emailId}`);

    // Check if we already have a record for this email_id
    const { data: existingLog } = await supabase
      .from("email_logs")
      .select("id, event_type")
      .eq("email_id", emailId)
      .single();

    if (existingLog) {
      // Update existing record with new event type
      console.log(`Updating existing log for email ${emailId}`);
      const { error: updateError } = await supabase
        .from("email_logs")
        .update({
          event_type: mappedEventType,
          resend_created_at: event.created_at,
          metadata: event.data,
          error_message: errorMessage,
        })
        .eq("email_id", emailId);

      if (updateError) {
        console.error("Error updating email log:", updateError);
        throw updateError;
      }

      console.log(`Successfully updated email log for ${emailId}`);
    } else {
      // Insert new record
      console.log(`Creating new log for email ${emailId}`);
      const { error: insertError } = await supabase
        .from("email_logs")
        .insert({
          email_id: emailId,
          event_type: mappedEventType,
          recipient,
          subject,
          from_email: fromEmail,
          resend_created_at: event.created_at,
          metadata: event.data,
          error_message: errorMessage,
        });

      if (insertError) {
        console.error("Error inserting email log:", insertError);
        throw insertError;
      }

      console.log(`Successfully created email log for ${emailId}`);
    }

    return new Response(
      JSON.stringify({ message: "Webhook processed successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error processing webhook:", error);
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
