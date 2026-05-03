import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as jose from "https://deno.land/x/jose@v5.2.0/index.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function createLiveKitToken(
  apiKey: string,
  apiSecret: string,
  roomName: string,
  participantIdentity: string,
  participantName: string
): Promise<string> {
  const secret = new TextEncoder().encode(apiSecret);
  const now = Math.floor(Date.now() / 1000);

  const token = await new jose.SignJWT({
    iss: apiKey,
    sub: participantIdentity,
    name: participantName,
    nbf: now,
    exp: now + 7200,
    video: {
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    },
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .sign(secret);

  return token;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const livekitApiKey = Deno.env.get("LIVEKIT_API_KEY")!;
    const livekitApiSecret = Deno.env.get("LIVEKIT_API_SECRET")!;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { callId } = await req.json();
    if (!callId) {
      return new Response(
        JSON.stringify({ error: "Call ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch call
    const { data: call, error: callError } = await adminClient
      .from("calls")
      .select("id, receiver_id, initiator_id, status")
      .eq("id", callId)
      .single();

    if (callError || !call) {
      return new Response(
        JSON.stringify({ error: "Call not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (call.receiver_id !== user.id) {
      return new Response(
        JSON.stringify({ error: "You are not the receiver of this call" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (call.status !== "pending") {
      return new Response(
        JSON.stringify({ error: `Call is already ${call.status}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update call to active
    const { error: updateError } = await adminClient
      .from("calls")
      .update({
        status: "active",
        start_time: new Date().toISOString(),
      })
      .eq("id", callId);

    if (updateError) {
      console.error("Call update error:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to accept call" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get creator profile for name
    const { data: creatorProfile } = await adminClient
      .from("profiles")
      .select("name")
      .eq("id", user.id)
      .single();

    const roomName = `call_${callId}`;

    const token = await createLiveKitToken(
      livekitApiKey,
      livekitApiSecret,
      roomName,
      user.id,
      creatorProfile?.name || "Creator"
    );

    return new Response(
      JSON.stringify({
        success: true,
        token,
        roomName,
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
