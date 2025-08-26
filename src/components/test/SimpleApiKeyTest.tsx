import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Key, Eye, EyeOff, Send } from 'lucide-react';

const SimpleApiKeyTest: React.FC = () => {
  const [showKey, setShowKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  
  // Get the API key from environment
  const apiKey = import.meta.env.VITE_RESEND_API_KEY || process.env.VITE_RESEND_API_KEY;
  
  const isKeySet = apiKey && apiKey !== 're_your_api_key_here' && apiKey.length > 10;
  const isKeyValid = isKeySet && apiKey.startsWith('re_');

  const getKeyDisplay = () => {
    if (!apiKey) return 'No API key found';
    if (apiKey === 're_your_api_key_here') return 'API key not configured';
    if (showKey) return apiKey;
    return `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`;
  };

  const testEmailSending = async () => {
    if (!isKeyValid) {
      alert('Please configure a valid Resend API key first');
      return;
    }

    setIsLoading(true);
    setTestResult(null);

    try {
      // Simple test email using Resend directly
      const { Resend } = await import('resend');
      const resend = new Resend(apiKey);
      
      const result = await resend.emails.send({
        from: 'LSR Transport <onboarding@resend.dev>',
        to: ['test@example.com'], // This will be caught by Resend's test mode
        subject: 'Test Email from LSR Transport',
        html: '<h1>Test Email</h1><p>This is a test email to verify your API key is working.</p>',
      });

      setTestResult({
        success: true,
        message: `Email sent successfully! Email ID: ${result.id}`
      });

      alert('Email Test Successful! Your Resend API key is working correctly');
    } catch (error: any) {
      setTestResult({
        success: false,
        message: error.message || "Failed to send test email"
      });

      alert(`Email Test Failed: ${error.message || "Failed to send test email"}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Simple API Key Test</h1>
        <p className="text-muted-foreground">Quick test of your Resend API key configuration</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            API Key Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status */}
          <div className="flex items-center gap-3">
            {isKeyValid ? (
              <CheckCircle className="h-6 w-6 text-green-600" />
            ) : (
              <XCircle className="h-6 w-6 text-red-600" />
            )}
            <div>
              <h3 className="font-semibold">
                {isKeyValid ? 'API Key Valid' : 'API Key Invalid'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isKeyValid 
                  ? 'Your Resend API key is properly configured' 
                  : 'Please check your API key configuration'
                }
              </p>
            </div>
            <Badge variant={isKeyValid ? "default" : "destructive"}>
              {isKeyValid ? "Ready" : "Not Ready"}
            </Badge>
          </div>

          {/* API Key Display */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">API Key:</p>
                <p className="font-mono text-sm">{getKeyDisplay()}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Environment Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-700">Environment:</p>
              <p className="text-sm text-blue-600">{import.meta.env.MODE}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-sm font-medium text-green-700">Key Length:</p>
              <p className="text-sm text-green-600">{apiKey ? apiKey.length : 0} characters</p>
            </div>
          </div>

          {/* Alerts */}
          {!isKeySet && (
            <Alert>
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>API Key Not Found:</strong> Please add your Resend API key to the <code>.env</code> file.
                <br />
                <strong>Format:</strong> <code>VITE_RESEND_API_KEY=re_your_actual_key_here</code>
              </AlertDescription>
            </Alert>
          )}

          {apiKey === 're_your_api_key_here' && (
            <Alert>
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Placeholder Detected:</strong> You're using the placeholder API key. 
                Please replace <code>re_your_api_key_here</code> with your actual Resend API key.
              </AlertDescription>
            </Alert>
          )}

          {isKeySet && !isKeyValid && (
            <Alert>
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Invalid API Key Format:</strong> Your API key should start with <code>re_</code>.
                Please check your Resend API key format.
              </AlertDescription>
            </Alert>
          )}

          {isKeyValid && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>API Key Valid!</strong> Your Resend API key is properly configured. 
                You can now test the email functionality.
              </AlertDescription>
            </Alert>
          )}

          {/* Test Result */}
          {testResult && (
            <Alert>
              {testResult.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              <AlertDescription>
                <strong>Test Result:</strong> {testResult.message}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Test Email Button */}
      {isKeyValid && (
        <Card>
          <CardHeader>
            <CardTitle>Test Email Sending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Click the button below to test if your API key can actually send emails.
              </p>
              <Button 
                onClick={testEmailSending}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Testing...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Test Email Sending
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {isKeyValid ? (
              <>
                <p className="text-green-600">✅ Your API key is ready!</p>
                <p>You can now test email functionality.</p>
              </>
            ) : (
              <>
                <p className="text-red-600">❌ API key needs to be configured</p>
                <p>Please:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Get your API key from <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Resend Dashboard</a></li>
                  <li>Add it to your <code>.env</code> file</li>
                  <li>Restart your development server</li>
                  <li>Refresh this page</li>
                </ol>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleApiKeyTest;
