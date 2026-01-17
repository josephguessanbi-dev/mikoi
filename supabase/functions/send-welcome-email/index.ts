import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  fullName: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, fullName }: WelcomeEmailRequest = await req.json();

    console.log(`Sending welcome email to: ${email}`);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "MikoiCI <onboarding@resend.dev>",
        to: [email],
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
    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
