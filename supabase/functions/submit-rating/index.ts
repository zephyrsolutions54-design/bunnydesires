import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface RatingRequest {
  callId: string;
  stars: number;
  feedback?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get user from token
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("Auth error:", userError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("User authenticated:", user.id);

    // Parse request body
    const { callId, stars, feedback }: RatingRequest = await req.json();

    // Validate input
    if (!callId || !stars || stars < 1 || stars > 5) {
      console.error("Invalid input:", { callId, stars });
      return new Response(
        JSON.stringify({ error: "Invalid input. Call ID and stars (1-5) are required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the call exists and user is the initiator
    const { data: call, error: callError } = await supabase
      .from("calls")
      .select("id, initiator_id, receiver_id, rated_by_user")
      .eq("id", callId)
      .single();

    if (callError || !call) {
      console.error("Call not found:", callError);
      return new Response(
        JSON.stringify({ error: "Call not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is the call initiator
    if (call.initiator_id !== user.id) {
      console.error("User is not the call initiator");
      return new Response(
        JSON.stringify({ error: "Only the call initiator can rate" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if already rated
    if (call.rated_by_user) {
      console.error("Call already rated");
      return new Response(
        JSON.stringify({ error: "Call has already been rated" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Submitting rating:", { callId, stars, feedback });

    // Insert rating (trigger will update profile and call)
    const { data: rating, error: ratingError } = await supabase
      .from("ratings")
      .insert({
        call_id: callId,
        from_user_id: user.id,
        to_user_id: call.receiver_id,
        stars,
        feedback: feedback || null,
      })
      .select()
      .single();

    if (ratingError) {
      console.error("Error inserting rating:", ratingError);
      return new Response(
        JSON.stringify({ error: "Failed to submit rating", details: ratingError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Rating submitted successfully:", rating);

    // Fetch updated profile of the receiver
    const { data: updatedProfile } = await supabase
      .from("profiles")
      .select("rating, total_ratings, rating_tier, current_earnings_rate")
      .eq("id", call.receiver_id)
      .single();

    return new Response(
      JSON.stringify({
        success: true,
        rating,
        updatedCreatorStats: updatedProfile,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
