import { supabase } from '@/integrations/supabase/client';
import EmailService from './emailService';

export interface VerificationToken {
  id: string;
  user_id: string;
  token: string;
  type: 'email_verification' | 'password_reset';
  expires_at: string;
  used: boolean;
  created_at: string;
}

export class UserVerificationService {
  /**
   * Generate a secure verification token
   */
  private static generateToken(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  /**
   * Create verification token for user
   */
  static async createVerificationToken(userId: string, type: 'email_verification' | 'password_reset' = 'email_verification'): Promise<string | null> {
    try {
      const token = this.generateToken();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours expiry

      const { error } = await supabase
        .from('verification_tokens')
        .insert({
          user_id: userId,
          token: token,
          type: type,
          expires_at: expiresAt.toISOString(),
          used: false
        });

      if (error) {
        console.error('Error creating verification token:', error);
        return null;
      }

      return token;
    } catch (error) {
      console.error('Error creating verification token:', error);
      return null;
    }
  }

  /**
   * Send verification email to user
   */
  static async sendVerificationEmail(userId: string): Promise<boolean> {
    try {
      // Get user details
      const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('email, first_name')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        console.error('Error fetching user:', userError);
        return false;
      }

      // Create verification token
      const token = await this.createVerificationToken(userId, 'email_verification');
      if (!token) {
        return false;
      }

      // Create verification URL
      const verificationUrl = `${window.location.origin}/verify-email?token=${token}`;

      // Send verification email
      const emailSent = await EmailService.sendVerificationEmail({
        to: user.email,
        firstName: user.first_name || 'User',
        verificationUrl: verificationUrl
      });

      return emailSent;
    } catch (error) {
      console.error('Error sending verification email:', error);
      return false;
    }
  }

  /**
   * Verify email token
   */
  static async verifyEmailToken(token: string): Promise<{ success: boolean; userId?: string; error?: string }> {
    try {
      // Find the token
      const { data: tokenData, error: tokenError } = await supabase
        .from('verification_tokens')
        .select('*')
        .eq('token', token)
        .eq('type', 'email_verification')
        .eq('used', false)
        .single();

      if (tokenError || !tokenData) {
        return { success: false, error: 'Invalid or expired verification token' };
      }

      // Check if token is expired
      const now = new Date();
      const expiresAt = new Date(tokenData.expires_at);
      if (now > expiresAt) {
        return { success: false, error: 'Verification token has expired' };
      }

      // Mark token as used
      await supabase
        .from('verification_tokens')
        .update({ used: true })
        .eq('id', tokenData.id);

      // Update user email verification status
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ email_verified: true, email_verified_at: new Date().toISOString() })
        .eq('id', tokenData.user_id);

      if (updateError) {
        console.error('Error updating user verification status:', updateError);
        return { success: false, error: 'Failed to update verification status' };
      }

      return { success: true, userId: tokenData.user_id };
    } catch (error) {
      console.error('Error verifying email token:', error);
      return { success: false, error: 'Verification failed' };
    }
  }

  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(email: string): Promise<boolean> {
    try {
      // Find user by email
      const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('id, first_name')
        .eq('email', email)
        .single();

      if (userError || !user) {
        console.error('User not found:', userError);
        return false;
      }

      // Create password reset token
      const token = await this.createVerificationToken(user.id, 'password_reset');
      if (!token) {
        return false;
      }

      // Create password reset URL
      const resetUrl = `${window.location.origin}/reset-password?token=${token}`;

      // Send password reset email using custom template
      const emailSent = await EmailService.sendCustomEmail({
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
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Reset Your Password</h1>
                <p>LSR Transport Account Security</p>
              </div>
              <div class="content">
                <h2>Hi ${user.first_name || 'User'},</h2>
                <p>We received a request to reset your password for your LSR Transport account. Click the button below to create a new password:</p>
                
                <div style="text-align: center;">
                  <a href="${resetUrl}" class="button">Reset Password</a>
                </div>
                
                <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
                
                <p><strong>Security Note:</strong></p>
                <ul>
                  <li>This link will expire in 24 hours</li>
                  <li>If you didn't request a password reset, you can safely ignore this email</li>
                  <li>Your password will only be changed if you click the link above</li>
                </ul>
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

      return emailSent;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return false;
    }
  }

  /**
   * Verify password reset token
   */
  static async verifyPasswordResetToken(token: string): Promise<{ success: boolean; userId?: string; error?: string }> {
    try {
      // Find the token
      const { data: tokenData, error: tokenError } = await supabase
        .from('verification_tokens')
        .select('*')
        .eq('token', token)
        .eq('type', 'password_reset')
        .eq('used', false)
        .single();

      if (tokenError || !tokenData) {
        return { success: false, error: 'Invalid or expired reset token' };
      }

      // Check if token is expired
      const now = new Date();
      const expiresAt = new Date(tokenData.expires_at);
      if (now > expiresAt) {
        return { success: false, error: 'Password reset token has expired' };
      }

      return { success: true, userId: tokenData.user_id };
    } catch (error) {
      console.error('Error verifying password reset token:', error);
      return { success: false, error: 'Token verification failed' };
    }
  }

  /**
   * Reset password with token
   */
  static async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Verify the token first
      const tokenVerification = await this.verifyPasswordResetToken(token);
      if (!tokenVerification.success) {
        return { success: false, error: tokenVerification.error };
      }

      // Update user password in Supabase Auth
      const { error: authError } = await supabase.auth.admin.updateUserById(
        tokenVerification.userId!,
        { password: newPassword }
      );

      if (authError) {
        console.error('Error updating password:', authError);
        return { success: false, error: 'Failed to update password' };
      }

      // Mark token as used
      await supabase
        .from('verification_tokens')
        .update({ used: true })
        .eq('token', token);

      return { success: true };
    } catch (error) {
      console.error('Error resetting password:', error);
      return { success: false, error: 'Password reset failed' };
    }
  }

  /**
   * Send welcome email after successful verification
   */
  static async sendWelcomeEmail(userId: string): Promise<boolean> {
    try {
      // Get user details
      const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('email, first_name')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        console.error('Error fetching user:', userError);
        return false;
      }

      // Send welcome email
      const emailSent = await EmailService.sendWelcomeEmail({
        to: user.email,
        firstName: user.first_name || 'User',
        loginUrl: `${window.location.origin}/auth`
      });

      return emailSent;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return false;
    }
  }
}

export default UserVerificationService;
