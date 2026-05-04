import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { coinsToApproxInrAmount, DEFAULT_COINS_PER_MINUTE } from "../_shared/coins-inr.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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

    const { data: call, error: callError } = await adminClient
      .from("calls")
      .select("*")
      .eq("id", callId)
      .single();

    if (callError || !call) {
      return new Response(
        JSON.stringify({ error: "Call not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user is part of the call
    if (call.initiator_id !== user.id && call.receiver_id !== user.id) {
      return new Response(
        JSON.stringify({ error: "You are not part of this call" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (call.status === "ended") {
      return new Response(
        JSON.stringify({ error: "Call has already ended" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const endTime = new Date();
    let durationSeconds = 0;
    let coinsSpent = 0;

    if (call.status === "active" && call.start_time) {
      const startTime = new Date(call.start_time);
      durationSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
      const minutesBilled = Math.ceil(durationSeconds / 60);
      coinsSpent = minutesBilled * (call.coins_per_minute || DEFAULT_COINS_PER_MINUTE);
    }

    // Cap coins at caller's actual balance
    const { data: callerWallet } = await adminClient
      .from("wallets")
      .select("*")
      .eq("user_id", call.initiator_id)
      .single();

    if (callerWallet && coinsSpent > callerWallet.balance) {
      coinsSpent = callerWallet.balance;
    }

    // Update call record
    const { error: updateError } = await adminClient
      .from("calls")
      .update({
        status: "ended",
        end_time: endTime.toISOString(),
        duration_seconds: durationSeconds,
        coins_spent: coinsSpent,
      })
      .eq("id", callId);

    if (updateError) {
      console.error("Call update error:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to end call" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Settle coins only if there was an active call with duration
    if (coinsSpent > 0 && callerWallet) {
      // Fetch platform commission rate
      const { data: config } = await adminClient
        .from("platform_config")
        .select("commission_rate")
        .limit(1)
        .single();

      const commissionRate = config?.commission_rate ?? 0.20;
      const commissionCoins = Math.floor(coinsSpent * commissionRate);
      const creatorCoins = coinsSpent - commissionCoins;

      // Deduct from caller
      await adminClient
        .from("wallets")
        .update({
          balance: callerWallet.balance - coinsSpent,
          total_spent: callerWallet.total_spent + coinsSpent,
          updated_at: endTime.toISOString(),
        })
        .eq("user_id", call.initiator_id);

      // Credit creator earnings (only their share after commission)
      const { data: creatorEarnings } = await adminClient
        .from("earnings")
        .select("*")
        .eq("user_id", call.receiver_id)
        .single();

      if (creatorEarnings) {
        await adminClient
          .from("earnings")
          .update({
            call_earnings: creatorEarnings.call_earnings + creatorCoins,
            total_earnings: creatorEarnings.total_earnings + creatorCoins,
            available_balance: creatorEarnings.available_balance + creatorCoins,
            gross_earnings: (creatorEarnings.gross_earnings || 0) + coinsSpent,
            commission_paid: (creatorEarnings.commission_paid || 0) + commissionCoins,
            updated_at: endTime.toISOString(),
          })
          .eq("user_id", call.receiver_id);
      }

      // Record platform commission
      await adminClient.from("platform_earnings").insert({
        source_type: "call_commission",
        source_id: callId,
        gross_coins: coinsSpent,
        commission_coins: commissionCoins,
        creator_coins: creatorCoins,
        creator_id: call.receiver_id,
        payer_id: call.initiator_id,
      });

      // Get names for transaction descriptions
      const { data: callerProfile } = await adminClient
        .from("profiles")
        .select("name")
        .eq("id", call.initiator_id)
        .single();

      const { data: receiverProfile } = await adminClient
        .from("profiles")
        .select("name")
        .eq("id", call.receiver_id)
        .single();

      // Record transactions
      await adminClient.from("transactions").insert([
        {
          user_id: call.initiator_id,
          type: "call_deduction",
          coins: coinsSpent,
          amount: coinsToApproxInrAmount(coinsSpent),
          status: "completed",
          related_user_id: call.receiver_id,
          related_call_id: callId,
          description: `Video call with ${receiverProfile?.name || "Creator"} - ${Math.ceil(durationSeconds / 60)} min`,
        },
        {
          user_id: call.receiver_id,
          type: "earnings_credit",
          coins: creatorCoins,
          amount: coinsToApproxInrAmount(creatorCoins),
          status: "completed",
          related_user_id: call.initiator_id,
          related_call_id: callId,
          description: `Video call with ${callerProfile?.name || "User"} - ${Math.ceil(durationSeconds / 60)} min (${Math.round((1 - commissionRate) * 100)}% of ${coinsSpent} coins)`,
        },
      ]);
    }

    return new Response(
      JSON.stringify({
        success: true,
        duration: durationSeconds,
        coinsSpent,
        callId,
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
