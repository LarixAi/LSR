import { supabase } from '@/integrations/supabase/client';
import EmailService from './emailService';

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetResponse {
  success: boolean;
  message: string;
}

export class PasswordResetService {
  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(email: string): Promise<PasswordResetResponse> {
    try {
      // Use Supabase's built-in password reset
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error('Password reset error:', error);
        return {
          success: false,
          message: error.message || 'Failed to send password reset email'
        };
      }

      // Send a custom password reset email using our email service
      try {
        const resetUrl = `${window.location.origin}/reset-password`;
        await EmailService.sendCustomEmail({
          to: email,
          subject: 'Reset Your Password - LSR Transport',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Reset Your Password - LSR Transport</title>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
                .security { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Reset Your Password</h1>
                  <p>LSR Transport Account Security</p>
                </div>
                <div class="content">
                  <h2>Password Reset Request</h2>
                  
                  <p>We received a request to reset your password for your LSR Transport account. Click the button below to create a new password:</p>
                  
                  <div style="text-align: center;">
                    <a href="${resetUrl}" class="button">Reset Password</a>
                  </div>
                  
                  <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                  <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
                  
                  <div class="security">
                    <h3>🔒 Security Information:</h3>
                    <ul>
                      <li>This link will expire in 24 hours</li>
                      <li>If you didn't request a password reset, you can safely ignore this email</li>
                      <li>Your password will only be changed if you click the link above</li>
                      <li>For additional security, consider enabling two-factor authentication</li>
                    </ul>
                  </div>
                  
                  <p>If you have any questions or need assistance, please contact our support team.</p>
                </div>
                <div class="footer">
                  <p>© 2024 LSR Transport. All rights reserved.</p>
                  <p>This email was sent to ${email}</p>
                </div>
              </div>
            </body>
            </html>
          `
        });
      } catch (emailError) {
        console.error('Failed to send custom password reset email:', emailError);
        // Don't fail the entire operation if custom email fails
      }

      return {
        success: true,
        message: 'Password reset email sent successfully. Please check your email.'
      };
    } catch (error: any) {
      console.error('Password reset service error:', error);
      return {
        success: false,
        message: error.message || 'Failed to send password reset email'
      };
    }
  }

  /**
   * Update password with new password
   */
  static async updatePassword(newPassword: string): Promise<PasswordResetResponse> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('Password update error:', error);
        return {
          success: false,
          message: error.message || 'Failed to update password'
        };
      }

      return {
        success: true,
        message: 'Password updated successfully'
      };
    } catch (error: any) {
      console.error('Password update service error:', error);
      return {
        success: false,
        message: error.message || 'Failed to update password'
      };
    }
  }

  /**
   * Check if user has a valid password reset session
   */
  static async checkPasswordResetSession(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session;
    } catch (error) {
      console.error('Session check error:', error);
      return false;
    }
  }
}

export default PasswordResetService;
