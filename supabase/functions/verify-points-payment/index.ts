import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Validate payment reference format (Paystack references are alphanumeric)
function isValidReference(reference: string): boolean {
  if (!reference || typeof reference !== 'string') return false;
  if (reference.length < 10 || reference.length > 100) return false;
  // Paystack references contain alphanumeric characters
  return /^[a-zA-Z0-9_-]+$/.test(reference);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reference } = await req.json();

    // Validate reference format
    if (!isValidReference(reference)) {
      console.log("Invalid reference format:", reference);
      return new Response(
        JSON.stringify({ error: "Référence de paiement invalide" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    console.log(`Vérification du paiement: ${reference}`);

    // Initialize Supabase with service role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // CRITICAL: Check if this reference has already been processed
    const { data: existingTransaction } = await supabaseAdmin
      .from("points_transactions")
      .select("id")
      .eq("payment_reference", reference)
      .maybeSingle();

    if (existingTransaction) {
      console.log(`Duplicate payment reference detected: ${reference}`);
      return new Response(
        JSON.stringify({ error: "Ce paiement a déjà été traité" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!PAYSTACK_SECRET_KEY) {
      console.error("PAYSTACK_SECRET_KEY non configuré");
      return new Response(
        JSON.stringify({ error: "Configuration de paiement indisponible" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    // Verify payment with Paystack
    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const paystackData = await paystackResponse.json();

    if (!paystackData.status || paystackData.data.status !== "success") {
      console.log("Payment not verified:", paystackData.data?.status);
      return new Response(
        JSON.stringify({ error: "Paiement non vérifié" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    const metadata = paystackData.data.metadata;
    
    // Validate metadata
    if (!metadata || !metadata.points || !metadata.user_id) {
      console.error("Invalid metadata in payment:", metadata);
      return new Response(
        JSON.stringify({ error: "Données de paiement invalides" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    const points = Number(metadata.points);
    const userId = String(metadata.user_id);

    // Validate points value
    if (isNaN(points) || points <= 0 || points > 1000) {
      console.error("Invalid points value:", points);
      return new Response(
        JSON.stringify({ error: "Valeur de points invalide" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Validate user_id format (UUID)
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
      console.error("Invalid user_id format:", userId);
      return new Response(
        JSON.stringify({ error: "Identifiant utilisateur invalide" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    console.log(`Paiement vérifié pour l'utilisateur ${userId}: ${points} points`);

    // Add points to user account
    const { data: currentPoints, error: fetchError } = await supabaseAdmin
      .from("user_points")
      .select("points")
      .eq("user_id", userId)
      .single();

    if (fetchError) {
      console.error("Erreur lors de la récupération des points:", fetchError);
      return new Response(
        JSON.stringify({ error: "Erreur lors du traitement" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }

    const newPoints = (currentPoints?.points || 0) + points;

    const { error: updateError } = await supabaseAdmin
      .from("user_points")
      .update({ points: newPoints })
      .eq("user_id", userId);

    if (updateError) {
      console.error("Erreur lors de la mise à jour des points:", updateError);
      return new Response(
        JSON.stringify({ error: "Erreur lors de la mise à jour" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
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
      // Don't fail the request - points were already added
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
      JSON.stringify({ error: "Une erreur est survenue lors de la vérification" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
