import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface PurchaseRequest {
  packageId: string;
  cashfreeOrderId?: string;
}

async function verifyCashfreeOrder(
  orderId: string,
  appId: string,
  secretKey: string,
  env: string
): Promise<{ verified: boolean; orderAmount?: number }> {
  const baseUrl =
    env === "sandbox"
      ? "https://sandbox.cashfree.com/pg"
      : "https://api.cashfree.com/pg";

  const res = await fetch(`${baseUrl}/orders/${orderId}`, {
    method: "GET",
    headers: {
      "x-api-version": "2025-01-01",
      "x-client-id": appId,
      "x-client-secret": secretKey,
    },
  });

  if (!res.ok) return { verified: false };

  const order = await res.json();
  return {
    verified: order.order_status === "PAID",
    orderAmount: order.order_amount,
  };
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
    const cashfreeAppId = Deno.env.get("CASHFREE_APP_ID");
    const cashfreeSecretKey = Deno.env.get("CASHFREE_SECRET_KEY");
    const cashfreeEnv = Deno.env.get("CASHFREE_ENV") || "production";

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

    const { packageId, cashfreeOrderId }: PurchaseRequest = await req.json();

    if (!packageId) {
      return new Response(
        JSON.stringify({ error: "Package ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify Cashfree payment if gateway is configured
    if (cashfreeAppId && cashfreeSecretKey && cashfreeOrderId) {
      const { verified, orderAmount } = await verifyCashfreeOrder(
        cashfreeOrderId,
        cashfreeAppId,
        cashfreeSecretKey,
        cashfreeEnv
      );

      if (!verified) {
        return new Response(
          JSON.stringify({ error: "Payment verification failed — order not paid" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log(`Cashfree payment verified: order=${cashfreeOrderId}, amount=₹${orderAmount}`);
    } else if (cashfreeAppId && cashfreeSecretKey) {
      return new Response(
        JSON.stringify({ error: "Cashfree order ID is required for verification" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    // If Cashfree keys are NOT set, allow direct purchase (dev/test mode)

    const { data: pkg, error: pkgError } = await adminClient
      .from("coin_packages")
      .select("*")
      .eq("id", packageId)
      .eq("is_active", true)
      .single();

    if (pkgError || !pkg) {
      return new Response(
        JSON.stringify({ error: "Package not found or inactive" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const totalCoins = pkg.coins;

    // Credit wallet
    const { data: wallet, error: walletError } = await adminClient
      .from("wallets")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (walletError || !wallet) {
      return new Response(
        JSON.stringify({ error: "Wallet not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { error: updateError } = await adminClient
      .from("wallets")
      .update({
        balance: wallet.balance + totalCoins,
        total_purchased: wallet.total_purchased + totalCoins,
        updated_at: new Date().toISOString(),
      })
      .eq("id", wallet.id);

    if (updateError) {
      console.error("Wallet update error:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to credit wallet" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Record transaction
    const { error: txError } = await adminClient
      .from("transactions")
      .insert({
        user_id: user.id,
        type: "coin_purchase",
        coins: totalCoins,
        amount: pkg.price_inr,
        status: "completed",
        payment_id: cashfreeOrderId || null,
        description: `Purchased ${pkg.name} - ${totalCoins} coins`,
      });

    if (txError) {
      console.error("Transaction record error:", txError);
    }

    // Update first_purchase_date and convert trial earnings if first purchase
    const { data: profile } = await adminClient
      .from("profiles")
      .select("first_purchase_date, account_type")
      .eq("id", user.id)
      .single();

    if (profile && !profile.first_purchase_date) {
      await adminClient
        .from("profiles")
        .update({
          first_purchase_date: new Date().toISOString(),
          account_type: "paid",
        })
        .eq("id", user.id);

      await adminClient.rpc("convert_trial_earnings", { p_user_id: user.id });
    }

    return new Response(
      JSON.stringify({
        success: true,
        coinsAdded: totalCoins,
        newBalance: wallet.balance + totalCoins,
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
