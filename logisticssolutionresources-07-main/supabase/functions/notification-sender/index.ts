import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationRequest {
  recipient_id?: string
  recipient_role?: string
  title: string
  body: string
  type?: string
  priority?: string
  action_url?: string
  metadata?: Record<string, any>
  send_email?: boolean
  send_sms?: boolean
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { 
        autoRefreshToken: false, 
        persistSession: false 
      },
      global: {
        headers: { Authorization: req.headers.get('Authorization')! }
      }
    })

    // Get user from request
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response('Unauthorized', { 
        status: 401, 
        headers: corsHeaders 
      })
    }

    // Get organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id, role')
      .eq('id', user.id)
      .single()

    if (!profile?.organization_id) {
      return new Response('Organization not found', { 
        status: 400, 
        headers: corsHeaders 
      })
    }

    const notificationData: NotificationRequest = await req.json()

    // Determine recipients
    let recipients: string[] = []

    if (notificationData.recipient_id) {
      // Single recipient
      recipients = [notificationData.recipient_id]
    } else if (notificationData.recipient_role) {
      // All users with specific role in organization
      const { data: roleUsers } = await supabase
        .from('profiles')
        .select('id')
        .eq('organization_id', profile.organization_id)
        .eq('role', notificationData.recipient_role)
        .eq('is_active', true)

      recipients = roleUsers?.map(u => u.id) || []
    } else {
      // All users in organization
      const { data: orgUsers } = await supabase
        .from('profiles')
        .select('id')
        .eq('organization_id', profile.organization_id)
        .eq('is_active', true)

      recipients = orgUsers?.map(u => u.id) || []
    }

    if (recipients.length === 0) {
      return new Response('No recipients found', { 
        status: 400, 
        headers: corsHeaders 
      })
    }

    // Check permissions for sending notifications
    const canSendToAll = ['admin', 'council'].includes(profile.role)
    
    if (!canSendToAll && recipients.length > 1) {
      return new Response('Insufficient permissions to send bulk notifications', { 
        status: 403, 
        headers: corsHeaders 
      })
    }

    // Create notifications for each recipient
    const notifications = recipients.map(recipientId => ({
      user_id: recipientId,
      organization_id: profile.organization_id,
      sender_id: user.id,
      title: notificationData.title,
      body: notificationData.body,
      type: notificationData.type || 'info',
      priority: notificationData.priority || 'normal',
      action_url: notificationData.action_url,
      metadata: notificationData.metadata || {}
    }))

    const { data: createdNotifications, error: notificationError } = await supabase
      .from('enhanced_notifications')
      .insert(notifications)
      .select()

    if (notificationError) {
      console.error('Error creating notifications:', notificationError)
      return new Response('Failed to create notifications', { 
        status: 500, 
        headers: corsHeaders 
      })
    }

    // Send email notifications if requested
    if (notificationData.send_email) {
      for (const recipientId of recipients) {
        try {
          // Get recipient email
          const { data: recipient } = await supabase
            .from('profiles')
            .select('email, first_name, last_name')
            .eq('id', recipientId)
            .single()

          if (recipient?.email) {
            // Queue email task
            await supabase
              .from('background_tasks')
              .insert({
                task_type: 'send_email',
                organization_id: profile.organization_id,
                payload: {
                  to: recipient.email,
                  to_name: `${recipient.first_name} ${recipient.last_name}`,
                  subject: notificationData.title,
                  template: 'notification',
                  template_data: {
                    title: notificationData.title,
                    body: notificationData.body,
                    action_url: notificationData.action_url
                  }
                }
              })
          }
        } catch (emailError) {
          console.error('Error queuing email:', emailError)
        }
      }
    }

    // Send SMS notifications if requested
    if (notificationData.send_sms) {
      for (const recipientId of recipients) {
        try {
          // Get recipient phone
          const { data: recipient } = await supabase
            .from('profiles')
            .select('phone')
            .eq('id', recipientId)
            .single()

          if (recipient?.phone) {
            // Queue SMS task
            await supabase
              .from('background_tasks')
              .insert({
                task_type: 'send_sms',
                organization_id: profile.organization_id,
                payload: {
                  to: recipient.phone,
                  message: `${notificationData.title}: ${notificationData.body}`
                }
              })
          }
        } catch (smsError) {
          console.error('Error queuing SMS:', smsError)
        }
      }
    }

    // Log activity
    await supabase.rpc('log_user_activity', {
      p_user_id: user.id,
      p_action: 'notification_sent',
      p_resource_type: 'notification',
      p_metadata: { 
        recipient_count: recipients.length,
        type: notificationData.type,
        title: notificationData.title
      }
    })

    console.log(`Sent ${recipients.length} notifications: ${notificationData.title}`)

    return new Response(JSON.stringify({
      success: true,
      notifications_sent: recipients.length,
      notification_ids: createdNotifications?.map(n => n.id) || []
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Notification sender error:', error)
    return new Response('Internal server error', { 
      status: 500, 
      headers: corsHeaders 
    })
  }
})