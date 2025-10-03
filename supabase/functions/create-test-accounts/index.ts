import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create admin Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Test accounts to create
    const testAccounts = [
      {
        email: 'admin@test.com',
        password: 'admin123',
        userData: {
          full_name: 'مدير الاختبار',
          role: 'admin'
        }
      },
      {
        email: 'worker@test.com', 
        password: 'worker123',
        userData: {
          full_name: 'عامل الاختبار',
          role: 'worker'
        }
      }
    ];

    const results = [];

    for (const account of testAccounts) {
      try {
        // Create user with admin client
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: account.email,
          password: account.password,
          email_confirm: true,
          user_metadata: account.userData
        });

        if (authError && !authError.message.includes('already registered')) {
          console.error(`Error creating user ${account.email}:`, authError);
          results.push({ email: account.email, status: 'error', error: authError.message });
          continue;
        }

        if (authUser?.user) {
          // Upsert profile for the user (update if exists by user_id)
          const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
              user_id: authUser.user.id,
              full_name: account.userData.full_name,
              role: account.userData.role
            }, { onConflict: 'user_id' });

          if (profileError) {
            console.error(`Error creating/updating profile for ${account.email}:`, profileError);
            results.push({ email: account.email, status: 'auth_created_profile_error', error: profileError.message });
          } else {
            results.push({ email: account.email, status: 'success' });
          }
        } else {
          // User may already exist; try to locate by email and update profile
          try {
            const { data: listData, error: listErr } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
            if (listErr) throw listErr;
            const existing = listData?.users?.find((u: any) => u.email?.toLowerCase() === account.email.toLowerCase());

            if (existing?.id) {
              const { error: profileError } = await supabaseAdmin
                .from('profiles')
                .upsert({
                  user_id: existing.id,
                  full_name: account.userData.full_name,
                  role: account.userData.role
                }, { onConflict: 'user_id' });

              if (profileError) {
                console.error(`Error updating existing profile for ${account.email}:`, profileError);
                results.push({ email: account.email, status: 'profile_update_error', error: profileError.message });
              } else {
                results.push({ email: account.email, status: 'updated_existing' });
              }
            } else {
              results.push({ email: account.email, status: 'already_exists_but_user_not_found' });
            }
          } catch (e: any) {
            console.error(`Error locating existing user ${account.email}:`, e);
            results.push({ email: account.email, status: 'error_locating_user', error: e.message });
          }
        }
      } catch (error) {
        console.error(`Error processing ${account.email}:`, error);
        results.push({ email: account.email, status: 'error', error: error instanceof Error ? error.message : String(error) });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'تم إنشاء حسابات الاختبار',
        results 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});