import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Simple in-memory rate limiting (per user, max 1 welcome email per hour)
const emailsSent = new Map<string, number>();
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const lastSent = emailsSent.get(userId);
  
  if (lastSent && now - lastSent < RATE_LIMIT_WINDOW) {
    return true;
  }
  
  emailsSent.set(userId, now);
  return false;
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [userId, timestamp] of emailsSent.entries()) {
    if (now - timestamp > RATE_LIMIT_WINDOW) {
      emailsSent.delete(userId);
    }
  }
}, 60 * 60 * 1000);

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create Supabase client with user's auth context
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify the user's token and get their info
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication token" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const userId = user.id;
    const userEmail = user.email;

    if (!userId || !userEmail) {
      return new Response(
        JSON.stringify({ error: "Invalid user data" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Rate limiting: Only 1 welcome email per user per hour
    if (isRateLimited(userId)) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Parse request body to get fullName (optional)
    const body = await req.json().catch(() => ({}));
    const fullName = typeof body.fullName === "string" ? body.fullName.trim().slice(0, 100) : "";

    console.log(`Sending welcome email to authenticated user: ${userEmail}`);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "MikoiCI <onboarding@resend.dev>",
        to: [userEmail], // Only send to authenticated user's email
        subject: "Bienvenue sur MikoiCI !",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🏠 Bienvenue sur MikoiCI !</h1>
              </div>
              <div class="content">
                <h2>Bonjour ${fullName || "cher utilisateur"} !</h2>
                <p>Nous sommes ravis de vous accueillir sur MikoiCI, la plateforme de référence pour l'immobilier en Côte d'Ivoire.</p>
                
                <p>Avec MikoiCI, vous pouvez :</p>
                <ul>
                  <li>🔍 Rechercher des propriétés à vendre ou à louer</li>
                  <li>📝 Publier vos propres annonces</li>
                  <li>💬 Contacter directement les propriétaires</li>
                  <li>⭐ Sauvegarder vos propriétés favorites</li>
                </ul>
                
                <p>Vous avez reçu <strong>6 points gratuits</strong> pour commencer à publier vos annonces !</p>
                
                <p>Cordialement,<br>L'équipe MikoiCI</p>
              </div>
              <div class="footer">
                <p>© 2024 MikoiCI - Tous droits réservés</p>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    const emailResponse = await res.json();
    console.log("Welcome email sent successfully to:", userEmail);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send welcome email" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
