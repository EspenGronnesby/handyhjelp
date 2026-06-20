import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const cronSecret = Deno.env.get("CRON_SECRET");

    // --- Authorization: require either a cron secret OR an admin/owner JWT ---
    const providedCronSecret = req.headers.get("x-cron-secret");
    let authorized = false;

    if (cronSecret && providedCronSecret && providedCronSecret === cronSecret) {
      authorized = true;
    } else {
      const authHeader = req.headers.get("Authorization");
      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.replace("Bearer ", "");
        const userClient = createClient(supabaseUrl, supabaseAnonKey, {
          global: { headers: { Authorization: `Bearer ${token}` } },
        });
        const { data: userData, error: userError } = await userClient.auth.getUser(token);
        if (!userError && userData?.user) {
          const adminClient = createClient(supabaseUrl, supabaseServiceKey);
          const { data: roles } = await adminClient
            .from("user_roles")
            .select("role")
            .eq("user_id", userData.user.id)
            .in("role", ["admin", "platform_owner"]);
          if (roles && roles.length > 0) {
            authorized = true;
          }
        }
      }
    }

    if (!authorized) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting cleanup of old rejected agreements...");

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const cutoffDate = oneMonthAgo.toISOString();

    const { data: oldAgreements, error: fetchError } = await supabase
      .from("service_agreements")
      .select("id, offer_document_url, contract_document_url")
      .eq("status", "rejected")
      .lt("rejected_at", cutoffDate);

    if (fetchError) {
      console.error("Error fetching old agreements:", fetchError);
      throw fetchError;
    }

    if (!oldAgreements || oldAgreements.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No old rejected agreements to delete", deletedCount: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    for (const agreement of oldAgreements) {
      try {
        if (agreement.offer_document_url) {
          const offerPath = agreement.offer_document_url.split("/agreement-documents/")[1];
          if (offerPath) {
            await supabase.storage.from("agreement-documents").remove([offerPath]);
          }
        }
        if (agreement.contract_document_url) {
          const contractPath = agreement.contract_document_url.split("/agreement-documents/")[1];
          if (contractPath) {
            await supabase.storage.from("agreement-documents").remove([contractPath]);
          }
        }
      } catch (storageError) {
        console.error(`Error deleting documents for agreement ${agreement.id}:`, storageError);
      }
    }

    const agreementIds = oldAgreements.map((a) => a.id);

    await supabase.from("agreement_activities").delete().in("agreement_id", agreementIds);

    const { error: deleteError } = await supabase
      .from("service_agreements")
      .delete()
      .in("id", agreementIds);

    if (deleteError) {
      console.error("Error deleting agreements:", deleteError);
      throw deleteError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Deleted ${oldAgreements.length} old rejected agreements`,
        deletedCount: oldAgreements.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Cleanup error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
