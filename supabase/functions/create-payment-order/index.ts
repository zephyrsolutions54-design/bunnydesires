import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const cashfreeAppId = Deno.env.get("CASHFREE_APP_ID");
    const cashfreeSecretKey = Deno.env.get("CASHFREE_SECRET_KEY");
    const cashfreeEnv = Deno.env.get("CASHFREE_ENV") || "production";

    if (!cashfreeAppId || !cashfreeSecretKey) {
      return new Response(
        JSON.stringify({ error: "Payment gateway not configured" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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

    const { packageId }: { packageId: string } = await req.json();

    if (!packageId) {
      return new Response(
        JSON.stringify({ error: "Package ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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

    const baseUrl =
      cashfreeEnv === "sandbox"
        ? "https://sandbox.cashfree.com/pg"
        : "https://api.cashfree.com/pg";

    const orderId = `coins_${user.id.slice(0, 8)}_${Date.now()}`;

    const orderRes = await fetch(`${baseUrl}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-version": "2025-01-01",
        "x-client-id": cashfreeAppId,
        "x-client-secret": cashfreeSecretKey,
      },
      body: JSON.stringify({
        order_id: orderId,
        order_amount: Number(pkg.price_inr),
        order_currency: "INR",
        customer_details: {
          customer_id: user.id.replace(/-/g, "").slice(0, 50),
          customer_email: user.email || "customer@example.com",
          customer_phone: "9999999999",
        },
        order_meta: {
          return_url: `${req.headers.get("origin") || ""}/browse?payment=success&order_id={order_id}`,
        },
        order_note: `${pkg.name} — ${pkg.coins} coins`,
        order_tags: {
          user_id: user.id,
          package_id: packageId,
          coins: String(pkg.coins),
        },
      }),
    });

    if (!orderRes.ok) {
      const errBody = await orderRes.text();
      console.error("Cashfree order creation failed:", errBody);
      return new Response(
        JSON.stringify({ error: "Failed to create payment order" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const order = await orderRes.json();
    const paymentSessionId =
      order.payment_session_id ?? order.paymentSessionId ?? order?.payment_session?.id;

    if (!paymentSessionId) {
      console.error("Cashfree order missing payment_session_id:", JSON.stringify(order));
      return new Response(
        JSON.stringify({ error: "Invalid response from payment provider" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        orderId: order.order_id ?? order.orderId,
        paymentSessionId,
        amount: Number(pkg.price_inr),
        currency: "INR",
        packageName: pkg.name,
        coins: pkg.coins,
        env: cashfreeEnv,
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
