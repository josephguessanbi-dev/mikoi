import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Allowed user types
const ALLOWED_USER_TYPES = ['chercheur', 'proprietaire', 'agence', 'client'];

// Phone number validation - accepts international format or local format
function isValidPhone(phone: string): boolean {
  if (!phone) return true; // Phone is optional
  // Allow formats like +225XXXXXXXXXX, +225 XX XX XX XX XX, or local formats
  const phoneRegex = /^(\+\d{1,4}[\s-]?)?[\d\s-]{8,20}$/;
  return phoneRegex.test(phone.trim());
}

// Sanitize and validate full name
function sanitizeFullName(name: string): string | null {
  if (!name || typeof name !== 'string') return null;
  const trimmed = name.trim().slice(0, 200);
  // Only allow letters, spaces, hyphens, apostrophes
  if (!/^[\p{L}\s\-']+$/u.test(trimmed)) return null;
  return trimmed;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with user's auth context
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify the user's token
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse and validate request body
    const body = await req.json().catch(() => ({}));
    const { full_name, phone, user_type } = body;

    // Validate full_name (required)
    const sanitizedName = sanitizeFullName(full_name);
    if (!sanitizedName) {
      return new Response(
        JSON.stringify({ error: 'Nom invalide. Utilisez uniquement des lettres, espaces, tirets.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate phone (optional but must be valid format if provided)
    const trimmedPhone = phone?.trim()?.slice(0, 30) || null;
    if (trimmedPhone && !isValidPhone(trimmedPhone)) {
      return new Response(
        JSON.stringify({ error: 'Format de numéro de téléphone invalide' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate user_type (required, must be in allowed list)
    if (!user_type || !ALLOWED_USER_TYPES.includes(user_type)) {
      return new Response(
        JSON.stringify({ error: 'Type de compte invalide' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if profile already exists
    const { data: existingProfile } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingProfile) {
      return new Response(
        JSON.stringify({ error: 'Profile already exists' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert the profile with validated data
    const { data: profile, error: insertError } = await supabaseClient
      .from('profiles')
      .insert({
        user_id: user.id, // Always use authenticated user's ID
        full_name: sanitizedName,
        phone: trimmedPhone,
        user_type: user_type,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Profile insert error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Impossible de créer le profil' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Profile created for user: ${user.id}`);

    return new Response(
      JSON.stringify({ success: true, profile }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Register user error:', error);
    return new Response(
      JSON.stringify({ error: 'Une erreur est survenue' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
