import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  AlertTriangle, 
  Lightbulb, 
  Send, 
  CheckCircle, 
  XCircle,
  User,
  Mail,
  Phone,
  FileText,
  Settings,
  MessageCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useCreateSupportTicket } from '@/hooks/useSupportTickets';

interface TicketFormData {
  type: 'support' | 'suggestion';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  subject: string;
  description: string;
  userEmail: string;
  userName: string;
  userPhone?: string;
  appVersion: string;
  deviceInfo: string;
  attachments?: File[];
}

export default function SupportTicketForm() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');
  
  const createSupportTicket = useCreateSupportTicket();

  const [formData, setFormData] = useState<TicketFormData>({
    type: 'support',
    priority: 'medium',
    subject: '',
    description: '',
    userEmail: profile?.email || '',
    userName: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim(),
    userPhone: '',
    appVersion: 'v1.0.0',
    deviceInfo: `${navigator.userAgent} - ${window.innerWidth}x${window.innerHeight}`,
    attachments: []
  });

  // Handle URL parameters for pre-selecting ticket type
  useEffect(() => {
    const typeParam = searchParams.get('type');
    if (typeParam === 'suggestion') {
      setFormData(prev => ({
        ...prev,
        type: 'suggestion'
      }));
    }
  }, [searchParams]);

  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
  };

  const priorityIcons = {
    low: '🟢',
    medium: '🟡',
    high: '🟠',
    urgent: '🔴'
  };

  const generateTicketId = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `TKT-${timestamp}-${random}`.toUpperCase();
  };

  const handleInputChange = (field: keyof TicketFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData(prev => ({
      ...prev,
      attachments: files
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.subject.trim()) {
      toast({
        title: "Missing Subject",
        description: "Please enter a subject for your ticket.",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.description.trim()) {
      toast({
        title: "Missing Description",
        description: "Please provide a detailed description of your issue or suggestion.",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.userEmail.trim()) {
      toast({
        title: "Missing Email",
        description: "Please enter your email address.",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const sendEmail = async (ticketData: TicketFormData, ticketId: string) => {
    try {
      // Create support ticket in database
      const supportTicketData = {
        ticket_id: ticketId,
        type: ticketData.type === 'support' ? 'technical' : 'feature_request',
        priority: ticketData.priority === 'urgent' ? 'critical' : ticketData.priority,
        subject: ticketData.subject,
        description: ticketData.description,
        user_email: ticketData.userEmail,
        user_name: ticketData.userName,
        user_phone: ticketData.userPhone,
        app_version: ticketData.appVersion,
        device_info: ticketData.deviceInfo,
        tags: [ticketData.type]
      };

      await createSupportTicket.mutateAsync(supportTicketData);

      // Also send email notification (optional)
      try {
        const response = await fetch('/functions/v1/send-support-ticket', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`
          },
          body: JSON.stringify({
            ticketData,
            ticketId
          })
        });

        const result = await response.json();
        
        if (!response.ok) {
          console.warn('Email notification failed:', result.error);
        }
      } catch (emailError) {
        console.warn('Email notification failed:', emailError);
      }

      return true;
    } catch (error) {
      console.error('Error creating support ticket:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    const newTicketId = generateTicketId();
    setTicketId(newTicketId);

    try {
      const success = await sendEmail(formData, newTicketId);
      
      if (success) {
        setSubmitted(true);
        toast({
          title: "Ticket Submitted Successfully",
          description: `Your ticket (${newTicketId}) has been sent to our support team.`,
        });
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      console.error('Error submitting ticket:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your ticket. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'support',
      priority: 'medium',
      subject: '',
      description: '',
      userEmail: profile?.email || '',
      userName: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim(),
      userPhone: '',
      appVersion: 'v1.0.0',
      deviceInfo: `${navigator.userAgent} - ${window.innerWidth}x${window.innerHeight}`,
      attachments: []
    });
    setSubmitted(false);
    setTicketId('');
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-800 mb-2">Ticket Submitted Successfully!</h2>
            <p className="text-green-700 mb-4">
              Your ticket has been sent to our support team. We'll get back to you soon.
            </p>
            <div className="bg-white p-4 rounded-lg border mb-4">
              <p className="text-sm text-gray-600 mb-2">Ticket ID:</p>
              <Badge variant="outline" className="text-lg font-mono">
                {ticketId}
              </Badge>
            </div>
            <div className="space-y-2 text-sm text-green-700">
              <p>• You'll receive a confirmation email shortly</p>
              <p>• Our team will respond within the expected timeframe</p>
              <p>• Keep this ticket ID for reference</p>
            </div>
            <div className="mt-6 space-x-3">
              <Button onClick={resetForm} variant="outline">
                Submit Another Ticket
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {formData.type === 'support' ? (
              <AlertTriangle className="w-6 h-6 text-red-600" />
            ) : (
              <Lightbulb className="w-6 h-6 text-blue-600" />
            )}
            <span>
              {formData.type === 'support' ? 'IT Support Request' : 'Feature Suggestion'}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Ticket Type Selection */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                variant={formData.type === 'support' ? 'default' : 'outline'}
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => handleInputChange('type', 'support')}
              >
                <AlertTriangle className="w-6 h-6" />
                <div className="text-center">
                  <div className="font-medium">IT Support</div>
                  <div className="text-xs opacity-70">Report issues or get help</div>
                </div>
              </Button>
              <Button
                type="button"
                variant={formData.type === 'suggestion' ? 'default' : 'outline'}
                className="h-auto p-4 flex flex-col items-center space-y-2"
                onClick={() => handleInputChange('type', 'suggestion')}
              >
                <Lightbulb className="w-6 h-6" />
                <div className="text-center">
                  <div className="font-medium">Feature Suggestion</div>
                  <div className="text-xs opacity-70">Suggest improvements</div>
                </div>
              </Button>
            </div>

            {/* Priority Selection */}
            <div className="space-y-2">
              <Label htmlFor="priority">Priority Level</Label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">🟢 Low - General inquiry</SelectItem>
                  <SelectItem value="medium">🟡 Medium - Minor issue</SelectItem>
                  <SelectItem value="high">🟠 High - Important issue</SelectItem>
                  <SelectItem value="urgent">🔴 Urgent - Critical issue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                placeholder={formData.type === 'support' ? "Brief description of your issue" : "Brief description of your suggestion"}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder={
                  formData.type === 'support' 
                    ? "Please provide detailed information about your issue, including steps to reproduce, error messages, and what you were trying to do when the problem occurred."
                    : "Please describe your feature suggestion in detail, including why it would be helpful and how it could improve the app."
                }
                rows={6}
                required
              />
            </div>

            {/* User Information */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Contact Information</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="userName">Name *</Label>
                  <Input
                    id="userName"
                    value={formData.userName}
                    onChange={(e) => handleInputChange('userName', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="userEmail">Email *</Label>
                  <Input
                    id="userEmail"
                    type="email"
                    value={formData.userEmail}
                    onChange={(e) => handleInputChange('userEmail', e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="userPhone">Phone (Optional)</Label>
                <Input
                  id="userPhone"
                  type="tel"
                  value={formData.userPhone}
                  onChange={(e) => handleInputChange('userPhone', e.target.value)}
                  placeholder="For urgent issues"
                />
              </div>
            </div>

            {/* System Information */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>System Information</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="appVersion">App Version</Label>
                  <Input
                    id="appVersion"
                    value={formData.appVersion}
                    onChange={(e) => handleInputChange('appVersion', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="deviceInfo">Device Info</Label>
                  <Input
                    id="deviceInfo"
                    value={formData.deviceInfo}
                    onChange={(e) => handleInputChange('deviceInfo', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                disabled={isSubmitting}
              >
                Reset
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="min-w-[120px]"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Ticket
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
