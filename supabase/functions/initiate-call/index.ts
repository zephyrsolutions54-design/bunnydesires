import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as jose from "https://deno.land/x/jose@v5.2.0/index.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function generateRoomName(callId: string): string {
  return `call_${callId}`;
}

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

    const { receiverId } = await req.json();
    if (!receiverId) {
      return new Response(
        JSON.stringify({ error: "Receiver ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify caller profile
    const { data: callerProfile } = await adminClient
      .from("profiles")
      .select("name, gender")
      .eq("id", user.id)
      .single();

    if (!callerProfile || callerProfile.gender !== "male") {
      return new Response(
        JSON.stringify({ error: "Only male users can initiate calls" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify receiver
    const { data: receiver } = await adminClient
      .from("profiles")
      .select("id, name, gender, is_online, current_earnings_rate, avatar_url, language")
      .eq("id", receiverId)
      .single();

    if (!receiver) {
      return new Response(
        JSON.stringify({ error: "Creator not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (receiver.gender !== "female") {
      return new Response(
        JSON.stringify({ error: "Can only call creators" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!receiver.is_online) {
      return new Response(
        JSON.stringify({ error: "Creator is currently offline" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check for existing active calls for either party
    const { data: activeCalls } = await adminClient
      .from("calls")
      .select("id")
      .in("status", ["pending", "active"])
      .or(`initiator_id.eq.${user.id},receiver_id.eq.${user.id},initiator_id.eq.${receiverId},receiver_id.eq.${receiverId}`);

    if (activeCalls && activeCalls.length > 0) {
      return new Response(
        JSON.stringify({ error: "One of the parties is already in a call" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const coinsPerMinute = receiver.current_earnings_rate || 6;

    // Check wallet
    const { data: wallet } = await adminClient
      .from("wallets")
      .select("balance")
      .eq("user_id", user.id)
      .single();

    if (!wallet || wallet.balance < coinsPerMinute) {
      return new Response(
        JSON.stringify({ error: "Insufficient coins for a call", required: coinsPerMinute, available: wallet?.balance || 0 }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create call record
    const { data: call, error: callError } = await adminClient
      .from("calls")
      .insert({
        initiator_id: user.id,
        receiver_id: receiverId,
        status: "pending",
        coins_per_minute: coinsPerMinute,
      })
      .select("id")
      .single();

    if (callError || !call) {
      console.error("Call creation error:", callError);
      return new Response(
        JSON.stringify({ error: "Failed to create call" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const roomName = generateRoomName(call.id);

    // Generate token for the caller
    const callerToken = await createLiveKitToken(
      livekitApiKey,
      livekitApiSecret,
      roomName,
      user.id,
      callerProfile.name
    );

    return new Response(
      JSON.stringify({
        success: true,
        callId: call.id,
        token: callerToken,
        roomName,
        coinsPerMinute,
        receiver: {
          id: receiver.id,
          name: receiver.name,
          avatar_url: receiver.avatar_url,
          language: receiver.language || "en",
        },
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
