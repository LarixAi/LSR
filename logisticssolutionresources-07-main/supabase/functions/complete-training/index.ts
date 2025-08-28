import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TrainingCompletionRequest {
  moduleId: string;
  score: number;
  moduleName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Set the auth token
    supabase.auth.setSession({
      access_token: authHeader.replace("Bearer ", ""),
      refresh_token: "",
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const { moduleId, score, moduleName }: TrainingCompletionRequest = await req.json();

    // Get user's organization
    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .single();

    if (!profile?.organization_id) {
      throw new Error("User organization not found");
    }

    // Check if training already exists and is still valid
    const { data: existingCompletion } = await supabase
      .from("training_completions")
      .select("*")
      .eq("driver_id", user.id)
      .eq("module_id", moduleId)
      .gt("expires_at", new Date().toISOString())
      .order("completed_at", { ascending: false })
      .limit(1)
      .single();

    // If valid completion exists, don't allow retaking
    if (existingCompletion) {
      return new Response(
        JSON.stringify({ 
          error: "Training already completed and still valid",
          existingCompletion 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const passed = score >= 80; // Minimum passing score
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 3); // 3 months from now

    // Save training completion
    const { data: completion, error: completionError } = await supabase
      .from("training_completions")
      .insert({
        driver_id: user.id,
        module_id: moduleId,
        score,
        status: passed ? "passed" : "failed",
        expires_at: expiresAt.toISOString(),
        organization_id: profile.organization_id,
      })
      .select()
      .single();

    if (completionError) {
      throw completionError;
    }

    let certificate = null;

    // Generate certificate if passed
    if (passed && completion) {
      const { data: cert, error: certError } = await supabase
        .from("training_certificates")
        .insert({
          completion_id: completion.id,
          driver_id: user.id,
          module_name: moduleName,
          score,
          expires_at: expiresAt.toISOString(),
          organization_id: profile.organization_id,
        })
        .select()
        .single();

      if (!certError) {
        certificate = cert;
      }
    }

    // Create notification for admins
    const { data: admins } = await supabase
      .from("profiles")
      .select("id")
      .eq("organization_id", profile.organization_id)
      .eq("role", "admin");

    // Send notifications to all admins
    if (admins) {
      const notifications = admins.map(admin => ({
        user_id: admin.id,
        organization_id: profile.organization_id,
        title: `Training Completion - ${moduleName}`,
        message: `Driver completed ${moduleName} with a score of ${score}% (${passed ? 'PASSED' : 'FAILED'})`,
        type: passed ? "success" : "warning",
      }));

      await supabase
        .from("notifications")
        .insert(notifications);
    }

    console.log(`Training completion recorded: ${user.id} - ${moduleId} - Score: ${score}% - ${passed ? 'PASSED' : 'FAILED'}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        completion,
        certificate,
        passed,
        score 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in complete-training function:", error);
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