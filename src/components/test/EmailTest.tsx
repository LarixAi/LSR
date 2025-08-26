import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Send, 
  CheckCircle, 
  XCircle, 
  Clock,
  Users,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import EmailService from '@/services/emailService';
import { Resend } from 'resend';

const EmailTest: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [emailForm, setEmailForm] = useState({
    to: '',
    subject: 'Test Email from LSR Transport',
    html: '<h1>Hello from LSR Transport!</h1><p>This is a test email sent via Resend.</p>'
  });

  // Initialize Resend (you'll need to add your API key to .env)
  const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY || process.env.VITE_RESEND_API_KEY);

  const addTestResult = (test: string, success: boolean, message: string, data?: any) => {
    setTestResults(prev => [...prev, {
      id: Date.now(),
      test,
      success,
      message,
      data,
      timestamp: new Date().toISOString()
    }]);
  };

  // Test 1: Simple Email Send
  const testSimpleEmail = async () => {
    setIsLoading(true);
    try {
      const result = await resend.emails.send({
        from: 'LSR Transport <onboarding@resend.dev>',
        to: [emailForm.to || 'test@example.com'],
        subject: emailForm.subject,
        html: emailForm.html,
      });

      addTestResult('Simple Email Send', true, 'Email sent successfully', result);
      toast({
        title: "Email Sent!",
        description: "Test email sent successfully via Resend",
      });
    } catch (error: any) {
      addTestResult('Simple Email Send', false, error.message, error);
      toast({
        title: "Email Failed",
        description: error.message || "Failed to send email",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Test 2: Batch Email Send
  const testBatchEmail = async () => {
    setIsLoading(true);
    try {
      const result = await resend.batch.send([
        {
          from: 'LSR Transport <onboarding@resend.dev>',
          to: [emailForm.to || 'test1@example.com'],
          subject: 'Batch Test 1',
          html: '<h1>Batch Email 1</h1><p>This is the first email in the batch.</p>',
        },
        {
          from: 'LSR Transport <onboarding@resend.dev>',
          to: [emailForm.to || 'test2@example.com'],
          subject: 'Batch Test 2',
          html: '<h1>Batch Email 2</h1><p>This is the second email in the batch.</p>',
        },
      ]);

      addTestResult('Batch Email Send', true, 'Batch emails sent successfully', result);
      toast({
        title: "Batch Emails Sent!",
        description: "Multiple emails sent successfully via Resend",
      });
    } catch (error: any) {
      addTestResult('Batch Email Send', false, error.message, error);
      toast({
        title: "Batch Email Failed",
        description: error.message || "Failed to send batch emails",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Test 3: Custom Email Service
  const testCustomEmailService = async () => {
    setIsLoading(true);
    try {
      const success = await EmailService.sendCustomEmail({
        to: emailForm.to || 'test@example.com',
        subject: emailForm.subject,
        html: emailForm.html,
      });

      if (success) {
        addTestResult('Custom Email Service', true, 'Email sent via EmailService');
        toast({
          title: "Custom Email Sent!",
          description: "Email sent via our EmailService wrapper",
        });
      } else {
        addTestResult('Custom Email Service', false, 'Email service failed');
        toast({
          title: "Custom Email Failed",
          description: "EmailService failed to send email",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      addTestResult('Custom Email Service', false, error.message, error);
      toast({
        title: "Custom Email Error",
        description: error.message || "Error in custom email service",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Test 4: Agreement Notification
  const testAgreementNotification = async () => {
    setIsLoading(true);
    try {
      const success = await EmailService.sendAgreementNotification({
        to: emailForm.to || 'test@example.com',
        firstName: 'Test User',
        agreementTitle: 'Updated Terms of Service',
        agreementType: 'Terms of Service',
        loginUrl: 'http://localhost:3000/auth'
      });

      if (success) {
        addTestResult('Agreement Notification', true, 'Agreement notification sent');
        toast({
          title: "Agreement Email Sent!",
          description: "Agreement notification email sent successfully",
        });
      } else {
        addTestResult('Agreement Notification', false, 'Agreement notification failed');
        toast({
          title: "Agreement Email Failed",
          description: "Failed to send agreement notification",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      addTestResult('Agreement Notification', false, error.message, error);
      toast({
        title: "Agreement Email Error",
        description: error.message || "Error sending agreement notification",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Test 5: Welcome Email
  const testWelcomeEmail = async () => {
    setIsLoading(true);
    try {
      const success = await EmailService.sendWelcomeEmail({
        to: emailForm.to || 'test@example.com',
        firstName: 'Test User',
        loginUrl: 'http://localhost:3000/auth'
      });

      if (success) {
        addTestResult('Welcome Email', true, 'Welcome email sent');
        toast({
          title: "Welcome Email Sent!",
          description: "Welcome email sent successfully",
        });
      } else {
        addTestResult('Welcome Email', false, 'Welcome email failed');
        toast({
          title: "Welcome Email Failed",
          description: "Failed to send welcome email",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      addTestResult('Welcome Email', false, error.message, error);
      toast({
        title: "Welcome Email Error",
        description: error.message || "Error sending welcome email",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Email System Test</h1>
          <p className="text-muted-foreground">Test Resend email functionality</p>
        </div>
        <Button onClick={clearResults} variant="outline">
          Clear Results
        </Button>
      </div>

      {/* Email Form */}
      <Card>
        <CardHeader>
          <CardTitle>Email Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email">Recipient Email</Label>
            <Input
              id="email"
              type="email"
              value={emailForm.to}
              onChange={(e) => setEmailForm({ ...emailForm, to: e.target.value })}
              placeholder="test@example.com"
            />
          </div>
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={emailForm.subject}
              onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="html">HTML Content</Label>
            <Textarea
              id="html"
              value={emailForm.html}
              onChange={(e) => setEmailForm({ ...emailForm, html: e.target.value })}
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Test Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Email Tests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button 
              onClick={testSimpleEmail} 
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Simple Email
            </Button>
            
            <Button 
              onClick={testBatchEmail} 
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Users className="h-4 w-4" />
              Batch Emails
            </Button>
            
            <Button 
              onClick={testCustomEmailService} 
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Custom Service
            </Button>
            
            <Button 
              onClick={testAgreementNotification} 
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Agreement Email
            </Button>
            
            <Button 
              onClick={testWelcomeEmail} 
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Welcome Email
            </Button>
          </div>
          
          {isLoading && (
            <div className="flex items-center justify-center mt-4">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              <span>Sending email...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          {testResults.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No tests run yet. Click a test button above to start.</p>
          ) : (
            <div className="space-y-4">
              {testResults.map((result) => (
                <div key={result.id} className="flex items-start gap-3 p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    {result.success ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{result.test}</h4>
                      <Badge variant={result.success ? "default" : "destructive"}>
                        {result.success ? "Success" : "Failed"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{result.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(result.timestamp).toLocaleString()}
                    </p>
                    {result.data && (
                      <details className="mt-2">
                        <summary className="text-sm cursor-pointer text-blue-600">View Details</summary>
                        <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              <strong>Before testing:</strong> Make sure you have set up your Resend API key in your environment variables.
              Add <code>VITE_RESEND_API_KEY=re_your_api_key_here</code> to your <code>.env</code> file.
            </AlertDescription>
          </Alert>
          
          <div className="mt-4 space-y-2 text-sm">
            <p><strong>1.</strong> Get your API key from <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Resend Dashboard</a></p>
            <p><strong>2.</strong> Add the key to your <code>.env</code> file</p>
            <p><strong>3.</strong> Restart your development server</p>
            <p><strong>4.</strong> Enter a test email address above</p>
            <p><strong>5.</strong> Click any test button to verify email functionality</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailTest;
