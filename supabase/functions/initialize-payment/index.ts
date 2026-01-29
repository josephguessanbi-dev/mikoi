import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple email validation
function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  if (email.length > 255) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(email: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(email);
  
  if (!userLimit || now > userLimit.resetAt) {
    rateLimitMap.set(email, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  
  if (userLimit.count >= RATE_LIMIT_MAX) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, amount, metadata } = await req.json();
    
    // Validate email
    if (!isValidEmail(email)) {
      return new Response(
        JSON.stringify({ error: 'Email invalide' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate amount
    if (!amount || typeof amount !== 'number' || amount <= 0 || amount > 10000000) {
      return new Response(
        JSON.stringify({ error: 'Montant invalide' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting check
    if (!checkRateLimit(email)) {
      console.log(`Rate limit exceeded for: ${email}`);
      return new Response(
        JSON.stringify({ error: 'Trop de tentatives. Veuillez réessayer plus tard.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

    console.log('Initialisation du paiement Paystack pour:', email, 'Montant:', amount);

    // Initialiser la transaction avec l'API Paystack
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: amount * 100, // Paystack utilise les centimes
        currency: 'XOF', // Franc CFA
        metadata: metadata || {},
        callback_url: `${req.headers.get('origin')}/dashboard?payment=success`,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.status) {
      console.error('Erreur Paystack:', data.message);
      return new Response(
        JSON.stringify({ error: 'Impossible d\'initialiser le paiement' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Paiement initialisé avec succès:', data.data.reference);

    return new Response(
      JSON.stringify({
        authorization_url: data.data.authorization_url,
        access_code: data.data.access_code,
        reference: data.data.reference,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erreur dans initialize-payment:', error);
    return new Response(
      JSON.stringify({ error: 'Une erreur est survenue lors de l\'initialisation' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
