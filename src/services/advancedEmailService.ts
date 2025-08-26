import { supabase } from '@/integrations/supabase/client';

/**
 * Send email via Supabase Edge Function to avoid CORS issues
 */
async function sendEmailViaEdgeFunction(emailData: any): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('send-general-email', {
      body: { emailData }
    });

    if (error) {
      console.error('Advanced Email Service - Edge function error:', error);
      return { success: false, error: error.message };
    }

    if (data && data.success) {
      console.log('Advanced Email Service - Email sent successfully via edge function:', data.id);
      return { success: true, id: data.id };
    } else {
      console.error('Advanced Email Service - Email sending failed:', data?.error || 'Unknown error');
      return { success: false, error: data?.error || 'Unknown error' };
    }
  } catch (error: any) {
    console.error('Advanced Email Service - Failed to invoke edge function:', error);
    return { success: false, error: error.message };
  }
}

export interface EmailData {
  from: string;
  to: string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    path?: string;
  }>;
}

export interface BatchEmailData {
  emails: EmailData[];
}

export interface EmailUpdateData {
  id: string;
  scheduledAt?: string;
}

export interface EmailStatus {
  id: string;
  from: string;
  to: string[];
  subject: string;
  status: 'sent' | 'delivered' | 'failed' | 'pending' | 'scheduled';
  createdAt: string;
  scheduledAt?: string;
  deliveredAt?: string;
  failedAt?: string;
  error?: string;
}

export class AdvancedEmailService {
  private static defaultFrom = 'LSR Transport <noreply@transport.logisticssolutionresources.com>';

  /**
   * Send a single email
   */
  static async sendEmail(emailData: EmailData): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      return await sendEmailViaEdgeFunction({
        from: emailData.from || this.defaultFrom,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
        replyTo: emailData.replyTo,
        cc: emailData.cc,
        bcc: emailData.bcc,
        attachments: emailData.attachments,
      });
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Send batch emails
   */
  static async sendBatchEmails(batchData: BatchEmailData): Promise<{ success: boolean; results: any[]; errors: any[] }> {
    try {
      // For batch emails, we'll send them one by one via the edge function
      const results = [];
      const errors = [];
      
      for (const email of batchData.emails) {
        const result = await sendEmailViaEdgeFunction(email);
        if (result.success) {
          results.push(result);
        } else {
          errors.push({ error: result.error });
        }
      }

      return {
        success: errors.length === 0,
        results: results,
        errors: errors
      };
    } catch (error: any) {
      return {
        success: false,
        results: [],
        errors: [{ error: error.message }]
      };
    }
  }

  /**
   * Retrieve email details
   */
  static async getEmail(emailId: string): Promise<{ success: boolean; email?: EmailStatus; error?: string }> {
    // Note: Email retrieval is not supported via edge function in this implementation
    // You would need to implement a separate edge function for this
    return { success: false, error: 'Email retrieval not implemented via edge function' };
  }

  /**
   * Update email (schedule, reschedule, etc.)
   */
  static async updateEmail(updateData: EmailUpdateData): Promise<{ success: boolean; error?: string }> {
    // Note: Email updates are not supported via edge function in this implementation
    // You would need to implement a separate edge function for this
    return { success: false, error: 'Email updates not implemented via edge function' };
  }

  /**
   * Cancel a scheduled email
   */
  static async cancelEmail(emailId: string): Promise<{ success: boolean; error?: string }> {
    // Note: Email cancellation is not supported via edge function in this implementation
    // You would need to implement a separate edge function for this
    return { success: false, error: 'Email cancellation not implemented via edge function' };
  }

  /**
   * Schedule email for later delivery
   */
  static async scheduleEmail(emailData: EmailData, scheduledAt: string): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      return await sendEmailViaEdgeFunction({
        from: emailData.from || this.defaultFrom,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
        replyTo: emailData.replyTo,
        cc: emailData.cc,
        bcc: emailData.bcc,
        attachments: emailData.attachments,
        scheduledAt: scheduledAt,
      });
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Send agreement notification with advanced features
   */
  static async sendAdvancedAgreementNotification(data: {
    to: string[];
    firstName: string;
    agreementTitle: string;
    agreementType: string;
    loginUrl: string;
    scheduledAt?: string;
  }): Promise<{ success: boolean; id?: string; error?: string }> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Important: Updated ${data.agreementTitle}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #ff6b6b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .alert { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Important: Updated ${data.agreementTitle}</h1>
            <p>Action Required - Please Review and Accept</p>
          </div>
          <div class="content">
            <h2>Hi ${data.firstName},</h2>
            
