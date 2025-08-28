import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MobileAuthRequest {
  action: 'register' | 'login' | 'session' | 'verify_device' | 'logout'
  email?: string
  password?: string
  firstName?: string
  lastName?: string
  appType?: 'driver' | 'parent'
  deviceId?: string
  deviceType?: 'ios' | 'android'
  deviceToken?: string
  organizationId?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    const { action, email, password, firstName, lastName, appType, deviceId, deviceType, deviceToken, organizationId } = await req.json() as MobileAuthRequest

    console.log('Mobile auth request:', { action, email, appType, deviceType })

    switch (action) {
      case 'register': {
        if (!email || !password || !appType || !deviceId || !deviceType) {
          return new Response(
            JSON.stringify({ error: 'Missing required fields for registration' }),
            { status: 400, headers: corsHeaders }
          )
        }

        // Create user with proper metadata for mobile apps
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName || '',
              last_name: lastName || '',
              app_type: appType,
              organization_id: organizationId
            }
          }
        })

        if (authError) {
          console.error('Auth registration error:', authError)
          return new Response(
            JSON.stringify({ error: authError.message }),
            { status: 400, headers: corsHeaders }
          )
        }

        if (authData.user) {
          // Create mobile session
          const { data: sessionData, error: sessionError } = await supabase
            .rpc('handle_mobile_session', {
              p_device_id: deviceId,
              p_device_type: deviceType,
              p_app_type: appType,
              p_device_token: deviceToken
            })

          if (sessionError) {
            console.error('Session creation error:', sessionError)
          }

          // Log successful registration
          await supabase
            .rpc('log_mobile_auth_event', {
              p_device_id: deviceId,
              p_action: 'register',
              p_app_type: appType,
              p_device_info: {
                device_type: deviceType,
                email: email
              },
              p_success: true
            })
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            user: authData.user,
            session: authData.session,
            message: 'Registration successful' 
          }),
          { status: 200, headers: corsHeaders }
        )
      }

      case 'login': {
        if (!email || !password) {
          return new Response(
            JSON.stringify({ error: 'Email and password are required' }),
            { status: 400, headers: corsHeaders }
          )
        }

        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (authError) {
          console.error('Auth login error:', authError)
          
          // Log failed login attempt
          if (deviceId && appType) {
            await supabase
              .rpc('log_mobile_auth_event', {
                p_device_id: deviceId,
                p_action: 'login',
                p_app_type: appType,
                p_device_info: { email },
                p_success: false,
                p_error_message: authError.message
              })
          }

          return new Response(
            JSON.stringify({ error: authError.message }),
            { status: 400, headers: corsHeaders }
          )
        }

        if (authData.user && deviceId && appType && deviceType) {
          // Create/update mobile session
          await supabase
            .rpc('handle_mobile_session', {
              p_device_id: deviceId,
              p_device_type: deviceType,
              p_app_type: appType,
              p_device_token: deviceToken
            })

          // Log successful login
          await supabase
            .rpc('log_mobile_auth_event', {
              p_device_id: deviceId,
              p_action: 'login',
              p_app_type: appType,
              p_device_info: {
                device_type: deviceType,
                email: email
              },
              p_success: true
            })
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            user: authData.user,
            session: authData.session,
            message: 'Login successful' 
          }),
          { status: 200, headers: corsHeaders }
        )
      }

      case 'session': {
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
          return new Response(
            JSON.stringify({ error: 'No authorization header' }),
            { status: 401, headers: corsHeaders }
          )
        }

        const token = authHeader.replace('Bearer ', '')
        const { data: userData, error: userError } = await supabase.auth.getUser(token)

        if (userError || !userData.user) {
          return new Response(
            JSON.stringify({ error: 'Invalid session' }),
            { status: 401, headers: corsHeaders }
          )
        }

        // Update session activity if device info provided
        if (deviceId && appType && deviceType) {
          await supabase
            .rpc('handle_mobile_session', {
              p_device_id: deviceId,
              p_device_type: deviceType,
              p_app_type: appType,
              p_device_token: deviceToken
            })
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            user: userData.user,
            valid: true 
          }),
          { status: 200, headers: corsHeaders }
        )
      }

      case 'verify_device': {
        if (!deviceId || !appType) {
          return new Response(
            JSON.stringify({ error: 'Device ID and app type are required' }),
            { status: 400, headers: corsHeaders }
          )
        }

        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
          return new Response(
            JSON.stringify({ error: 'No authorization header' }),
            { status: 401, headers: corsHeaders }
          )
        }

        const token = authHeader.replace('Bearer ', '')
        const { data: userData, error: userError } = await supabase.auth.getUser(token)

        if (userError || !userData.user) {
          return new Response(
            JSON.stringify({ error: 'Invalid session' }),
            { status: 401, headers: corsHeaders }
          )
        }

        const { data: verified, error: verifyError } = await supabase
          .rpc('verify_mobile_device', {
            p_device_id: deviceId,
            p_app_type: appType
          })

        if (verifyError) {
          console.error('Device verification error:', verifyError)
          return new Response(
            JSON.stringify({ error: 'Device verification failed' }),
            { status: 500, headers: corsHeaders }
          )
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            verified: verified,
            deviceId: deviceId 
          }),
          { status: 200, headers: corsHeaders }
        )
      }

      case 'logout': {
        const authHeader = req.headers.get('Authorization')
        if (authHeader) {
          const token = authHeader.replace('Bearer ', '')
          await supabase.auth.signOut()
        }

        // Log logout event
        if (deviceId && appType) {
          await supabase
            .rpc('log_mobile_auth_event', {
              p_device_id: deviceId,
              p_action: 'logout',
              p_app_type: appType,
              p_device_info: { device_type: deviceType },
              p_success: true
            })
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Logout successful' 
          }),
          { status: 200, headers: corsHeaders }
        )
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: corsHeaders }
        )
    }

  } catch (error) {
    console.error('Mobile auth error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: corsHeaders }
    )
  }
})