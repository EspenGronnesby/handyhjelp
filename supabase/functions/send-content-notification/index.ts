import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, title, submitterEmail, isEdit } = await req.json();

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    // Get admin/owner emails via service role
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: adminRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .in("role", ["admin", "platform_owner"]);

    if (!adminRoles || adminRoles.length === 0) {
      return new Response(JSON.stringify({ message: "No admins found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userIds = adminRoles.map((r) => r.user_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("email, full_name")
      .in("id", userIds);

    if (!profiles || profiles.length === 0) {
      return new Response(JSON.stringify({ message: "No admin profiles found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const typeLabel = type === "blog" ? "blogginnlegg" : "prosjekt";
    const actionLabel = isEdit ? "sendt inn på nytt" : "sendt inn";
    const subject = `Nytt ${typeLabel} til godkjenning – ${title}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="margin:0;padding:0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;background-color:#f4f4f5;">
        <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <div style="background:#1a1a2e;padding:24px 32px;text-align:center;">
            <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:700;">HandyHjelp</h1>
          </div>
          <div style="padding:32px;">
            <h2 style="color:#1a1a2e;margin:0 0 16px;font-size:18px;">Nytt innhold til godkjenning</h2>
            <p style="color:#555;line-height:1.6;margin:0 0 12px;">
              <strong>${submitterEmail || "En worker"}</strong> har ${actionLabel} et ${typeLabel}:
            </p>
            <div style="background:#f4f4f5;border-radius:8px;padding:16px;margin:16px 0;">
              <p style="margin:0;font-size:16px;font-weight:600;color:#1a1a2e;">${title}</p>
              <p style="margin:4px 0 0;font-size:13px;color:#888;">Type: ${typeLabel} · ${isEdit ? "Redigert" : "Ny innsending"}</p>
            </div>
            <p style="color:#555;line-height:1.6;margin:16px 0 0;">
              Logg inn i admin-panelet for å godkjenne eller avvise innholdet.
            </p>
          </div>
          <div style="background:#f9fafb;padding:16px 32px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              HandyHjelp – Kristiansand · Denne e-posten ble sendt automatisk
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send to all admins
    const recipientEmails = profiles.map((p) => p.email);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "HandyHjelp <noreply@notify.handyhjelp.no>",
        to: recipientEmails,
        subject,
        html: htmlContent,
      }),
    });

    const resData = await res.json();

    return new Response(JSON.stringify({ success: true, data: resData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error sending content notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
