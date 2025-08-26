import { supabase } from '@/integrations/supabase/client';

/**
 * Send email via Supabase Edge Function to avoid CORS issues
 */
async function sendEmailViaEdgeFunction(emailData: any): Promise<boolean> {
  try {
    const { data, error } = await supabase.functions.invoke('send-general-email', {
      body: { emailData }
    });

    if (error) {
      console.error('Edge function error:', error);
      return false;
    }

    if (data && data.success) {
      console.log('Email sent successfully via edge function:', data.id);
      return true;
    } else {
      console.error('Email sending failed:', data?.error || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.error('Failed to invoke edge function:', error);
    return false;
  }
}

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export interface UserVerificationEmail {
  to: string;
  firstName: string;
  verificationUrl: string;
}

export interface AgreementNotificationEmail {
  to: string;
  firstName: string;
  lastName?: string;
  email: string;
  agreementTitle: string;
  agreementType: string;
  loginUrl: string;
}

export interface WelcomeEmail {
  to: string;
  firstName: string;
  lastName?: string;
  email: string;
  loginUrl: string;
}

export class EmailService {
  private static defaultFrom = 'LSR Transport <noreply@transport.logisticssolutionresources.com>';
  
  /**
   * Check if the email service is properly configured
   */
  static async isConfigured(): Promise<boolean> {
    // For edge function approach, we assume it's configured if Supabase is available
    return typeof window !== 'undefined' && !!supabase;
  }
  
  /**
   * Get the appropriate sender email based on context
   */
  private static getSenderEmail(userEmail?: string, context?: string): string {
    // For user-specific emails, use their email as sender
    if (userEmail && context === 'user') {
      return `LSR Transport <${userEmail}>`;
    }
    
    // For system emails, use the default
    return this.defaultFrom;
  }

  /**
   * Send user verification email
   */
  static async sendVerificationEmail(data: UserVerificationEmail): Promise<boolean> {
    try {
      const { to, firstName, verificationUrl } = data;
      
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Your Email - LSR Transport</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to LSR Transport!</h1>
              <p>Please verify your email address to get started</p>
            </div>
            <div class="content">
              <h2>Hi ${firstName},</h2>
              <p>Thank you for signing up with LSR Transport Management System. To complete your registration and access your account, please verify your email address by clicking the button below:</p>
              
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              
              <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
              
              <p>This link will expire in 24 hours for security reasons.</p>
              
              <p>If you didn't create an account with LSR Transport, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              <p>© 2024 LSR Transport. All rights reserved.</p>
              <p>This email was sent to ${to}</p>
            </div>
          </div>
        </body>
        </html>
      `;

      return await sendEmailViaEdgeFunction({
        from: this.defaultFrom,
        to: [to],
        subject: 'Verify Your Email - LSR Transport',
        html: html,
      });
    } catch (error: any) {
      console.error('Failed to send verification email:', error);
      return false;
    }
  }

  /**
   * Send agreement update notification
   */
  static async sendAgreementNotification(data: AgreementNotificationEmail): Promise<boolean> {
    
    try {
      const { to, firstName, lastName, email, agreementTitle, agreementType, loginUrl } = data;
      
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Updated ${agreementTitle} - Action Required</title>
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
              <h1>Important: Updated ${agreementTitle}</h1>
              <p>Action Required - Please Review and Accept</p>
            </div>
            <div class="content">
              <h2>Hi ${firstName}${lastName ? ` ${lastName}` : ''},</h2>
              
              <div class="alert">
                <strong>⚠️ Action Required:</strong> We have updated our ${agreementType} and need you to review and accept the new terms to continue using our services.
              </div>
              
              <p>To ensure uninterrupted access to your LSR Transport account, please log in and review the updated ${agreementTitle}.</p>
              
              <div style="text-align: center;">
                <a href="${loginUrl}" class="button">Review Updated Agreement</a>
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
              <p>This email was sent to ${to}</p>
            </div>
          </div>
        </body>
        </html>
      `;

      return await sendEmailViaEdgeFunction({
        from: this.getSenderEmail(email, 'user'),
        to: [to],
        subject: `Important: Updated ${agreementTitle} - Action Required`,
        html: html,
      });
    } catch (error) {
      console.error('Failed to send agreement notification:', error);
      return false;
    }
  }

  /**
   * Send welcome email with agreement acceptance
   */
  static async sendWelcomeEmail(data: WelcomeEmail): Promise<boolean> {
    
    try {
      const { to, firstName, lastName, email, loginUrl } = data;
      
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to LSR Transport!</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #00b894 0%, #00a085 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #00b894; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .features { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; }
            .feature { background: white; padding: 20px; border-radius: 5px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to LSR Transport!</h1>
              <p>Your account is ready to use</p>
            </div>
            <div class="content">
              <h2>Hi ${firstName}${lastName ? ` ${lastName}` : ''},</h2>
              
              <p>Welcome to LSR Transport Management System! Your account has been successfully created and you're ready to start managing your transportation operations.</p>
              
              <p><strong>Account Details:</strong></p>
              <ul>
                <li><strong>Email:</strong> ${email}</li>
                <li><strong>Name:</strong> ${firstName}${lastName ? ` ${lastName}` : ''}</li>
                <li><strong>Account Status:</strong> Active</li>
              </ul>
              
              <div style="text-align: center;">
                <a href="${loginUrl}" class="button">Access Your Dashboard</a>
              </div>
              
              <h3>What you can do with LSR Transport:</h3>
              <div class="features">
                <div class="feature">
                  <h4>🚛 Vehicle Management</h4>
                  <p>Track and manage your fleet efficiently</p>
                </div>
                <div class="feature">
                  <h4>👥 Driver Management</h4>
                  <p>Manage driver profiles and documentation</p>
                </div>
                <div class="feature">
                  <h4>📊 Analytics & Reports</h4>
                  <p>Get insights into your operations</p>
                </div>
                <div class="feature">
                  <h4>🔔 Smart Notifications</h4>
                  <p>Stay updated with real-time alerts</p>
                </div>
              </div>
              
              <p><strong>Next Steps:</strong></p>
              <ol>
                <li>Log in to your account</li>
                <li>Complete your profile setup</li>
                <li>Add your vehicles and drivers</li>
                <li>Start managing your operations</li>
              </ol>
              
              <p>If you have any questions or need assistance, our support team is here to help!</p>
            </div>
            <div class="footer">
              <p>© 2024 LSR Transport. All rights reserved.</p>
              <p>This email was sent to ${to}</p>
            </div>
          </div>
        </body>
        </html>
      `;

      return await sendEmailViaEdgeFunction({
        from: this.getSenderEmail(email, 'user'),
        to: [to],
        subject: 'Welcome to LSR Transport - Your Account is Ready!',
        html: html,
      });
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      return false;
    }
  }

  /**
   * Send reminder email for pending agreements
   */
  static async sendReminderEmail(data: AgreementNotificationEmail): Promise<boolean> {
    
    try {
      const { to, firstName, lastName, email, agreementTitle, agreementType, loginUrl } = data;
      
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reminder: Please Accept Updated Agreement</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #fdcb6e 0%, #e17055 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #fdcb6e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Friendly Reminder</h1>
              <p>Please Accept Updated Agreement</p>
            </div>
            <div class="content">
              <h2>Hi ${firstName}${lastName ? ` ${lastName}` : ''},</h2>
              
              <p>This is a friendly reminder that you have a pending ${agreementType} update that needs your attention.</p>
              
              <p>To ensure uninterrupted access to your LSR Transport account, please log in and accept the updated ${agreementTitle}.</p>
              
              <div style="text-align: center;">
                <a href="${loginUrl}" class="button">Accept Updated Agreement</a>
              </div>
              
              <p>This should only take a few minutes of your time.</p>
              
              <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
            </div>
            <div class="footer">
              <p>© 2024 LSR Transport. All rights reserved.</p>
              <p>This email was sent to ${to}</p>
            </div>
          </div>
        </body>
        </html>
      `;

      return await sendEmailViaEdgeFunction({
        from: this.getSenderEmail(email, 'user'),
        to: [to],
        subject: `Reminder: Please Accept Updated ${agreementTitle}`,
        html: html,
      });
    } catch (error) {
      console.error('Failed to send reminder email:', error);
      return false;
    }
  }

  /**
   * Send custom email using template
   */
  static async sendCustomEmail(template: EmailTemplate): Promise<boolean> {
    try {
      return await sendEmailViaEdgeFunction({
        from: template.from || this.defaultFrom,
        to: [template.to],
        subject: template.subject,
        html: template.html,
      });
    } catch (error) {
      console.error('Failed to send custom email:', error);
      return false;
    }
  }
}

export default EmailService;
