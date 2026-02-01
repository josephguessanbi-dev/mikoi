import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ActionRequest {
  action: 'warn' | 'suspend' | 'unsuspend' | 'delete';
  targetUserId: string;
  reason: string;
  isPermanent?: boolean;
  suspendedUntil?: string;
  anonymize?: boolean;
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
    const { action, targetUserId, reason, isPermanent, suspendedUntil, anonymize } = body;

    if (!action || !targetUserId || !reason) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: action, targetUserId, reason' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prevent admin from acting on themselves
    if (targetUserId === user.id) {
      return new Response(
        JSON.stringify({ error: 'Cannot perform this action on yourself' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let result: any = null;

    switch (action) {
      case 'warn': {
        // Add warning
        const { data: warning, error: warnError } = await supabaseAdmin
          .from('user_warnings')
          .insert({
            user_id: targetUserId,
            admin_id: user.id,
            reason,
          })
          .select()
          .single();

        if (warnError) throw warnError;

        // Check warning count for auto-suspension (3 warnings = suspension)
        const { count } = await supabaseAdmin
          .from('user_warnings')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', targetUserId);

        if (count && count >= 3) {
          // Check if already suspended
          const { data: existingSuspension } = await supabaseAdmin
            .from('user_suspensions')
            .select('id')
            .eq('user_id', targetUserId)
            .is('lifted_at', null)
            .maybeSingle();

          if (!existingSuspension) {
            // Auto-suspend for 30 days
            const suspendUntil = new Date();
            suspendUntil.setDate(suspendUntil.getDate() + 30);

            await supabaseAdmin.from('user_suspensions').insert({
              user_id: targetUserId,
              admin_id: user.id,
              reason: `Suspension automatique après ${count} avertissements`,
              is_permanent: false,
              suspended_until: suspendUntil.toISOString(),
            });

            await supabaseAdmin
              .from('profiles')
              .update({ status: 'suspended' })
              .eq('user_id', targetUserId);
          }
        }

        // Log action
        await supabaseAdmin.from('admin_audit_logs').insert({
          admin_id: user.id,
          action: 'warning',
          target_user_id: targetUserId,
          details: { reason, warning_count: count },
        });

        result = { success: true, warning, warningCount: count };
        break;
      }

      case 'suspend': {
        // Add suspension
        const { data: suspension, error: suspendError } = await supabaseAdmin
          .from('user_suspensions')
          .insert({
            user_id: targetUserId,
            admin_id: user.id,
            reason,
            is_permanent: isPermanent || false,
            suspended_until: isPermanent ? null : suspendedUntil,
          })
          .select()
          .single();

        if (suspendError) throw suspendError;

        // Update profile status
        await supabaseAdmin
          .from('profiles')
          .update({ status: 'suspended' })
          .eq('user_id', targetUserId);

        // Log action
        await supabaseAdmin.from('admin_audit_logs').insert({
          admin_id: user.id,
          action: 'suspension',
          target_user_id: targetUserId,
          details: { reason, is_permanent: isPermanent, suspended_until: suspendedUntil },
        });

        result = { success: true, suspension };
        break;
      }

      case 'unsuspend': {
        // Lift suspension
        const { error: liftError } = await supabaseAdmin
          .from('user_suspensions')
          .update({ 
            lifted_at: new Date().toISOString(),
            lifted_by: user.id 
          })
          .eq('user_id', targetUserId)
          .is('lifted_at', null);

        if (liftError) throw liftError;

        // Update profile status
        await supabaseAdmin
          .from('profiles')
          .update({ status: 'active' })
          .eq('user_id', targetUserId);

        // Log action
        await supabaseAdmin.from('admin_audit_logs').insert({
          admin_id: user.id,
          action: 'unsuspension',
          target_user_id: targetUserId,
          details: { reason },
        });

        result = { success: true };
        break;
      }

      case 'delete': {
        if (anonymize) {
          // Anonymize user data
          await supabaseAdmin
            .from('profiles')
            .update({ 
              status: 'deleted',
              full_name: 'Utilisateur supprimé',
              phone: null,
            })
            .eq('user_id', targetUserId);

          // Soft delete properties
          await supabaseAdmin
            .from('properties')
            .update({ status: 'deleted' })
            .eq('user_id', targetUserId);

        } else {
          // Hard delete - mark as deleted
          await supabaseAdmin
            .from('profiles')
            .update({ status: 'deleted' })
            .eq('user_id', targetUserId);

          // Delete properties
          await supabaseAdmin
            .from('properties')
            .delete()
            .eq('user_id', targetUserId);
        }

        // Log action
        await supabaseAdmin.from('admin_audit_logs').insert({
          admin_id: user.id,
          action: 'deletion',
          target_user_id: targetUserId,
          details: { reason, anonymize },
        });

        result = { success: true };
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
    console.error('Admin user action error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
