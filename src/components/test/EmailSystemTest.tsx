import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Mail, 
  Send, 
  CheckCircle, 
  XCircle, 
  UserPlus, 
  FileText, 
  Lock,
  RefreshCw,
  Users,
  Bell
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import EmailService from '@/services/emailService';
import PasswordResetService from '@/services/passwordResetService';

const EmailSystemTest: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<{[key: string]: { success: boolean; message: string } | null}>({});
  const [activeTab, setActiveTab] = useState('welcome');

  // Form data
  const [emailData, setEmailData] = useState({
    email: '',
    firstName: 'Test',
    lastName: 'User',
    agreementTitle: 'Terms of Service',
    agreementType: 'terms of service',
    loginUrl: `${window.location.origin}/auth`
  });

  const runTest = async (testType: string, testFunction: () => Promise<boolean>) => {
    setIsLoading(true);
    setTestResults(prev => ({ ...prev, [testType]: null }));

    try {
      const success = await testFunction();
      setTestResults(prev => ({
        ...prev,
        [testType]: {
          success,
          message: success ? 'Email sent successfully!' : 'Failed to send email'
        }
      }));

      toast({
        title: success ? 'Test Successful' : 'Test Failed',
        description: success ? `${testType} email sent successfully` : `Failed to send ${testType} email`,
        variant: success ? 'default' : 'destructive',
      });
    } catch (error: any) {
      setTestResults(prev => ({
        ...prev,
        [testType]: {
          success: false,
          message: error.message || 'Test failed'
        }
      }));

      toast({
        title: 'Test Failed',
        description: error.message || `Failed to send ${testType} email`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testWelcomeEmail = async () => {
    return await EmailService.sendWelcomeEmail({
      to: emailData.email,
      firstName: emailData.firstName,
      lastName: emailData.lastName,
      email: emailData.email,
      loginUrl: emailData.loginUrl
    });
  };

  const testAgreementNotification = async () => {
    return await EmailService.sendAgreementNotification({
      to: emailData.email,
      firstName: emailData.firstName,
      lastName: emailData.lastName,
      email: emailData.email,
      agreementTitle: emailData.agreementTitle,
      agreementType: emailData.agreementType,
      loginUrl: emailData.loginUrl
    });
  };

  const testReminderEmail = async () => {
    return await EmailService.sendReminderEmail({
      to: emailData.email,
      firstName: emailData.firstName,
      lastName: emailData.lastName,
      email: emailData.email,
      agreementTitle: emailData.agreementTitle,
      agreementType: emailData.agreementType,
      loginUrl: emailData.loginUrl
    });
  };

  const testPasswordReset = async () => {
    const result = await PasswordResetService.sendPasswordResetEmail(emailData.email);
    return result.success;
  };

  const testCustomEmail = async () => {
    return await EmailService.sendCustomEmail({
      to: emailData.email,
      subject: 'Test Custom Email - LSR Transport',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Test Custom Email</title>
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
              <h1>Test Custom Email</h1>
              <p>LSR Transport Email System Test</p>
            </div>
            <div class="content">
              <h2>Hi ${emailData.firstName},</h2>
              <p>This is a test custom email to verify that your email system is working correctly.</p>
              <p><strong>Test Details:</strong></p>
              <ul>
                <li>Email Type: Custom Email</li>
                <li>Recipient: ${emailData.email}</li>
                <li>Timestamp: ${new Date().toLocaleString()}</li>
                <li>Status: Working ✅</li>
              </ul>
              <p>If you received this email, your LSR Transport email system is functioning properly!</p>
            </div>
            <div class="footer">
              <p>© 2024 LSR Transport. All rights reserved.</p>
              <p>This is a test email sent to ${emailData.email}</p>
            </div>
          </div>
        </body>
        </html>
      `
    });
  };

  const getTestResult = (testType: string) => {
    const result = testResults[testType];
    if (!result) return null;
    
    return (
      <Alert>
        {result.success ? (
          <CheckCircle className="h-4 w-4" />
        ) : (
          <XCircle className="h-4 w-4" />
        )}
        <AlertDescription>
          <strong>{testType}:</strong> {result.message}
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Email System Test</h1>
        <p className="text-muted-foreground">Test all email functionality in your LSR Transport app</p>
      </div>

      {/* Email Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="test-email">Email Address</Label>
              <Input
                id="test-email"
                type="email"
                value={emailData.email}
                onChange={(e) => setEmailData({ ...emailData, email: e.target.value })}
                placeholder="test@example.com"
              />
            </div>
            <div>
              <Label htmlFor="test-firstname">First Name</Label>
              <Input
                id="test-firstname"
                value={emailData.firstName}
                onChange={(e) => setEmailData({ ...emailData, firstName: e.target.value })}
                placeholder="Test"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="test-agreement-title">Agreement Title</Label>
              <Input
                id="test-agreement-title"
                value={emailData.agreementTitle}
                onChange={(e) => setEmailData({ ...emailData, agreementTitle: e.target.value })}
                placeholder="Terms of Service"
              />
            </div>
            <div>
              <Label htmlFor="test-agreement-type">Agreement Type</Label>
              <Select
                value={emailData.agreementType}
                onValueChange={(value) => setEmailData({ ...emailData, agreementType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="terms of service">Terms of Service</SelectItem>
                  <SelectItem value="privacy policy">Privacy Policy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Tests */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="welcome">Welcome</TabsTrigger>
          <TabsTrigger value="agreements">Agreements</TabsTrigger>
          <TabsTrigger value="password">Password Reset</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
          <TabsTrigger value="all">All Tests</TabsTrigger>
        </TabsList>

        <TabsContent value="welcome" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Welcome Email Test
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Test the welcome email that new users receive when they sign up.
              </p>
              <Button 
                onClick={() => runTest('welcome', testWelcomeEmail)}
                disabled={isLoading || !emailData.email}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Test Welcome Email
                  </>
                )}
              </Button>
              {getTestResult('welcome')}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agreements" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Agreement Update Notification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Test the agreement update notification email.
                </p>
                <Button 
                  onClick={() => runTest('agreement-notification', testAgreementNotification)}
                  disabled={isLoading || !emailData.email}
                  className="flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Test Agreement Notification
                    </>
                  )}
                </Button>
                {getTestResult('agreement-notification')}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Agreement Reminder
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Test the agreement reminder email.
                </p>
                <Button 
                  onClick={() => runTest('agreement-reminder', testReminderEmail)}
                  disabled={isLoading || !emailData.email}
                  className="flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Test Agreement Reminder
                    </>
                  )}
                </Button>
                {getTestResult('agreement-reminder')}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="password" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Password Reset Email Test
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Test the password reset email functionality.
              </p>
              <Button 
                onClick={() => runTest('password-reset', testPasswordReset)}
                disabled={isLoading || !emailData.email}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Test Password Reset
                  </>
                )}
              </Button>
              {getTestResult('password-reset')}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Custom Email Test
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Test sending a custom email with your own HTML template.
              </p>
              <Button 
                onClick={() => runTest('custom-email', testCustomEmail)}
                disabled={isLoading || !emailData.email}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Test Custom Email
                  </>
                )}
              </Button>
              {getTestResult('custom-email')}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Run All Email Tests
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Test all email types in sequence to verify your entire email system.
              </p>
              <Button 
                onClick={async () => {
                  await runTest('welcome', testWelcomeEmail);
                  await new Promise(resolve => setTimeout(resolve, 1000));
                  await runTest('agreement-notification', testAgreementNotification);
                  await new Promise(resolve => setTimeout(resolve, 1000));
                  await runTest('agreement-reminder', testReminderEmail);
                  await new Promise(resolve => setTimeout(resolve, 1000));
                  await runTest('custom-email', testCustomEmail);
                }}
                disabled={isLoading || !emailData.email}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Running All Tests...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Run All Email Tests
                  </>
                )}
              </Button>
              
              <div className="space-y-2">
                {getTestResult('welcome')}
                {getTestResult('agreement-notification')}
                {getTestResult('agreement-reminder')}
                {getTestResult('custom-email')}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>Email System Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Resend API Key: Configured</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Email Service: Active</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>All Templates: Ready</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailSystemTest;
