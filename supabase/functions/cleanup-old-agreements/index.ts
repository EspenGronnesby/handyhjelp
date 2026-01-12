import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log("Starting cleanup of old rejected agreements...");
    
    // Calculate the cutoff date (1 month ago)
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const cutoffDate = oneMonthAgo.toISOString();
    
    console.log(`Cutoff date: ${cutoffDate}`);
    
    // Find old rejected agreements
    const { data: oldAgreements, error: fetchError } = await supabase
      .from("service_agreements")
      .select("id, offer_document_url, contract_document_url")
      .eq("status", "rejected")
      .lt("rejected_at", cutoffDate);
    
    if (fetchError) {
      console.error("Error fetching old agreements:", fetchError);
      throw fetchError;
    }
    
    console.log(`Found ${oldAgreements?.length || 0} old rejected agreements to delete`);
    
    if (!oldAgreements || oldAgreements.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No old rejected agreements to delete",
          deletedCount: 0 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Delete associated documents from storage
    for (const agreement of oldAgreements) {
      try {
        // Delete offer document if exists
        if (agreement.offer_document_url) {
          const offerPath = agreement.offer_document_url.split("/agreement-documents/")[1];
          if (offerPath) {
            await supabase.storage.from("agreement-documents").remove([offerPath]);
            console.log(`Deleted offer document: ${offerPath}`);
          }
        }
        
        // Delete contract document if exists
        if (agreement.contract_document_url) {
          const contractPath = agreement.contract_document_url.split("/agreement-documents/")[1];
          if (contractPath) {
            await supabase.storage.from("agreement-documents").remove([contractPath]);
            console.log(`Deleted contract document: ${contractPath}`);
          }
        }
      } catch (storageError) {
        console.error(`Error deleting documents for agreement ${agreement.id}:`, storageError);
        // Continue with deletion even if storage cleanup fails
      }
    }
    
    // Delete the agreement activities first (foreign key constraint)
    const agreementIds = oldAgreements.map(a => a.id);
    
    const { error: activitiesError } = await supabase
      .from("agreement_activities")
      .delete()
      .in("agreement_id", agreementIds);
    
    if (activitiesError) {
      console.error("Error deleting agreement activities:", activitiesError);
    }
    
    // Delete the agreements
    const { error: deleteError } = await supabase
      .from("service_agreements")
      .delete()
      .in("id", agreementIds);
    
    if (deleteError) {
      console.error("Error deleting agreements:", deleteError);
      throw deleteError;
    }
    
    console.log(`Successfully deleted ${oldAgreements.length} old rejected agreements`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Deleted ${oldAgreements.length} old rejected agreements`,
        deletedCount: oldAgreements.length 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error: unknown) {
    console.error("Cleanup error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
