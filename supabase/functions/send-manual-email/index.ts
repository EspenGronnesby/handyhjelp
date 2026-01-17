import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const FUNCTION_NAME = "send-manual-email";

// Structured logging utility
const log = {
  info: (message: string, data?: Record<string, unknown>) => {
    console.log(JSON.stringify({
      level: "INFO",
      function: FUNCTION_NAME,
      timestamp: new Date().toISOString(),
      message,
      ...data
    }));
  },
  error: (message: string, error?: unknown, data?: Record<string, unknown>) => {
    console.error(JSON.stringify({
      level: "ERROR",
      function: FUNCTION_NAME,
      timestamp: new Date().toISOString(),
      message,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error,
      ...data
    }));
  },
  warn: (message: string, data?: Record<string, unknown>) => {
    console.warn(JSON.stringify({
      level: "WARN",
      function: FUNCTION_NAME,
      timestamp: new Date().toISOString(),
      message,
      ...data
    }));
  }
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const errorResponse = (message: string, status: number, details?: unknown) => {
  return new Response(
    JSON.stringify({
      success: false,
      error: message,
      details: details instanceof Error ? details.message : details,
      timestamp: new Date().toISOString()
    }),
    {
      status,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    }
  );
};

interface Recipient {
  email: string;
  name?: string;
  userId?: string;
  type: 'customer' | 'external';
}

interface ManualEmailRequest {
  recipients: Recipient[];
  subject: string;
  content: string;
  templateId?: string;
  templateName?: string;
  includeFeedbackButton: boolean;
  senderName: string;
  senderRole: string;
}

interface SendResult {
  email: string;
  success: boolean;
  error?: string;
}

// Convert plain text to HTML paragraphs
function textToHtml(text: string): string {
  return text
    .split('\n\n')
    .map(paragraph => `<p style="margin: 0 0 16px 0;">${paragraph.replace(/\n/g, '<br>')}</p>`)
    .join('');
}

// Generate the HandyHjelp branded email HTML
function generateEmailHtml(
  recipientName: string | undefined,
  subject: string,
  content: string,
  includeFeedbackButton: boolean
): string {
  const greeting = recipientName ? `Hei ${recipientName},` : 'Hei,';
  const contentHtml = textToHtml(content);
  
  const feedbackButtonHtml = includeFeedbackButton ? `
    <div style="text-align: center; margin: 30px 0;">
      <a href="https://handyhjelp.lovable.app/tilbakemelding" 
         style="display: inline-block; background: linear-gradient(135deg, #0891B2 0%, #06B6D4 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
        Gi oss din tilbakemelding
      </a>
    </div>
  ` : '';

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 0;
            background-color: #f5f5f5;
          }
          .container {
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #0891B2 0%, #06B6D4 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .content {
            padding: 30px 25px;
          }
          .greeting {
            font-size: 18px;
            margin-bottom: 20px;
          }
          .footer {
            text-align: center;
            padding: 25px 20px;
            color: #6b7280;
            font-size: 14px;
            border-top: 1px solid #e5e7eb;
            background: #fafafa;
          }
          .signature {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
          }
          a {
            color: #0891B2;
          }
        </style>
      </head>
      <body style="margin: 0; padding: 20px; background-color: #f5f5f5;">
        <div class="container">
          <div class="header">
            <div class="logo">HandyHjelp</div>
            <h1 style="margin: 0; font-size: 22px; font-weight: 500;">${subject}</h1>
          </div>
          
          <div class="content">
            <p class="greeting"><strong>${greeting}</strong></p>
            
            ${contentHtml}
            
            ${feedbackButtonHtml}
            
            <div class="signature">
              <p style="margin: 0;">Med vennlig hilsen,<br><strong>HandyHjelp-teamet</strong></p>
            </div>
          </div>
          
          <div class="footer">
            <p style="margin: 0 0 10px 0;"><strong>Levert med kvalitet</strong></p>
            <p style="margin: 0;">
              <a href="https://handyhjelp.no" style="color: #0891B2; text-decoration: none;">www.handyhjelp.no</a>
            </p>
            <p style="margin: 10px 0 0 0; font-size: 12px; color: #9ca3af;">
              Telefon: <a href="tel:+4741250553" style="color: #6b7280;">+47 412 50 553</a> | 
              E-post: <a href="mailto:team@handyhjelp.no" style="color: #6b7280;">team@handyhjelp.no</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

const handler = async (req: Request): Promise<Response> => {
  const requestId = crypto.randomUUID();
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  log.info("Request received", { requestId, method: req.method });

  // Validate request method
  if (req.method !== "POST") {
    log.warn("Invalid request method", { requestId, method: req.method });
    return errorResponse("Method not allowed", 405);
  }

  // Get auth token from header
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    log.warn("Missing authorization header", { requestId });
    return errorResponse("Missing authorization header", 401);
  }

  // Initialize clients
  const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Verify user and check role
  const token = authHeader.replace("Bearer ", "");
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  
  if (authError || !user) {
    log.warn("Invalid auth token", { requestId, error: authError?.message });
    return errorResponse("Unauthorized", 401);
  }

  // Check if user has admin or platform_owner role
  const { data: roles, error: rolesError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .in("role", ["admin", "platform_owner"]);

  if (rolesError || !roles || roles.length === 0) {
    log.warn("User does not have required role", { requestId, userId: user.id });
    return errorResponse("Forbidden: Admin or Owner role required", 403);
  }

  let requestData: ManualEmailRequest;

  try {
    requestData = await req.json();
  } catch (parseError) {
    log.error("Failed to parse request body", parseError, { requestId });
    return errorResponse("Invalid JSON in request body", 400);
  }

  const { recipients, subject, content, templateId, templateName, includeFeedbackButton, senderName, senderRole } = requestData;

  // Validate required fields
  if (!recipients || recipients.length === 0) {
    log.warn("No recipients provided", { requestId });
    return errorResponse("At least one recipient is required", 400);
  }

  if (!subject || !content) {
    log.warn("Missing subject or content", { requestId });
    return errorResponse("Subject and content are required", 400);
  }

  // Validate email format for all recipients
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  for (const recipient of recipients) {
    if (!emailRegex.test(recipient.email)) {
      log.warn("Invalid email format", { requestId, email: recipient.email });
      return errorResponse(`Invalid email format: ${recipient.email}`, 400);
    }
  }

  log.info("Sending emails", { 
    requestId, 
    recipientCount: recipients.length, 
    includeFeedbackButton 
  });

  // Generate batch ID for grouping
  const batchId = crypto.randomUUID();
  const results: SendResult[] = [];

  // Send emails to each recipient
  for (const recipient of recipients) {
    const emailHtml = generateEmailHtml(
      recipient.name,
      subject,
      content,
      includeFeedbackButton
    );

    try {
      const emailResponse = await resend.emails.send({
        from: "HandyHjelp <team@handyhjelp.no>",
        to: [recipient.email],
        subject: subject,
        html: emailHtml,
      });

      if (emailResponse.error) {
        throw emailResponse.error;
      }

      // Log successful send
      await supabase.from("email_logs").insert({
        recipient_email: recipient.email,
        recipient_name: recipient.name || null,
        recipient_user_id: recipient.userId || null,
        recipient_type: recipient.type,
        subject: subject,
        content: content,
        template_id: templateId || null,
        template_name: templateName || null,
        included_feedback_button: includeFeedbackButton,
        sender_user_id: user.id,
        sender_name: senderName,
        sender_role: senderRole,
        status: 'sent',
        batch_id: batchId,
      });

      results.push({ email: recipient.email, success: true });
      log.info("Email sent successfully", { 
        requestId, 
        recipient: recipient.email,
        messageId: emailResponse.data?.id 
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      // Log failed send
      await supabase.from("email_logs").insert({
        recipient_email: recipient.email,
        recipient_name: recipient.name || null,
        recipient_user_id: recipient.userId || null,
        recipient_type: recipient.type,
        subject: subject,
        content: content,
        template_id: templateId || null,
        template_name: templateName || null,
        included_feedback_button: includeFeedbackButton,
        sender_user_id: user.id,
        sender_name: senderName,
        sender_role: senderRole,
        status: 'failed',
        error_message: errorMessage,
        batch_id: batchId,
      });

      results.push({ email: recipient.email, success: false, error: errorMessage });
      log.error("Failed to send email", error, { requestId, recipient: recipient.email });
    }
  }

  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;

  log.info("Email sending completed", { 
    requestId, 
    successCount, 
    failCount, 
    batchId 
  });

  return new Response(JSON.stringify({
    success: failCount === 0,
    batchId,
    results,
    summary: {
      total: recipients.length,
      sent: successCount,
      failed: failCount,
    },
    requestId,
  }), {
    status: 200,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
};

serve(handler);
