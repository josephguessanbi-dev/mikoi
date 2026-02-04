import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ActionRequest {
  action: 'suspend' | 'activate' | 'delete';
  propertyId: string;
  reason?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Client with user's auth to check role
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin
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

    const body: ActionRequest = await req.json();
    const { action, propertyId, reason } = body;

    if (!action || !propertyId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: action, propertyId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get property info for audit log
    const { data: property } = await supabaseAdmin
      .from('properties')
      .select('title, user_id')
      .eq('id', propertyId)
      .single();

    let result: any = null;

    switch (action) {
      case 'suspend': {
        const { error: updateError } = await supabaseAdmin
          .from('properties')
          .update({ status: 'suspended' })
          .eq('id', propertyId);

        if (updateError) throw updateError;

        // Log action
        await supabaseAdmin.from('admin_audit_logs').insert({
          admin_id: user.id,
          action: 'property_suspension',
          target_user_id: property?.user_id,
          target_entity_type: 'property',
          target_entity_id: propertyId,
          details: { reason, property_title: property?.title },
        });

        result = { success: true, message: 'Annonce suspendue' };
        break;
      }

      case 'activate': {
        const { error: updateError } = await supabaseAdmin
          .from('properties')
          .update({ status: 'active' })
          .eq('id', propertyId);

        if (updateError) throw updateError;

        // Log action
        await supabaseAdmin.from('admin_audit_logs').insert({
          admin_id: user.id,
          action: 'property_activation',
          target_user_id: property?.user_id,
          target_entity_type: 'property',
          target_entity_id: propertyId,
          details: { reason, property_title: property?.title },
        });

        result = { success: true, message: 'Annonce réactivée' };
        break;
      }

      case 'delete': {
        const { error: deleteError } = await supabaseAdmin
          .from('properties')
          .delete()
          .eq('id', propertyId);

        if (deleteError) throw deleteError;

        // Log action
        await supabaseAdmin.from('admin_audit_logs').insert({
          admin_id: user.id,
          action: 'property_deletion',
          target_user_id: property?.user_id,
          target_entity_type: 'property',
          target_entity_id: propertyId,
          details: { reason, property_title: property?.title },
        });

        result = { success: true, message: 'Annonce supprimée' };
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Admin property action error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
