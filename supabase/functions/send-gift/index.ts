import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface GiftRequest {
  giftTypeId: string;
  receiverId: string;
  callId?: string;
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

    const { giftTypeId, receiverId, callId }: GiftRequest = await req.json();

    if (!giftTypeId || !receiverId) {
      return new Response(
        JSON.stringify({ error: "Gift type ID and receiver ID are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (receiverId === user.id) {
      return new Response(
        JSON.stringify({ error: "You cannot send a gift to yourself" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch gift type
    const { data: giftType, error: giftTypeError } = await adminClient
      .from("gift_types")
      .select("*")
      .eq("id", giftTypeId)
      .eq("is_active", true)
      .single();

    if (giftTypeError || !giftType) {
      return new Response(
        JSON.stringify({ error: "Gift type not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check sender wallet
    const { data: senderWallet, error: walletError } = await adminClient
      .from("wallets")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (walletError || !senderWallet) {
      return new Response(
        JSON.stringify({ error: "Wallet not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (senderWallet.balance < giftType.coins_cost) {
      return new Response(
        JSON.stringify({
          error: "Insufficient coins",
          required: giftType.coins_cost,
          available: senderWallet.balance,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify receiver exists and is female
    const { data: receiver, error: receiverError } = await adminClient
      .from("profiles")
      .select("id, name, gender")
      .eq("id", receiverId)
      .single();

    if (receiverError || !receiver) {
      return new Response(
        JSON.stringify({ error: "Receiver not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Deduct from sender wallet
    const { error: deductError } = await adminClient
      .from("wallets")
      .update({
        balance: senderWallet.balance - giftType.coins_cost,
        total_spent: senderWallet.total_spent + giftType.coins_cost,
        updated_at: new Date().toISOString(),
      })
      .eq("id", senderWallet.id);

    if (deductError) {
      console.error("Wallet deduct error:", deductError);
      return new Response(
        JSON.stringify({ error: "Failed to process payment" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch platform commission rate
    const { data: config } = await adminClient
      .from("platform_config")
      .select("commission_rate")
      .limit(1)
      .single();

    const commissionRate = config?.commission_rate ?? 0.20;
    const grossCoins = giftType.coins_cost;
    const commissionCoins = Math.floor(grossCoins * commissionRate);
    const creatorCoins = grossCoins - commissionCoins;

    // Credit receiver earnings (only their share after commission)
    const { data: receiverEarnings } = await adminClient
      .from("earnings")
      .select("*")
      .eq("user_id", receiverId)
      .single();

    if (receiverEarnings) {
      await adminClient
        .from("earnings")
        .update({
          gift_earnings: receiverEarnings.gift_earnings + creatorCoins,
          total_earnings: receiverEarnings.total_earnings + creatorCoins,
          available_balance: receiverEarnings.available_balance + creatorCoins,
          gross_earnings: (receiverEarnings.gross_earnings || 0) + grossCoins,
          commission_paid: (receiverEarnings.commission_paid || 0) + commissionCoins,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", receiverId);
    }

    // Insert gift record
    const { data: giftRecord, error: giftError } = await adminClient
      .from("gifts")
      .insert({
        sender_id: user.id,
        receiver_id: receiverId,
        gift_type: giftType.id,
        gift_name: giftType.name,
        coins_amount: giftType.coins_cost,
        call_id: callId || null,
      })
      .select("id")
      .single();

    if (giftError) {
      console.error("Gift record error:", giftError);
    }

    // Record platform commission
    await adminClient.from("platform_earnings").insert({
      source_type: "gift_commission",
      source_id: giftRecord?.id || null,
      gross_coins: grossCoins,
      commission_coins: commissionCoins,
      creator_coins: creatorCoins,
      creator_id: receiverId,
      payer_id: user.id,
    });

    // Create transaction records for both parties
    await adminClient.from("transactions").insert([
      {
        user_id: user.id,
        type: "gift_sent",
        coins: giftType.coins_cost,
        amount: giftType.coins_cost / 6,
        status: "completed",
        related_user_id: receiverId,
        related_call_id: callId || null,
        description: `Sent ${giftType.name} gift to ${receiver.name}`,
      },
      {
        user_id: receiverId,
        type: "gift_received",
        coins: creatorCoins,
        amount: creatorCoins / 6,
        status: "completed",
        related_user_id: user.id,
        related_call_id: callId || null,
        description: `Received ${giftType.name} gift (${Math.round((1 - commissionRate) * 100)}% of ${grossCoins} coins)`,
      },
    ]);

    return new Response(
      JSON.stringify({
        success: true,
        gift: {
          id: giftRecord?.id ?? null,
          name: giftType.name,
          emoji: giftType.emoji,
          coins: giftType.coins_cost,
          receiverName: receiver.name,
        },
        newBalance: senderWallet.balance - giftType.coins_cost,
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
