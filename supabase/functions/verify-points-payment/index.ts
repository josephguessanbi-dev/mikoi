import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reference } = await req.json();

    if (!reference) {
      throw new Error("Référence de paiement manquante");
    }

    console.log(`Vérification du paiement: ${reference}`);

    // Verify payment with Paystack
    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${Deno.env.get("PAYSTACK_SECRET_KEY")}`,
        },
      }
    );

    const paystackData = await paystackResponse.json();

    if (!paystackData.status || paystackData.data.status !== "success") {
      throw new Error("Paiement non vérifié");
    }

    const metadata = paystackData.data.metadata;
    const points = metadata.points;
    const userId = metadata.user_id;

    console.log(`Paiement vérifié pour l'utilisateur ${userId}: ${points} points`);

    // Initialize Supabase with service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Add points to user account
    const { data: currentPoints, error: fetchError } = await supabaseAdmin
      .from("user_points")
      .select("points")
      .eq("user_id", userId)
      .single();

    if (fetchError) {
      console.error("Erreur lors de la récupération des points:", fetchError);
      throw fetchError;
    }

    const newPoints = (currentPoints?.points || 0) + points;

    const { error: updateError } = await supabaseAdmin
      .from("user_points")
      .update({ points: newPoints })
      .eq("user_id", userId);

    if (updateError) {
      console.error("Erreur lors de la mise à jour des points:", updateError);
      throw updateError;
    }

    // Record transaction
    const { error: transactionError } = await supabaseAdmin
      .from("points_transactions")
      .insert({
        user_id: userId,
        amount: points,
        transaction_type: "purchase",
        description: `Achat de ${points} points`,
        payment_reference: reference,
      });

    if (transactionError) {
      console.error("Erreur lors de l'enregistrement de la transaction:", transactionError);
    }

    console.log(`Points ajoutés avec succès: ${newPoints} points au total`);

    return new Response(
      JSON.stringify({
        success: true,
        points: newPoints,
        message: `${points} points ajoutés avec succès`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Erreur:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
