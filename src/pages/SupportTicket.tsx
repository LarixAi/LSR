import React, { useState } from 'react';
import StandardPageLayout, { NavigationTab, ActionButton, MetricCard } from '@/components/layout/StandardPageLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  HelpCircle, 
  MessageCircle, 
  Phone, 
  Mail, 
  FileText, 
  Video, 
  BookOpen, 
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Settings,
  Truck,
  Shield,
  Fuel,
  Calendar,
  Plus,
  Ticket
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import SupportTicketForm from '@/components/support/SupportTicketForm';

export default function SupportTicket() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('help');

  const faqData = [
    {
      category: "General",
      items: [
        {
          question: "How do I update my profile information?",
          answer: "Go to Settings > Profile to update your personal information, contact details, and preferences."
        },
        {
          question: "How do I change my password?",
          answer: "Navigate to Settings > Security to change your password. You'll need to enter your current password for verification."
        },
        {
          question: "What should I do if I forget my password?",
          answer: "Use the 'Forgot Password' option on the login screen. You'll receive a reset link via email."
        }
      ]
    },
    {
      category: "Vehicle Checks",
      items: [
        {
          question: "How do I complete a vehicle check?",
          answer: "Tap the Vehicle Check icon in the navigation bar, then follow the step-by-step checklist. Make sure to complete all required items."
        },
        {
          question: "What if I find a defect during my vehicle check?",
          answer: "Report any defects immediately through the app. The system will automatically notify the maintenance team."
        },
        {
          question: "Can I save a vehicle check for later?",
          answer: "Yes, you can save your progress and complete the check later. Your data will be stored locally."
        }
      ]
    },
    {
      category: "Fuel System",
      items: [
        {
          question: "How do I record a fuel purchase?",
          answer: "Go to Fuel System > Record Purchase. Enter the fuel amount, cost, and upload a photo of the receipt."
        },
        {
          question: "What if I lose my fuel receipt?",
          answer: "Contact your supervisor immediately. You may need to provide alternative documentation."
        },
        {
          question: "How do I view my fuel history?",
          answer: "Navigate to Fuel System > History to view all your recorded fuel purchases and expenses."
        }
      ]
    },
    {
      category: "Time Management",
      items: [
        {
          question: "How do I clock in and out?",
          answer: "Use the Time Management feature to clock in when you start work and clock out when you finish."
        },
        {
          question: "What if I forget to clock out?",
          answer: "Contact your supervisor to manually adjust your time records. Always try to clock out at the end of your shift."
        },
        {
          question: "How do I view my timesheet?",
          answer: "Go to Time Management > Timesheet to view your work hours, breaks, and total time worked."
        }
      ]
    },
    {
      category: "Compliance",
      items: [
        {
          question: "How do I check my license status?",
          answer: "Go to Compliance to view your current license status, expiry dates, and any required renewals."
        },
        {
          question: "What training do I need to complete?",
          answer: "Check the Training section in Compliance to see required courses and your completion status."
        },
        {
          question: "How do I upload documents?",
          answer: "Navigate to Documents to upload and manage your licenses, certificates, and other required documents."
        }
      ]
    }
  ];

  const contactMethods = [
    {
      title: "Emergency Support",
      description: "For urgent issues affecting safety or operations",
      icon: AlertTriangle,
      contact: "+1 (555) 123-4567",
      response: "Immediate response",
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      title: "IT Support",
      description: "For app issues and technical problems",
      icon: Settings,
      contact: "transport@logisticssolutionresources.com",
      response: "Within 2 hours",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "General Inquiries",
      description: "For general questions and information",
      icon: MessageCircle,
      contact: "support@lsr.com",
      response: "Within 24 hours",
      color: "text-green-600",
      bgColor: "bg-green-50"
    }
  ];

  const quickActions = [
    {
      title: "Submit Support Ticket",
      description: "Report an issue or get help",
      icon: AlertTriangle,
      action: () => setActiveTab('ticket'),
      color: "bg-red-500 hover:bg-red-600"
    },
    {
      title: "Feature Suggestion",
      description: "Suggest improvements",
      icon: Plus,
      action: () => {
        setActiveTab('ticket');
        // Navigate with query parameter for suggestion type
        navigate('/support?type=suggestion');
      },
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      title: "View Manual",
      description: "Download user guide",
      icon: BookOpen,
      action: () => window.open('/manual.pdf', '_blank'),
      color: "bg-purple-500 hover:bg-purple-600"
    },
    {
      title: "Training Videos",
      description: "Watch tutorial videos",
      icon: Video,
      action: () => navigate('/training-videos'),
      color: "bg-green-500 hover:bg-green-600"
    }
  ];

  const tabs: NavigationTab[] = [
    { value: 'help', label: 'Help Center' },
    { value: 'ticket', label: 'Submit Ticket' },
  ];

  const actions: ActionButton[] = [
    { label: 'Help Center', onClick: () => setActiveTab('help'), icon: <HelpCircle className="w-4 h-4" />, variant: 'outline', size: 'sm' },
  ];

  const metrics: MetricCard[] = [
    { title: 'Status', value: 'Online', icon: <CheckCircle className="w-4 h-4 text-green-600" />, bgColor: 'bg-green-50', color: 'text-green-600' },
  ];

  return (
    <StandardPageLayout
      title="Help & Support"
      description="Get assistance with the LSR mobile app"
      secondaryActions={actions}
      metricsCards={metrics}
      navigationTabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

        <TabsContent value="help" className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Quick Actions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-center space-y-2"
                      onClick={action.action}
                    >
                      <Icon className="w-6 h-6" />
                      <div className="text-center">
                        <div className="font-medium text-sm">{action.title}</div>
                        <div className="text-xs text-muted-foreground">{action.description}</div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5" />
                <span>Contact Support</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contactMethods.map((method, index) => {
                  const Icon = method.icon;
                  return (
                    <div key={index} className={`p-4 rounded-lg border ${method.bgColor}`}>
                      <div className="flex items-start space-x-3">
                        <Icon className={`w-5 h-5 mt-0.5 ${method.color}`} />
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm">{method.title}</h3>
                          <p className="text-xs text-muted-foreground mb-2">{method.description}</p>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="font-medium">{method.contact}</span>
                            <Badge variant="outline" className="text-xs">
                              {method.response}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Frequently Asked Questions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqData.map((category, categoryIndex) => (
                  <div key={categoryIndex} className="mb-6">
                    <h3 className="font-semibold text-lg mb-3 text-gray-800">{category.category}</h3>
                    {category.items.map((item, itemIndex) => (
                      <AccordionItem key={`${categoryIndex}-${itemIndex}`} value={`${categoryIndex}-${itemIndex}`}>
                        <AccordionTrigger className="text-left">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </div>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* User Info */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Your Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Name:</span>
                  <span className="text-sm font-medium">
                    {profile?.first_name} {profile?.last_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Role:</span>
                  <Badge variant="secondary" className="capitalize">
                    {profile?.role}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">App Version:</span>
                  <span className="text-sm font-medium">v1.0.0</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ticket">
          <SupportTicketForm />
        </TabsContent>
      </Tabs>
    </StandardPageLayout>
  );
}