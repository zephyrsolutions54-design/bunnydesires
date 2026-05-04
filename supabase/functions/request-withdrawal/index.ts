import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { coinsToApproxInrAmount, COINS_PER_INR_ESTIMATE } from "../_shared/coins-inr.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/** ~₹1000 minimum at COINS_PER_INR_ESTIMATE */
const MIN_WITHDRAWAL_COINS = Math.ceil(1000 * COINS_PER_INR_ESTIMATE);

interface WithdrawalRequest {
  amount: number; // in coins
  paymentMethod: string;
  paymentDetails: Record<string, string>;
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

    // Verify user is female (only creators can withdraw)
    const { data: profile } = await adminClient
      .from("profiles")
      .select("gender")
      .eq("id", user.id)
      .single();

    if (!profile || profile.gender !== "female") {
      return new Response(
        JSON.stringify({ error: "Only creators can request withdrawals" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { amount, paymentMethod, paymentDetails }: WithdrawalRequest = await req.json();

    if (!amount || !paymentMethod || !paymentDetails) {
      return new Response(
        JSON.stringify({ error: "Amount, payment method, and payment details are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (amount < MIN_WITHDRAWAL_COINS) {
      return new Response(
        JSON.stringify({
          error: `Minimum withdrawal is ${MIN_WITHDRAWAL_COINS} coins (≈₹${coinsToApproxInrAmount(MIN_WITHDRAWAL_COINS)})`,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check earnings balance
    const { data: earnings, error: earningsError } = await adminClient
      .from("earnings")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (earningsError || !earnings) {
      return new Response(
        JSON.stringify({ error: "Earnings record not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (earnings.available_balance < amount) {
      return new Response(
        JSON.stringify({
          error: "Insufficient balance",
          available: earnings.available_balance,
          requested: amount,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check for pending withdrawals
    const { data: pendingWithdrawals } = await adminClient
      .from("withdrawals")
      .select("id")
      .eq("user_id", user.id)
      .in("status", ["pending", "processing"]);

    if (pendingWithdrawals && pendingWithdrawals.length > 0) {
      return new Response(
        JSON.stringify({ error: "You already have a pending withdrawal request" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const amountInr = coinsToApproxInrAmount(amount);

    // Deduct from available balance
    const { error: updateError } = await adminClient
      .from("earnings")
      .update({
        available_balance: earnings.available_balance - amount,
        withdrawn_amount: earnings.withdrawn_amount + amount,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Earnings update error:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to process withdrawal" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create withdrawal record
    const { data: withdrawal, error: withdrawalError } = await adminClient
      .from("withdrawals")
      .insert({
        user_id: user.id,
        amount: amount,
        amount_inr: amountInr,
        payment_method: paymentMethod,
        payment_details: paymentDetails,
        status: "pending",
        requested_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (withdrawalError) {
      console.error("Withdrawal insert error:", withdrawalError);
      // Rollback the earnings deduction
      await adminClient
        .from("earnings")
        .update({
          available_balance: earnings.available_balance,
          withdrawn_amount: earnings.withdrawn_amount,
        })
        .eq("user_id", user.id);

      return new Response(
        JSON.stringify({ error: "Failed to create withdrawal request" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Record transaction
    await adminClient.from("transactions").insert({
      user_id: user.id,
      type: "withdrawal",
      coins: amount,
      amount: amountInr,
      status: "completed",
      description: `Withdrawal request - ₹${amountInr.toFixed(2)} via ${paymentMethod}`,
    });

    return new Response(
      JSON.stringify({
        success: true,
        withdrawal: {
          id: withdrawal.id,
          amount,
          amountInr,
          status: "pending",
        },
        remainingBalance: earnings.available_balance - amount,
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
