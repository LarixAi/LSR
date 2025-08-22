import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { ticketData, ticketId } = await req.json()

    // Validate required fields
    if (!ticketData || !ticketId) {
      throw new Error('Missing required fields: ticketData and ticketId')
    }

    if (!ticketData.subject || !ticketData.description || !ticketData.userEmail) {
      throw new Error('Missing required ticket fields: subject, description, userEmail')
    }

    // Create email content
    const emailSubject = `[${ticketId}] ${ticketData.type === 'support' ? 'IT Support Request' : 'Feature Suggestion'}: ${ticketData.subject}`
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">LSR Support Ticket</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Ticket ID: ${ticketId}</p>
        </div>
        
        <div style="padding: 20px; border: 1px solid #e1e5e9; border-top: none; border-radius: 0 0 8px 8px;">
          <div style="margin-bottom: 20px;">
            <h2 style="color: #333; margin-bottom: 10px;">Ticket Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #666;">Type:</td>
                <td style="padding: 8px 0;">
                  <span style="background: ${ticketData.type === 'support' ? '#3b82f6' : '#10b981'}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                    ${ticketData.type === 'support' ? 'IT Support' : 'Feature Suggestion'}
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #666;">Priority:</td>
                <td style="padding: 8px 0;">
                  <span style="background: ${getPriorityColor(ticketData.priority)}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                    ${getPriorityIcon(ticketData.priority)} ${ticketData.priority.toUpperCase()}
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #666;">Subject:</td>
                <td style="padding: 8px 0;">${ticketData.subject}</td>
              </tr>
            </table>
          </div>

          <div style="margin-bottom: 20px;">
            <h3 style="color: #333; margin-bottom: 10px;">Description</h3>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; border-left: 4px solid #3b82f6;">
              ${ticketData.description.replace(/\n/g, '<br>')}
            </div>
          </div>

          <div style="margin-bottom: 20px;">
            <h3 style="color: #333; margin-bottom: 10px;">User Information</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #666;">Name:</td>
                <td style="padding: 8px 0;">${ticketData.userName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #666;">Email:</td>
                <td style="padding: 8px 0;">${ticketData.userEmail}</td>
              </tr>
              ${ticketData.userPhone ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #666;">Phone:</td>
                <td style="padding: 8px 0;">${ticketData.userPhone}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #666;">App Version:</td>
                <td style="padding: 8px 0;">${ticketData.appVersion}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #666;">Device Info:</td>
                <td style="padding: 8px 0; font-size: 12px; color: #666;">${ticketData.deviceInfo}</td>
              </tr>
            </table>
          </div>

          <div style="background: #f8f9fa; padding: 15px; border-radius: 6px; border-left: 4px solid #10b981;">
            <p style="margin: 0; color: #666; font-size: 14px;">
              <strong>Next Steps:</strong> Please respond to this ticket within the expected timeframe based on the priority level.
            </p>
          </div>
        </div>
      </div>
    `

    // Send email using Resend (you'll need to set up Resend or another email service)
    const emailResponse = await sendEmail({
      to: 'transport@logisticssolutionresources.com',
      subject: emailSubject,
      html: emailHtml,
      from: 'noreply@logisticssolutionresources.com'
    })

    // Store ticket in database for tracking
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { error: dbError } = await supabase
      .from('support_tickets')
      .insert({
        ticket_id: ticketId,
        type: ticketData.type,
        priority: ticketData.priority,
        subject: ticketData.subject,
        description: ticketData.description,
        user_email: ticketData.userEmail,
        user_name: ticketData.userName,
        user_phone: ticketData.userPhone,
        app_version: ticketData.appVersion,
        device_info: ticketData.deviceInfo,
        status: 'open',
        created_at: new Date().toISOString()
      })

    if (dbError) {
      console.error('Database error:', dbError)
      // Don't fail the request if database insert fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        ticketId: ticketId,
        message: 'Ticket submitted successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error processing support ticket:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'low': return '#10b981'
    case 'medium': return '#f59e0b'
    case 'high': return '#f97316'
    case 'urgent': return '#ef4444'
    default: return '#6b7280'
  }
}

function getPriorityIcon(priority: string): string {
  switch (priority) {
    case 'low': return '🟢'
    case 'medium': return '🟡'
    case 'high': return '🟠'
    case 'urgent': return '🔴'
    default: return '⚪'
  }
}

async function sendEmail(emailData: {
  to: string
  subject: string
  html: string
  from: string
}) {
  // For now, we'll simulate email sending
  // In production, you would integrate with a real email service like Resend, SendGrid, etc.
  
  console.log('Email would be sent:', {
    to: emailData.to,
    subject: emailData.subject,
    from: emailData.from
  })

  // Simulate email service delay
  await new Promise(resolve => setTimeout(resolve, 1000))

  return { success: true }
}

