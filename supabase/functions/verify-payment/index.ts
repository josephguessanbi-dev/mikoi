import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validate payment reference format
function isValidReference(reference: string): boolean {
  if (!reference || typeof reference !== 'string') return false;
  if (reference.length < 10 || reference.length > 100) return false;
  return /^[a-zA-Z0-9_-]+$/.test(reference);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reference } = await req.json();
    
    // Validate reference format
    if (!isValidReference(reference)) {
      return new Response(
        JSON.stringify({ error: 'Référence de paiement invalide' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY');
    
    if (!PAYSTACK_SECRET_KEY) {
      console.error('PAYSTACK_SECRET_KEY non configuré');
      return new Response(
        JSON.stringify({ error: 'Configuration de paiement indisponible' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Vérification du paiement:', reference);

    // Vérifier la transaction avec l'API Paystack
    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok || !data.status) {
      console.error('Erreur Paystack:', data.message);
      return new Response(
        JSON.stringify({ error: 'Vérification du paiement échouée' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Vérification réussie:', data.data.status);

    return new Response(
      JSON.stringify({
        status: data.data.status,
        amount: data.data.amount / 100, // Convertir de centimes
        reference: data.data.reference,
        paid_at: data.data.paid_at,
        metadata: data.data.metadata,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erreur dans verify-payment:', error);
    return new Response(
      JSON.stringify({ error: 'Une erreur est survenue lors de la vérification' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
