import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationDeliveryRequest {
  notification_id: string;
  channel: 'in_app' | 'push' | 'email' | 'sms';
  recipient_id: string;
  organization_id: string;
}

interface NotificationData {
  id: string;
  title: string;
  body: string;
  type: string;
  priority: string;
  category: string;
  channels: string[];
  sender_name: string;
  sender_role: string;
}

interface UserProfile {
  id: string;
  email: string;
  phone?: string;
  first_name: string;
  last_name: string;
  role: string;
  push_token?: string;
}

serve(async (req) => {
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
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { 
        autoRefreshToken: false, 
        persistSession: false 
      }
    })

    const { notification_id, channel, recipient_id, organization_id }: NotificationDeliveryRequest = await req.json()

    if (!notification_id || !channel || !recipient_id || !organization_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get notification data
    const { data: notification, error: notificationError } = await supabase
      .from('notification_messages')
      .select('*')
      .eq('id', notification_id)
      .single()

    if (notificationError || !notification) {
      return new Response(
        JSON.stringify({ error: 'Notification not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get recipient profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', recipient_id)
      .eq('organization_id', organization_id)
      .single()

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'Recipient profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user notification settings
    const { data: settings } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', recipient_id)
      .eq('organization_id', organization_id)
      .single()

    // Check if channel is enabled for this user
    const isChannelEnabled = settings ? 
      (channel === 'email' ? settings.email_enabled :
       channel === 'push' ? settings.push_enabled :
       channel === 'sms' ? settings.sms_enabled :
       channel === 'in_app' ? settings.in_app_enabled : false) : true

    if (!isChannelEnabled) {
      // Update delivery log as skipped
      await supabase
        .from('notification_delivery_logs')
        .update({ 
          status: 'failed',
          error_message: 'Channel disabled by user settings',
          delivered_at: new Date().toISOString()
        })
        .eq('notification_id', notification_id)
        .eq('recipient_id', recipient_id)
        .eq('channel', channel)

      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Channel disabled by user settings',
          channel,
          recipient_id 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check quiet hours for non-emergency notifications
    if (notification.priority !== 'emergency' && settings) {
      const now = new Date()
      const userTimezone = settings.timezone || 'UTC'
      
      // Convert to user's timezone (simplified - in production use proper timezone library)
      const userTime = new Date(now.toLocaleString("en-US", {timeZone: userTimezone}))
      const currentHour = userTime.getHours()
      const currentMinute = userTime.getMinutes()
      const currentTimeMinutes = currentHour * 60 + currentMinute
      
      const quietStart = settings.quiet_hours_start || '22:00'
      const quietEnd = settings.quiet_hours_end || '07:00'
      
      const [startHour, startMinute] = quietStart.split(':').map(Number)
      const [endHour, endMinute] = quietEnd.split(':').map(Number)
      
      const quietStartMinutes = startHour * 60 + startMinute
      const quietEndMinutes = endHour * 60 + endMinute
      
      const inQuietHours = quietStartMinutes <= quietEndMinutes ?
        (currentTimeMinutes >= quietStartMinutes && currentTimeMinutes <= quietEndMinutes) :
        (currentTimeMinutes >= quietStartMinutes || currentTimeMinutes <= quietEndMinutes)
      
      if (inQuietHours) {
        // Update delivery log as skipped due to quiet hours
        await supabase
          .from('notification_delivery_logs')
          .update({ 
            status: 'failed',
            error_message: 'Delivery skipped due to quiet hours',
            delivered_at: new Date().toISOString()
          })
          .eq('notification_id', notification_id)
          .eq('recipient_id', recipient_id)
          .eq('channel', channel)

        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'Delivery skipped due to quiet hours',
            channel,
            recipient_id 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    let deliveryResult = { success: false, error: 'Unknown delivery method' }

    // Handle different delivery channels
    switch (channel) {
      case 'in_app':
        deliveryResult = await handleInAppDelivery(supabase, notification, profile)
        break
      
      case 'push':
        deliveryResult = await handlePushDelivery(notification, profile)
        break
      
      case 'email':
        deliveryResult = await handleEmailDelivery(notification, profile)
        break
      
      case 'sms':
        deliveryResult = await handleSMSDelivery(notification, profile)
        break
      
      default:
        deliveryResult = { success: false, error: 'Unsupported delivery channel' }
    }

    // Update delivery log
    await supabase
      .from('notification_delivery_logs')
      .update({ 
        status: deliveryResult.success ? 'delivered' : 'failed',
        error_message: deliveryResult.success ? null : deliveryResult.error,
        delivered_at: deliveryResult.success ? new Date().toISOString() : null
      })
      .eq('notification_id', notification_id)
      .eq('recipient_id', recipient_id)
      .eq('channel', channel)

    return new Response(
      JSON.stringify({
        success: deliveryResult.success,
        message: deliveryResult.success ? 'Notification delivered successfully' : deliveryResult.error,
        channel,
        recipient_id,
        notification_id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Notification delivery error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// In-app delivery (already handled by real-time subscriptions)
async function handleInAppDelivery(supabase: any, notification: NotificationData, profile: UserProfile) {
  try {
    // For in-app notifications, we just need to ensure the notification is properly stored
    // Real-time delivery is handled by Supabase real-time subscriptions
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Push notification delivery
async function handlePushDelivery(notification: NotificationData, profile: UserProfile) {
  try {
    if (!profile.push_token) {
      return { success: false, error: 'No push token available' }
    }

    // In a real implementation, you would integrate with:
    // - Firebase Cloud Messaging (FCM) for Android
    // - Apple Push Notification Service (APNs) for iOS
    // - Web Push API for web browsers
    
    // For now, we'll simulate push delivery
    console.log(`Push notification would be sent to ${profile.push_token}:`, {
      title: notification.title,
      body: notification.body,
      data: {
        notification_id: notification.id,
        type: notification.type,
        priority: notification.priority,
        category: notification.category
      }
    })

    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Email delivery
async function handleEmailDelivery(notification: NotificationData, profile: UserProfile) {
  try {
    if (!profile.email) {
      return { success: false, error: 'No email address available' }
    }

    // In a real implementation, you would integrate with:
    // - SendGrid, Mailgun, AWS SES, or similar email service
    
    const emailContent = {
      to: profile.email,
      subject: `[${notification.priority.toUpperCase()}] ${notification.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: ${getPriorityColor(notification.priority)}; padding: 20px; border-radius: 8px;">
            <h2 style="margin: 0; color: white;">${notification.title}</h2>
          </div>
          <div style="padding: 20px; background-color: #f9f9f9;">
            <p style="margin: 0 0 15px 0;">${notification.body}</p>
            <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd;">
              <small style="color: #666;">
                Sent by: ${notification.sender_name} (${notification.sender_role})<br>
                Category: ${notification.category}<br>
                Priority: ${notification.priority}<br>
                Sent at: ${new Date().toLocaleString()}
              </small>
            </div>
          </div>
        </div>
      `
    }

    console.log(`Email would be sent to ${profile.email}:`, emailContent)

    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// SMS delivery
async function handleSMSDelivery(notification: NotificationData, profile: UserProfile) {
  try {
    if (!profile.phone) {
      return { success: false, error: 'No phone number available' }
    }

    // In a real implementation, you would integrate with:
    // - Twilio, AWS SNS, or similar SMS service
    
    const smsContent = {
      to: profile.phone,
      message: `[${notification.priority.toUpperCase()}] ${notification.title}: ${notification.body}`
    }

    console.log(`SMS would be sent to ${profile.phone}:`, smsContent)

    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Helper function to get priority color
function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'emergency': return '#dc2626'
    case 'high': return '#ea580c'
    case 'normal': return '#2563eb'
    case 'low': return '#6b7280'
    default: return '#6b7280'
  }
}