            <div class="alert">
              <strong>⚠️ Action Required:</strong> We have updated our ${data.agreementType} and need you to review and accept the new terms to continue using our services.
            </div>
            
            <p>To ensure uninterrupted access to your LSR Transport account, please log in and review the updated ${data.agreementTitle}.</p>
            
            <div style="text-align: center;">
              <a href="${data.loginUrl}" class="button">Review Updated Agreement</a>
            </div>
            
            <h3>What's Changed?</h3>
            <ul>
              <li>Updated privacy practices and data protection measures</li>
              <li>Enhanced security protocols</li>
              <li>Improved user rights and transparency</li>
              <li>Compliance with latest regulations</li>
            </ul>
            
            <p><strong>Please note:</strong> You won't be able to access your account until you accept the updated agreement.</p>
            
            <p>If you have any questions about these changes, please don't hesitate to contact our support team.</p>
          </div>
          <div class="footer">
            <p>© 2024 LSR Transport. All rights reserved.</p>
            <p>This email was sent to ${data.to.join(', ')}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      from: this.defaultFrom,
      to: data.to,
      subject: `Important: Updated ${data.agreementTitle} - Action Required`,
      html: html,
    });
  }

  /**
   * Send bulk agreement notifications with batch processing
   */
  static async sendBulkAgreementNotifications(users: Array<{
    email: string;
    firstName: string;
  }>, agreementData: {
    title: string;
    type: string;
    loginUrl: string;
  }): Promise<{ success: boolean; results: any[]; errors: any[] }> {
    const emails = users.map(user => ({
      from: this.defaultFrom,
      to: [user.email],
      subject: `Important: Updated ${agreementData.title} - Action Required`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Updated ${agreementData.title}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #ff6b6b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Updated ${agreementData.title}</h1>
              <p>Action Required</p>
            </div>
            <div class="content">
              <h2>Hi ${user.firstName},</h2>
              <p>We have updated our ${agreementData.type}. Please review and accept the new terms.</p>
              <div style="text-align: center;">
                <a href="${agreementData.loginUrl}" class="button">Review Agreement</a>
              </div>
            </div>
            <div class="footer">
              <p>© 2024 LSR Transport. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    }));

    return this.sendBatchEmails({ emails });
  }

  /**
   * Get email delivery status
   */
  static async getEmailStatus(emailId: string): Promise<{ success: boolean; status?: EmailStatus; error?: string }> {
    // Note: Email status retrieval is not supported via edge function in this implementation
    // You would need to implement a separate edge function for this
    return { success: false, error: 'Email status retrieval not implemented via edge function' };
  }

  /**
   * Reschedule a scheduled email
   */
  static async rescheduleEmail(emailId: string, newScheduledAt: string): Promise<{ success: boolean; error?: string }> {
    return this.updateEmail({
      id: emailId,
      scheduledAt: newScheduledAt
    });
  }

  /**
   * Send test email with custom content
   */
  static async sendTestEmail(to: string, customContent?: string): Promise<{ success: boolean; id?: string; error?: string }> {
    const html = customContent || `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Test Email - LSR Transport</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Test Email</h1>
            <p>LSR Transport Email System</p>
          </div>
          <div class="content">
            <h2>Hello!</h2>
            <p>This is a test email from the LSR Transport email system.</p>
            <p>If you're receiving this email, it means our email system is working correctly!</p>
            <p><strong>Test Details:</strong></p>
            <ul>
              <li>Sent via Resend API</li>
              <li>Timestamp: ${new Date().toLocaleString()}</li>
              <li>Recipient: ${to}</li>
            </ul>
          </div>
          <div class="footer">
            <p>© 2024 LSR Transport. All rights reserved.</p>
            <p>This is a test email sent to ${to}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      from: this.defaultFrom,
      to: [to],
      subject: 'Test Email - LSR Transport Email System',
      html: html,
    });
  }
}

export default AdvancedEmailService;
