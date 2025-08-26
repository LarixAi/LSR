import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bot, 
  TrendingUp, 
  BarChart3, 
  FileText, 
  Settings,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Zap,
  Clock,
  Target,
  Activity,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { useAutonomousOperationsAI } from '@/hooks/useAutonomousOperationsAI';

export const AutonomousOperationsAIDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState('autonomous-decisions');
  const [results, setResults] = useState<any>(null);

  const {
    isLoading,
    error,
    makeAutonomousDecision,
    generatePredictiveAnalytics,
    createAutomatedWorkflow,
    optimizeFleet,
    monitorRealTime,
    executeWorkflow,
    clearError
  } = useAutonomousOperationsAI();

  // Sample data for demonstrations
  const sampleScenario = {
    type: 'route_optimization',
    vehicles: [
      { id: '1', status: 'available', location: 'London', capacity: 1000 },
      { id: '2', status: 'in_transit', location: 'Manchester', capacity: 800 }
    ],
    drivers: [
      { id: '1', status: 'available', location: 'London', experience: 'senior' },
      { id: '2', status: 'on_break', location: 'Manchester', experience: 'junior' }
    ],
    routes: [
      { id: '1', origin: 'London', destination: 'Birmingham', priority: 'high' },
      { id: '2', origin: 'Manchester', destination: 'Leeds', priority: 'medium' }
    ]
  };

  const sampleCurrentState = {
    vehicles: [
      { id: '1', assignment: 'Route A', efficiency: 0.75 },
      { id: '2', assignment: 'Route B', efficiency: 0.85 }
    ],
    drivers: [
      { id: '1', route: 'Route A', performance: 0.8 },
      { id: '2', route: 'Route B', performance: 0.9 }
    ]
  };

  const sampleWorkflow = {
    name: 'Maintenance Alert Workflow',
    description: 'Automatically schedule maintenance when vehicle health drops below threshold',
    triggers: [
      { condition: 'vehicle_health', threshold: 70, operator: 'lt' as const }
    ],
    actions: [
      { type: 'send_notification', parameters: { recipients: ['mechanic'] }, order: 1 },
      { type: 'schedule_maintenance', parameters: { priority: 'medium' }, order: 2 }
    ],
    conditions: [
      { type: 'approval_required' as const, parameters: { approver: 'fleet_manager' } }
    ]
  };

  const handleAutonomousDecision = async () => {
    const result = await makeAutonomousDecision(sampleScenario);
    if (result) {
      setResults(result);
    }
  };

  const handlePredictiveAnalytics = async () => {
    const result = await generatePredictiveAnalytics(
      { start: '2024-02-01', end: '2024-12-31' },
      ['fuel_efficiency', 'maintenance_costs', 'delivery_times']
    );
    if (result) {
      setResults(result);
    }
  };

  const handleCreateWorkflow = async () => {
    const result = await createAutomatedWorkflow(sampleWorkflow);
    if (result) {
      setResults(result);
    }
  };

  const handleFleetOptimization = async () => {
    const result = await optimizeFleet(sampleCurrentState, ['efficiency', 'cost_reduction']);
    if (result) {
      setResults(result);
    }
  };

  const handleRealTimeMonitoring = async () => {
    const result = await monitorRealTime({
      activeVehicles: 5,
      activeDrivers: 4,
      activeRoutes: 3,
      performance: {
        averageSpeed: 45,
        fuelEfficiency: 0.8,
        routeAdherence: 0.9,
        deliveryOnTime: 0.95
      }
    });
    if (result) {
      setResults(result);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'executed': return 'bg-green-100 text-green-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAlertTypeColor = (type: string) => {
    switch (type) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Autonomous Operations AI</h2>
          <p className="text-gray-600">AI-powered autonomous decision making and fleet optimization</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Bot className="w-4 h-4" />
          Autonomous Intelligence
        </Badge>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
              <Button variant="ghost" size="sm" onClick={clearError}>
                <XCircle className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="autonomous-decisions" className="flex items-center gap-2">
            <Bot className="w-4 h-4" />
            Decisions
          </TabsTrigger>
          <TabsTrigger value="predictive-analytics" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="automated-workflows" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Workflows
          </TabsTrigger>
          <TabsTrigger value="fleet-optimization" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Optimization
          </TabsTrigger>
          <TabsTrigger value="real-time-monitoring" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Monitoring
          </TabsTrigger>
        </TabsList>

        <TabsContent value="autonomous-decisions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                Autonomous Decision Making
              </CardTitle>
              <p className="text-gray-600">AI-powered autonomous decisions for fleet operations</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleAutonomousDecision} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Making Decision...
                  </>
                ) : (
                  <>
                    <Bot className="w-4 h-4 mr-2" />
                    Make Autonomous Decision
                  </>
                )}
              </Button>

              {results && activeTab === 'autonomous-decisions' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">Decision Type</span>
                          <Badge className={getPriorityColor(results.priority)}>
                            {results.type}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 mb-4">{results.reasoning}</div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Confidence:</span>
                            <span className="font-medium">{formatPercentage(results.confidence)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Status:</span>
                            <Badge className={getStatusColor(results.status)}>
                              {results.status}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <h4 className="font-medium mb-3">Impact Assessment</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Cost Impact:</span>
                            <span className="font-medium">£{results.impact?.cost || 0}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Time Impact:</span>
                            <span className="font-medium">{results.impact?.time || 0}h</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Efficiency:</span>
                            <span className="font-medium">{formatPercentage(results.impact?.efficiency || 0)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Risk Level:</span>
                            <span className="font-medium">{formatPercentage(results.impact?.risk || 0)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardContent className="pt-6">
                      <h4 className="font-medium mb-3">Recommended Action</h4>
                      <p className="text-gray-700">{results.action}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant={results.automated ? "default" : "secondary"}>
                          {results.automated ? 'Automated' : 'Manual'}
                        </Badge>
                        {results.requiresApproval && (
                          <Badge variant="outline">Requires Approval</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictive-analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Predictive Analytics
              </CardTitle>
              <p className="text-gray-600">AI-powered predictions and trend analysis</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handlePredictiveAnalytics} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Analytics...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Generate Predictive Analytics
                  </>
                )}
              </Button>

              {results && activeTab === 'predictive-analytics' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Predictions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {results.predictions?.map((prediction: any, index: number) => (
                            <div key={index} className="border rounded-lg p-3">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-medium">{prediction.metric}</span>
                                <Badge>{formatPercentage(prediction.confidence)}</Badge>
                              </div>
                              <div className="text-sm text-gray-600">
                                Current: {prediction.currentValue} → Predicted: {prediction.predictedValue}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Anomalies</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {results.anomalies?.map((anomaly: any, index: number) => (
                            <div key={index} className="border rounded-lg p-3">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-medium">{anomaly.metric}</span>
                                <Badge className={getPriorityColor(anomaly.severity)}>
                                  {anomaly.severity}
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-600 mb-2">
                                {anomaly.description}
                              </div>
                              <div className="text-xs text-blue-600">
                                {anomaly.suggestedAction}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automated-workflows" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Automated Workflows
              </CardTitle>
              <p className="text-gray-600">Create and manage automated operational workflows</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleCreateWorkflow} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Workflow...
                  </>
                ) : (
                  <>
                    <Settings className="w-4 h-4 mr-2" />
                    Create Automated Workflow
                  </>
                )}
              </Button>

              {results && activeTab === 'automated-workflows' && (
                <div className="space-y-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">{results.name}</h4>
                        <Badge className={results.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {results.status}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-4">{results.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h5 className="font-medium mb-2">Triggers</h5>
                          <div className="space-y-1">
                            {results.triggers?.map((trigger: any, index: number) => (
                              <div key={index} className="text-sm text-gray-600">
                                {trigger.condition} {trigger.operator} {trigger.threshold}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="font-medium mb-2">Actions</h5>
                          <div className="space-y-1">
                            {results.actions?.map((action: any, index: number) => (
                              <div key={index} className="text-sm text-gray-600">
                                {action.type} (Order: {action.order})
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="font-medium mb-2">Statistics</h5>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div>Executions: {results.executionCount}</div>
                            <div>Success Rate: {formatPercentage(results.successRate)}</div>
                            <div>Last Run: {results.lastExecuted ? new Date(results.lastExecuted).toLocaleDateString() : 'Never'}</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fleet-optimization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Fleet Optimization
              </CardTitle>
              <p className="text-gray-600">AI-powered fleet optimization and resource allocation</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleFleetOptimization} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Optimizing Fleet...
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4 mr-2" />
                    Optimize Fleet
                  </>
                )}
              </Button>

              {results && activeTab === 'fleet-optimization' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Vehicle Optimizations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {results.vehicles?.map((vehicle: any, index: number) => (
                            <div key={index} className="border rounded-lg p-3">
                              <div className="font-medium mb-2">Vehicle {vehicle.id}</div>
                              <div className="text-sm text-gray-600 mb-2">
                                {vehicle.currentAssignment} → {vehicle.recommendedAssignment}
                              </div>
                              <div className="text-xs text-blue-600">{vehicle.reason}</div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Overall Impact</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span>Efficiency Gain:</span>
                            <span className="font-medium text-green-600">{formatPercentage(results.overallImpact?.efficiencyGain || 0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Cost Reduction:</span>
                            <span className="font-medium text-green-600">£{results.overallImpact?.costReduction || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Time Savings:</span>
                            <span className="font-medium text-green-600">{results.overallImpact?.timeSavings || 0}h</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Risk Reduction:</span>
                            <span className="font-medium text-green-600">{formatPercentage(results.overallImpact?.riskReduction || 0)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="real-time-monitoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Real-Time Monitoring
              </CardTitle>
              <p className="text-gray-600">Live operational monitoring and AI insights</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleRealTimeMonitoring} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Monitoring...
                  </>
                ) : (
                  <>
                    <Activity className="w-4 h-4 mr-2" />
                    Monitor Real-Time
                  </>
                )}
              </Button>

              {results && activeTab === 'real-time-monitoring' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-blue-600">
                          {results.activeVehicles}
                        </div>
                        <p className="text-sm text-gray-600">Active Vehicles</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-green-600">
                          {results.activeDrivers}
                        </div>
                        <p className="text-sm text-gray-600">Active Drivers</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-purple-600">
                          {results.activeRoutes}
                        </div>
                        <p className="text-sm text-gray-600">Active Routes</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-orange-600">
                          {results.alerts?.length || 0}
                        </div>
                        <p className="text-sm text-gray-600">Active Alerts</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Performance Metrics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span>Average Speed:</span>
                            <span className="font-medium">{results.performance?.averageSpeed || 0} mph</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Fuel Efficiency:</span>
                            <span className="font-medium">{formatPercentage(results.performance?.fuelEfficiency || 0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Route Adherence:</span>
                            <span className="font-medium">{formatPercentage(results.performance?.routeAdherence || 0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>On-Time Delivery:</span>
                            <span className="font-medium">{formatPercentage(results.performance?.deliveryOnTime || 0)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>AI Insights</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {results.aiInsights?.map((insight: any, index: number) => (
                            <div key={index} className="border rounded-lg p-3">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-medium">{insight.type}</span>
                                <Badge>{formatPercentage(insight.confidence)}</Badge>
                              </div>
                              <div className="text-sm text-gray-600 mb-2">{insight.message}</div>
                              <div className="text-xs text-blue-600">{insight.action}</div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
