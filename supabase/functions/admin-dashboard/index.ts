import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with user's token
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Client with user's auth to check role
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get the user from the token
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin using service role (bypasses RLS)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (roleError || !roleData) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // User is confirmed admin - fetch all data using service role
    const [profilesResult, propertiesResult, pointsResult, transactionsResult, subscriptionsResult, verificationsResult, reviewsResult, favoritesResult] = await Promise.all([
      supabaseAdmin.from('profiles').select('*').order('created_at', { ascending: false }),
      supabaseAdmin.from('properties').select('*').order('created_at', { ascending: false }),
      supabaseAdmin.from('user_points').select('*'),
      supabaseAdmin.from('points_transactions').select('*').order('created_at', { ascending: false }).limit(50),
      supabaseAdmin.from('user_subscriptions').select('*, subscription_plans(name, price_monthly)').order('created_at', { ascending: false }),
      supabaseAdmin.from('user_verifications').select('*').order('created_at', { ascending: false }),
      supabaseAdmin.from('reviews').select('*').order('created_at', { ascending: false }).limit(50),
      supabaseAdmin.from('favorites').select('*', { count: 'exact', head: true }),
    ]);

    const profiles = profilesResult.data || [];
    const properties = propertiesResult.data || [];
    const points = pointsResult.data || [];
    const transactions = transactionsResult.data || [];
    const subscriptions = subscriptionsResult.data || [];
    const verifications = verificationsResult.data || [];
    const reviews = reviewsResult.data || [];
    const favoritesCount = favoritesResult.count || 0;

    // Calculate stats
    const premiumSubscriptions = subscriptions.filter((s: any) => s.status === 'active' && s.subscription_plans?.price_monthly > 0);
    const pendingVerifications = verifications.filter((v: any) => v.status === 'pending');
    
    // Calculate estimated monthly revenue from subscriptions
    const monthlyRevenue = premiumSubscriptions.reduce((sum: number, s: any) => {
      return sum + (s.subscription_plans?.price_monthly || 0);
    }, 0);

    // Get unique cities
    const uniqueCities = new Set(properties.map((p: any) => p.city));
    
    // Get top cities by listings count
    const cityCounts: Record<string, number> = {};
    properties.forEach((p: any) => {
      cityCounts[p.city] = (cityCounts[p.city] || 0) + 1;
    });
    const topCities = Object.entries(cityCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([city, count]) => ({ city, count }));

    const stats = {
      totalUsers: profiles.length,
      totalProperties: properties.length,
      activeProperties: properties.filter((p: any) => p.status === 'active').length,
      reservedProperties: properties.filter((p: any) => p.status === 'reserved').length,
      totalPoints: points.reduce((sum: number, p: any) => sum + (p.points || 0), 0),
      premiumUsers: premiumSubscriptions.length,
      pendingVerifications: pendingVerifications.length,
      totalCities: uniqueCities.size,
      totalFavorites: favoritesCount,
      totalReviews: reviews.length,
      monthlyRevenue,
      topCities,
    };

    // Map users with points
    const users = profiles.map((profile: any) => {
      const userPoints = points.find((p: any) => p.user_id === profile.user_id);
      return {
        id: profile.user_id,
        full_name: profile.full_name,
        phone: profile.phone,
        user_type: profile.user_type,
        points: userPoints?.points || 0,
        created_at: profile.created_at,
      };
    });

    // Map properties with owner names
    const propertiesWithOwner = properties.map((property: any) => {
      const owner = profiles.find((p: any) => p.user_id === property.user_id);
      return {
        id: property.id,
        title: property.title,
        price: property.price,
        city: property.city,
        status: property.status,
        listing_type: property.listing_type,
        property_type: property.property_type,
        owner_name: owner?.full_name || 'Inconnu',
        created_at: property.created_at,
      };
    });

    // Map transactions with user names
    const transactionsWithUser = transactions.map((transaction: any) => {
      const transactionUser = profiles.find((p: any) => p.user_id === transaction.user_id);
      return {
        id: transaction.id,
        user_name: transactionUser?.full_name || 'Inconnu',
        amount: transaction.amount,
        transaction_type: transaction.transaction_type,
        description: transaction.description,
        created_at: transaction.created_at,
      };
    });

    // Map verifications with user names
    const verificationsWithUser = pendingVerifications.map((verification: any) => {
      const verificationUser = profiles.find((p: any) => p.user_id === verification.user_id);
      return {
        id: verification.id,
        user_name: verificationUser?.full_name || 'Inconnu',
        verification_type: verification.verification_type,
        status: verification.status,
        created_at: verification.created_at,
      };
    });

    return new Response(
      JSON.stringify({
        stats,
        users,
        properties: propertiesWithOwner,
        transactions: transactionsWithUser,
        pendingVerifications: verificationsWithUser,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Admin dashboard error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
