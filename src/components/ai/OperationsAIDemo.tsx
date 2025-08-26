import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Calendar, 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Users,
  Loader2,
  AlertCircle,
  Target,
  Activity,
  Gauge,
  Zap
} from 'lucide-react';
import { useOperationsAI } from '@/hooks/useOperationsAI';
import { JobSchedule, ResourceAllocation, PerformanceMetrics, OperationalAnalytics } from '@/services/ai/agents/OperationsAgent';

export const OperationsAIDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState('scheduling');
  const [jobSchedules, setJobSchedules] = useState<JobSchedule[] | null>(null);
  const [resourceAllocations, setResourceAllocations] = useState<ResourceAllocation[] | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [operationalAnalytics, setOperationalAnalytics] = useState<OperationalAnalytics | null>(null);
  const [demandPrediction, setDemandPrediction] = useState<any | null>(null);

  const {
    isLoading,
    error,
    optimizeJobSchedule,
    allocateResources,
    analyzePerformance,
    generateOperationalAnalytics,
    predictDemand,
    clearError
  } = useOperationsAI();

  // Sample data for demonstration
  const sampleJobs = [
    {
      id: 'j1',
      job_name: 'Manchester Delivery',
      pickup_location: 'London Warehouse',
      delivery_location: 'Manchester City Centre',
      priority: 'high',
      estimated_duration: '4 hours',
      deadline: '2025-01-16 14:00'
    },
    {
      id: 'j2',
      job_name: 'Birmingham Collection',
      pickup_location: 'Birmingham Depot',
      delivery_location: 'London Distribution Centre',
      priority: 'medium',
      estimated_duration: '3 hours',
      deadline: '2025-01-16 18:00'
    },
    {
      id: 'j3',
      job_name: 'Leeds Express',
      pickup_location: 'Leeds Hub',
      delivery_location: 'Sheffield Industrial Estate',
      priority: 'urgent',
      estimated_duration: '2 hours',
      deadline: '2025-01-16 12:00'
    }
  ];

  const sampleVehicles = [
    {
      id: 'v1',
      vehicle_name: 'LHR-001',
      status: 'active',
      capacity: '3.5 tons',
      vehicle_type: 'Box Truck'
    },
    {
      id: 'v2',
      vehicle_name: 'LHR-002',
      status: 'active',
      capacity: '7.5 tons',
      vehicle_type: 'Rigid Truck'
    },
    {
      id: 'v3',
      vehicle_name: 'LHR-003',
      status: 'maintenance',
      capacity: '12 tons',
      vehicle_type: 'Articulated Truck'
    }
  ];

  const sampleDrivers = [
    {
      id: 'd1',
      full_name: 'John Smith',
      status: 'available',
      license_type: 'C+E',
      experience_years: 8
    },
    {
      id: 'd2',
      full_name: 'Sarah Johnson',
      status: 'available',
      license_type: 'C',
      experience_years: 5
    },
    {
      id: 'd3',
      full_name: 'Mike Wilson',
      status: 'on_job',
      license_type: 'C+E',
      experience_years: 12
    }
  ];

  const sampleResources = [
    {
      id: 'r1',
      resource_name: 'LHR-001',
      resource_type: 'vehicle',
      status: 'available',
      capacity: '3.5 tons'
    },
    {
      id: 'r2',
      resource_name: 'John Smith',
      resource_type: 'driver',
      status: 'available',
      capacity: 'C+E License'
    },
    {
      id: 'r3',
      resource_name: 'Loading Bay 1',
      resource_type: 'facility',
      status: 'available',
      capacity: '2 vehicles'
    }
  ];

  const sampleHistoricalData = [
    { date: '2024-12-01', demand: 15, jobs: 12 },
    { date: '2024-12-02', demand: 18, jobs: 15 },
    { date: '2024-12-03', demand: 22, jobs: 18 },
    { date: '2024-12-04', demand: 20, jobs: 16 },
    { date: '2024-12-05', demand: 25, jobs: 20 }
  ];

  const handleJobScheduleOptimization = async () => {
    const result = await optimizeJobSchedule(sampleJobs, sampleVehicles, sampleDrivers, {
      maxWorkingHours: 9,
      vehicleCapacity: true
    });
    setJobSchedules(result);
  };

  const handleResourceAllocation = async () => {
    const result = await allocateResources(sampleResources, sampleJobs, {
      start: '2025-01-16 08:00',
      end: '2025-01-16 18:00'
    });
    setResourceAllocations(result);
  };

  const handlePerformanceAnalysis = async () => {
    const result = await analyzePerformance(
      { start: '2025-01-01', end: '2025-01-15' },
      sampleJobs,
      sampleVehicles,
      sampleDrivers
    );
    setPerformanceMetrics(result);
  };

  const handleOperationalAnalytics = async () => {
    const result = await generateOperationalAnalytics(
      'efficiency',
      { start: '2025-01-01', end: '2025-01-15' },
      sampleHistoricalData
    );
    setOperationalAnalytics(result);
  };

  const handleDemandPrediction = async () => {
    const result = await predictDemand(
      sampleHistoricalData,
      { start: '2025-01-20', end: '2025-01-25' },
      ['seasonal', 'market_conditions']
    );
    setDemandPrediction(result);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'delayed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Operations AI</h2>
          <p className="text-gray-600">AI-powered operational optimization and analytics</p>
        </div>
        {error && (
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-600">{error}</span>
            <Button variant="outline" size="sm" onClick={clearError}>
              Clear
            </Button>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="scheduling" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Scheduling
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Resources
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="prediction" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Prediction
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scheduling" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                Job Schedule Optimization
              </CardTitle>
              <p className="text-gray-600">
                AI-powered job scheduling optimization for maximum efficiency and cost savings.
              </p>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleJobScheduleOptimization} 
                disabled={isLoading}
                className="mb-4"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Optimizing Schedule...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Optimize Schedule
                  </>
                )}
              </Button>

              {jobSchedules && (
                <div className="space-y-4">
                  {jobSchedules.map((schedule, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <span className="font-medium">Job: {schedule.jobId}</span>
                            <span className="mx-2">•</span>
                            <span>Vehicle: {schedule.vehicleId}</span>
                            <span className="mx-2">•</span>
                            <span>Driver: {schedule.driverId}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getPriorityColor(schedule.priority)}>
                              {schedule.priority.toUpperCase()}
                            </Badge>
                            <Badge className={getStatusColor(schedule.status)}>
                              {schedule.status.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 mb-3">
                          <div>
                            <span className="text-sm text-gray-600">Start:</span>
                            <div className="font-medium text-sm">{schedule.startTime}</div>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">End:</span>
                            <div className="font-medium text-sm">{schedule.endTime}</div>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Duration:</span>
                            <div className="font-medium text-sm">{schedule.estimatedDuration}</div>
                          </div>
                        </div>

                        {schedule.delays.length > 0 && (
                          <div className="mb-3">
                            <h4 className="font-semibold text-sm mb-2">Delays:</h4>
                            {schedule.delays.map((delay, delayIndex) => (
                              <div key={delayIndex} className="p-2 bg-red-50 rounded text-sm">
                                <div className="flex items-center justify-between">
                                  <span>{delay.reason}</span>
                                  <Badge className="bg-red-100 text-red-800">
                                    {delay.duration}min
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="bg-blue-50 p-3 rounded">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">Optimization Results:</span>
                            <Badge variant="outline">
                              {schedule.optimization.efficiency}% Efficiency
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-700">
                            Cost Savings: £{schedule.optimization.costSavings}
                          </div>
                          {schedule.optimization.recommendations.length > 0 && (
                            <div className="mt-2">
                              <span className="text-sm font-medium">Recommendations:</span>
                              <ul className="list-disc list-inside text-sm text-gray-700">
                                {schedule.optimization.recommendations.map((rec, recIndex) => (
                                  <li key={recIndex}>{rec}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-500" />
                Resource Allocation
              </CardTitle>
              <p className="text-gray-600">
                Intelligent resource allocation optimization for vehicles, drivers, and facilities.
              </p>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleResourceAllocation} 
                disabled={isLoading}
                className="mb-4"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Allocating Resources...
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4 mr-2" />
                    Allocate Resources
                  </>
                )}
              </Button>

              {resourceAllocations && (
                <div className="space-y-4">
                  {resourceAllocations.map((allocation, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <span className="font-medium">{allocation.resourceId}</span>
                            <span className="mx-2">•</span>
                            <span className="capitalize">{allocation.resourceType}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {allocation.totalUtilization}% Utilized
                            </Badge>
                            <Badge className={allocation.availability.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {allocation.availability.available ? 'Available' : 'Unavailable'}
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm">Allocations:</h4>
                          {allocation.allocation.map((alloc, allocIndex) => (
                            <div key={allocIndex} className="p-2 bg-gray-50 rounded">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium">Job: {alloc.jobId}</span>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {alloc.utilization}% Util
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {alloc.efficiency}% Eff
                                  </Badge>
                                </div>
                              </div>
                              <div className="text-xs text-gray-600">
                                {alloc.startTime} - {alloc.endTime}
                              </div>
                            </div>
                          ))}
                        </div>

                        {allocation.availability.conflicts.length > 0 && (
                          <div className="mt-3">
                            <h4 className="font-semibold text-sm mb-2">Conflicts:</h4>
                            <ul className="list-disc list-inside text-sm text-red-600">
                              {allocation.availability.conflicts.map((conflict, conflictIndex) => (
                                <li key={conflictIndex}>{conflict}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {allocation.recommendations.length > 0 && (
                          <div className="mt-3">
                            <h4 className="font-semibold text-sm mb-2">Recommendations:</h4>
                            <ul className="list-disc list-inside text-sm text-gray-700">
                              {allocation.recommendations.map((rec, recIndex) => (
                                <li key={recIndex}>{rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-500" />
                Performance Analytics
              </CardTitle>
              <p className="text-gray-600">
                Comprehensive performance metrics and AI-powered insights for operational optimization.
              </p>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handlePerformanceAnalysis} 
                disabled={isLoading}
                className="mb-4"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing Performance...
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analyze Performance
                  </>
                )}
              </Button>

              {performanceMetrics && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-blue-600">
                          {performanceMetrics.fleetMetrics.completedJobs}/{performanceMetrics.fleetMetrics.totalJobs}
                        </div>
                        <div className="text-sm text-gray-600">Jobs Completed</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-green-600">
                          {performanceMetrics.fleetMetrics.onTimeDeliveries}
                        </div>
                        <div className="text-sm text-gray-600">On-Time Deliveries</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-orange-600">
                          £{performanceMetrics.fleetMetrics.costPerMile}
                        </div>
                        <div className="text-sm text-gray-600">Cost per Mile</div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-3">Driver Metrics</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Active Drivers:</span>
                            <span className="font-medium">{performanceMetrics.driverMetrics.activeDrivers}/{performanceMetrics.driverMetrics.totalDrivers}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Average Hours:</span>
                            <span className="font-medium">{performanceMetrics.driverMetrics.averageHours}h</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Compliance Rate:</span>
                            <span className="font-medium">{performanceMetrics.driverMetrics.complianceRate}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Safety Score:</span>
                            <span className="font-medium">{performanceMetrics.driverMetrics.safetyScore}/100</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-3">Vehicle Metrics</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Active Vehicles:</span>
                            <span className="font-medium">{performanceMetrics.vehicleMetrics.activeVehicles}/{performanceMetrics.vehicleMetrics.totalVehicles}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Average Utilization:</span>
                            <span className="font-medium">{performanceMetrics.vehicleMetrics.averageUtilization}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Maintenance Cost:</span>
                            <span className="font-medium">£{performanceMetrics.vehicleMetrics.maintenanceCost}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Reliability Score:</span>
                            <span className="font-medium">{performanceMetrics.vehicleMetrics.reliabilityScore}/100</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-3">AI Insights</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium text-sm mb-2">Trends:</h5>
                          <ul className="list-disc list-inside text-sm text-gray-700">
                            {performanceMetrics.aiInsights.trends.map((trend, index) => (
                              <li key={index}>{trend}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-medium text-sm mb-2">Recommendations:</h5>
                          <ul className="list-disc list-inside text-sm text-gray-700">
                            {performanceMetrics.aiInsights.recommendations.map((rec, index) => (
                              <li key={index}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-500" />
                Operational Analytics
              </CardTitle>
              <p className="text-gray-600">
                Advanced analytics with predictive insights and optimization recommendations.
              </p>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleOperationalAnalytics} 
                disabled={isLoading}
                className="mb-4"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Analytics...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Generate Analytics
                  </>
                )}
              </Button>

              {operationalAnalytics && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-3">Trends</h4>
                        <div className="space-y-2">
                          {operationalAnalytics.trends.map((trend, index) => (
                            <div key={index} className="p-2 bg-gray-50 rounded">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium">{trend.direction}</span>
                                <Badge variant="outline">
                                  {trend.confidence}% confidence
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-700">{trend.description}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-3">Predictions</h4>
                        <div className="space-y-2">
                          {operationalAnalytics.predictions.map((prediction, index) => (
                            <div key={index} className="p-2 bg-blue-50 rounded">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium">{prediction.metric}</span>
                                <Badge variant="outline">
                                  {prediction.confidence}% confidence
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-700">
                                Predicted: {prediction.predictedValue} ({prediction.timeframe})
                              </p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-3">Recommendations</h4>
                      <div className="space-y-3">
                        {operationalAnalytics.recommendations.map((rec, index) => (
                          <div key={index} className="p-3 bg-gray-50 rounded">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">{rec.category}</span>
                              <Badge className={rec.priority === 'high' ? 'bg-red-100 text-red-800' : rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>
                                {rec.priority.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-700 mb-2">{rec.description}</p>
                            <p className="text-sm text-blue-600 mb-2">Expected Impact: {rec.expectedImpact}</p>
                            <div>
                              <span className="text-sm font-medium">Implementation:</span>
                              <ul className="list-disc list-inside text-sm text-gray-700">
                                {rec.implementation.map((step, stepIndex) => (
                                  <li key={stepIndex}>{step}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prediction" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-red-500" />
                Demand Prediction
              </CardTitle>
              <p className="text-gray-600">
                AI-powered demand forecasting for better resource planning and capacity management.
              </p>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleDemandPrediction} 
                disabled={isLoading}
                className="mb-4"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Predicting Demand...
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4 mr-2" />
                    Predict Demand
                  </>
                )}
              </Button>

              {demandPrediction && (
                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">Demand Prediction Analysis:</h4>
                      <div className="text-sm text-gray-700 whitespace-pre-wrap">
                        {typeof demandPrediction === 'string' 
                          ? demandPrediction 
                          : JSON.stringify(demandPrediction, null, 2)
                        }
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};


