import React, { useState, useEffect } from 'react';
import { AIChatInterface } from '@/components/ai/AIChatInterface';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bot, 
  Truck, 
  Users, 
  Shield, 
  TrendingUp, 
  MessageSquare,
  Zap,
  Clock,
  CheckCircle,
  AlertTriangle,
  Search,
  Settings,
  DollarSign,
  Activity
} from 'lucide-react';
import { aiService } from '@/services/ai/AIService';
import { useAuth } from '@/contexts/AuthContext';
import { FleetManagementAIDemo } from '@/components/ai/FleetManagementAIDemo';
import { ComplianceSafetyAIDemo } from '@/components/ai/ComplianceSafetyAIDemo';
import { OperationsAIDemo } from '@/components/ai/OperationsAIDemo';
import { EnterpriseSearchAIDemo } from '@/components/ai/EnterpriseSearchAIDemo';
import { FinancialAIDemo } from '@/components/ai/FinancialAIDemo';
import { AutonomousOperationsAIDemo } from '@/components/ai/AutonomousOperationsAIDemo';

const AIPage: React.FC = () => {
  const [context, setContext] = useState<any>(null);
  const [isLoadingContext, setIsLoadingContext] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadContext = async () => {
      if (user?.id) {
        try {
          const contextData = await aiService.getContext();
          setContext(contextData);
        } catch (error) {
          console.error('Error loading context:', error);
        } finally {
          setIsLoadingContext(false);
        }
      }
    };

    loadContext();
  }, [user?.id]);

  const quickActions = [
    {
      title: 'Route Optimization',
      description: 'Optimize delivery routes for maximum efficiency',
      icon: Truck,
      prompt: 'Help me optimize my delivery routes for today',
      color: 'bg-blue-500',
    },
    {
      title: 'Driver Scheduling',
      description: 'Schedule drivers and assign vehicles',
      icon: Users,
      prompt: 'Help me schedule drivers for this week',
      color: 'bg-green-500',
    },
    {
      title: 'Maintenance Check',
      description: 'Check vehicle maintenance status',
      icon: Shield,
      prompt: 'Show me vehicles that need maintenance',
      color: 'bg-orange-500',
    },
    {
      title: 'Compliance Report',
      description: 'Generate compliance and safety reports',
      icon: CheckCircle,
      prompt: 'Generate a compliance report for my fleet',
      color: 'bg-purple-500',
    },
    {
      title: 'Cost Analysis',
      description: 'Analyze operational costs and efficiency',
      icon: TrendingUp,
      prompt: 'Analyze my fleet costs and suggest optimizations',
      color: 'bg-red-500',
    },
    {
      title: 'Customer Service',
      description: 'Handle customer inquiries and updates',
      icon: MessageSquare,
      prompt: 'Help me respond to customer inquiries',
      color: 'bg-indigo-500',
    },
  ];

  const renderContextCard = () => {
    if (isLoadingContext) {
      return (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <span>Loading fleet context...</span>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (!context) {
      return null;
    }

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-500" />
            Fleet Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{context.fleet?.totalVehicles || 0}</div>
              <div className="text-sm text-gray-600">Total Vehicles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{context.fleet?.activeVehicles || 0}</div>
              <div className="text-sm text-gray-600">Active Vehicles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{context.fleet?.maintenanceDue || 0}</div>
              <div className="text-sm text-gray-600">Maintenance Due</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{context.drivers?.length || 0}</div>
              <div className="text-sm text-gray-600">Drivers</div>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className={`w-4 h-4 ${context.compliance?.dvsaCompliant ? 'text-green-500' : 'text-red-500'}`} />
              <span className="text-sm">DVSA Compliance: {context.compliance?.dvsaCompliant ? 'Compliant' : 'Non-compliant'}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className={`w-4 h-4 ${context.compliance?.licensesValid ? 'text-green-500' : 'text-red-500'}`} />
              <span className="text-sm">Licenses: {context.compliance?.licensesValid ? 'Valid' : 'Expired'}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className={`w-4 h-4 ${context.compliance?.inspectionsUpToDate ? 'text-green-500' : 'text-red-500'}`} />
              <span className="text-sm">Inspections: {context.compliance?.inspectionsUpToDate ? 'Up to date' : 'Overdue'}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Assistant</h1>
        <p className="text-gray-600">
          Your intelligent TMS assistant powered by AI. Get instant help with fleet management, 
          route optimization, compliance, and more.
        </p>
      </div>

      <Tabs defaultValue="chat" className="space-y-6">
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="fleet-ai" className="flex items-center gap-2">
            <Truck className="w-4 h-4" />
            Fleet AI
          </TabsTrigger>
          <TabsTrigger value="compliance-ai" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Compliance
          </TabsTrigger>
          <TabsTrigger value="operations-ai" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Operations
          </TabsTrigger>
          <TabsTrigger value="search-ai" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Search
          </TabsTrigger>
          <TabsTrigger value="financial-ai" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Financial
          </TabsTrigger>
          <TabsTrigger value="autonomous-ai" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Autonomous
          </TabsTrigger>
          <TabsTrigger value="quick-actions" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Quick Actions
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-6">
          {renderContextCard()}
          <AIChatInterface />
        </TabsContent>

        <TabsContent value="fleet-ai" className="space-y-6">
          <FleetManagementAIDemo />
        </TabsContent>

        <TabsContent value="compliance-ai" className="space-y-6">
          <ComplianceSafetyAIDemo />
        </TabsContent>

        <TabsContent value="operations-ai" className="space-y-6">
          <OperationsAIDemo />
        </TabsContent>

        <TabsContent value="search-ai" className="space-y-6">
          <EnterpriseSearchAIDemo />
        </TabsContent>

        <TabsContent value="financial-ai" className="space-y-6">
          <FinancialAIDemo />
        </TabsContent>

        <TabsContent value="autonomous-ai" className="space-y-6">
          <AutonomousOperationsAIDemo />
        </TabsContent>

        <TabsContent value="quick-actions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-500" />
                Quick Actions
              </CardTitle>
              <p className="text-gray-600">
                Click any action below to quickly get help with common tasks.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quickActions.map((action, index) => (
                  <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${action.color}`}>
                          <action.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                          <p className="text-sm text-gray-600 mb-3">{action.description}</p>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="w-full"
                            onClick={() => {
                              // TODO: Implement quick action functionality
                              console.log('Quick action:', action.prompt);
                            }}
                          >
                            Use This Action
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                AI Insights
              </CardTitle>
              <p className="text-gray-600">
                AI-powered insights and recommendations for your fleet operations.
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Recent Activity</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>Last route optimization: 2 hours ago</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>5 vehicles inspected today</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                      <span>2 maintenance tasks due this week</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">AI Recommendations</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-1">Route Optimization</h4>
                      <p className="text-sm text-blue-700">
                        Consider consolidating deliveries in the Manchester area to reduce fuel costs by 15%.
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-1">Maintenance Alert</h4>
                      <p className="text-sm text-green-700">
                        Schedule maintenance for Vehicle #LHR-001 before the end of the month.
                      </p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <h4 className="font-medium text-purple-900 mb-1">Compliance Update</h4>
                      <p className="text-sm text-purple-700">
                        All driver licenses are valid. Next batch expires in 3 months.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIPage;
