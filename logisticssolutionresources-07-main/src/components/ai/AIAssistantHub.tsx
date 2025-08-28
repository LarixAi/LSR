
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Bot, Shield, Calendar, MessageSquare, Route, Wrench, TrendingUp } from 'lucide-react';
import ComplianceAssistant from './ComplianceAssistant';
import SmartSchedulingAI from './SmartSchedulingAI';
import CustomerServiceChatbot from './CustomerServiceChatbot';

const AIAssistantHub = () => {
  const [activeAssistants, setActiveAssistants] = useState({
    compliance: true,
    scheduling: true,
    chatbot: true,
    routes: false,
    maintenance: false,
    performance: false
  });

  const assistantFeatures = [
    {
      id: 'compliance',
      name: 'Compliance Assistant',
      icon: Shield,
      description: 'Monitors regulations and ensures documentation is up to date',
      status: 'active',
      alerts: 3
    },
    {
      id: 'scheduling',
      name: 'Smart Scheduling AI',
      icon: Calendar,
      description: 'Optimizes driver schedules and handles shift management',
      status: 'active',
      alerts: 2
    },
    {
      id: 'chatbot',
      name: 'Customer Service Bot',
      icon: MessageSquare,
      description: '24/7 support for parents, drivers, and administrators',
      status: 'active',
      alerts: 0
    },
    {
      id: 'routes',
      name: 'Route Optimization AI',
      icon: Route,
      description: 'Analyzes traffic patterns for optimal route planning',
      status: 'coming_soon',
      alerts: 0
    },
    {
      id: 'maintenance',
      name: 'Predictive Maintenance',
      icon: Wrench,
      description: 'Predicts vehicle maintenance needs before breakdowns',
      status: 'coming_soon',
      alerts: 0
    },
    {
      id: 'performance',
      name: 'Performance Coach',
      icon: TrendingUp,
      description: 'Provides personalized feedback on driving patterns',
      status: 'coming_soon',
      alerts: 0
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 text-white">Active</Badge>;
      case 'coming_soon':
        return <Badge variant="outline">Coming Soon</Badge>;
      default:
        return <Badge variant="secondary">Inactive</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-2">
            <Bot className="w-8 h-8 text-blue-600" />
            <span>AI Assistant Hub</span>
          </h1>
          <p className="text-gray-600 mt-2">
            Intelligent automation and assistance for your transport management
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {assistantFeatures.map((feature) => {
          const IconComponent = feature.icon;
          return (
            <Card key={feature.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <IconComponent className="w-6 h-6 text-blue-600" />
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(feature.status)}
                    {feature.alerts > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {feature.alerts}
                      </Badge>
                    )}
                  </div>
                </div>
                <CardTitle className="text-lg">{feature.name}</CardTitle>
                <CardDescription className="text-sm">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="compliance" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="compliance" className="flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>Compliance</span>
          </TabsTrigger>
          <TabsTrigger value="scheduling" className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Scheduling</span>
          </TabsTrigger>
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <Bot className="w-4 h-4" />
            <span>Overview</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="compliance" className="mt-6">
          <ComplianceAssistant />
        </TabsContent>

        <TabsContent value="scheduling" className="mt-6">
          <SmartSchedulingAI />
        </TabsContent>

        <TabsContent value="overview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Assistant Performance</CardTitle>
              <CardDescription>
                Overview of all AI assistants and their current status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">3</div>
                  <div className="text-sm text-gray-600">Active Assistants</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">5</div>
                  <div className="text-sm text-gray-600">Active Alerts</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">94%</div>
                  <div className="text-sm text-gray-600">Efficiency Score</div>
                </div>
              </div>
              
              <div className="pt-4">
                <h4 className="font-medium mb-2">Recent AI Actions</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span>Compliance alert generated for CDL renewal</span>
                    <span className="text-gray-500">2 min ago</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span>Schedule optimization suggested for Route A</span>
                    <span className="text-gray-500">15 min ago</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span>Customer query resolved automatically</span>
                    <span className="text-gray-500">32 min ago</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CustomerServiceChatbot />
    </div>
  );
};

export default AIAssistantHub;
