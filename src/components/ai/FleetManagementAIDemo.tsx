import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Truck, 
  Users, 
  Wrench, 
  Fuel, 
  Route, 
  Clock, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { useFleetManagementAI } from '@/hooks/useFleetManagementAI';
import { RouteOptimization, DriverAssignment, MaintenancePrediction } from '@/services/ai/agents/FleetManagementAgent';
import { useAuth } from '@/contexts/AuthContext';

export const FleetManagementAIDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState('routes');
  const [routeOptimization, setRouteOptimization] = useState<RouteOptimization | null>(null);
  const [driverAssignments, setDriverAssignments] = useState<DriverAssignment[] | null>(null);
  const [maintenancePrediction, setMaintenancePrediction] = useState<MaintenancePrediction | null>(null);
  const [fuelAnalysis, setFuelAnalysis] = useState<any | null>(null);
  const { user } = useAuth();

  const {
    isLoading,
    error,
    optimizeRoutes,
    assignDrivers,
    predictMaintenance,
    analyzeFuelEfficiency,
    clearError
  } = useFleetManagementAI();

  // Sample data for demonstration
  const sampleVehicles = [
    {
      id: 'v1',
      vehicle_name: 'LHR-001',
      status: 'active',
      capacity: '3.5 tons',
      fuel_level: 75,
      vehicle_type: 'Box Truck',
      current_mileage: 45000,
      last_service_date: '2024-11-15',
      age: 3,
      fuel_efficiency: 12.5,
      fuel_type: 'Diesel'
    },
    {
      id: 'v2',
      vehicle_name: 'LHR-002',
      status: 'active',
      capacity: '7.5 tons',
      fuel_level: 60,
      vehicle_type: 'Rigid Truck',
      current_mileage: 32000,
      last_service_date: '2024-10-20',
      age: 2,
      fuel_efficiency: 10.8,
      fuel_type: 'Diesel'
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
    }
  ];

  const sampleJobs = [
    {
      id: 'j1',
      job_name: 'Manchester Delivery',
      pickup_location: 'London Warehouse',
      delivery_location: 'Manchester City Centre',
      priority: 'high',
      deadline: '2025-01-16 14:00',
      estimated_duration: '4 hours'
    },
    {
      id: 'j2',
      job_name: 'Birmingham Collection',
      pickup_location: 'Birmingham Depot',
      delivery_location: 'London Distribution Centre',
      priority: 'normal',
      deadline: '2025-01-16 18:00',
      estimated_duration: '3 hours'
    }
  ];

  const handleRouteOptimization = async () => {
    const result = await optimizeRoutes(sampleVehicles, sampleJobs, {
      maxDrivingTime: 9,
      fuelEfficiency: true
    });
    setRouteOptimization(result);
  };

  const handleDriverAssignment = async () => {
    const result = await assignDrivers(sampleVehicles, sampleDrivers, sampleJobs);
    setDriverAssignments(result);
  };

  const handleMaintenancePrediction = async () => {
    const result = await predictMaintenance(sampleVehicles[0]);
    setMaintenancePrediction(result);
  };

  const handleFuelAnalysis = async () => {
    const result = await analyzeFuelEfficiency(sampleVehicles, {
      start: '2025-01-01',
      end: '2025-01-15'
    });
    setFuelAnalysis(result);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Fleet Management AI</h2>
          <p className="text-gray-600">AI-powered fleet optimization and management</p>
        </div>
        {error && (
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="text-red-600">{error}</span>
            <Button variant="outline" size="sm" onClick={clearError}>
              Clear
            </Button>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="routes" className="flex items-center gap-2">
            <Route className="w-4 h-4" />
            Route Optimization
          </TabsTrigger>
          <TabsTrigger value="drivers" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Driver Assignment
          </TabsTrigger>
          <TabsTrigger value="maintenance" className="flex items-center gap-2">
            <Wrench className="w-4 h-4" />
            Maintenance
          </TabsTrigger>
          <TabsTrigger value="fuel" className="flex items-center gap-2">
            <Fuel className="w-4 h-4" />
            Fuel Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="routes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Route className="w-5 h-5 text-blue-500" />
                Route Optimization
              </CardTitle>
              <p className="text-gray-600">
                AI-powered route optimization to minimize costs and maximize efficiency.
              </p>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleRouteOptimization} 
                disabled={isLoading}
                className="mb-4"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Optimizing Routes...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Optimize Routes
                  </>
                )}
              </Button>

              {routeOptimization && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-blue-600">
                          {routeOptimization.totalSavings.distance}km
                        </div>
                        <div className="text-sm text-gray-600">Distance Saved</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-green-600">
                          {routeOptimization.totalSavings.time}
                        </div>
                        <div className="text-sm text-gray-600">Time Saved</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-orange-600">
                          £{routeOptimization.totalSavings.fuel}
                        </div>
                        <div className="text-sm text-gray-600">Fuel Saved</div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold">Optimized Routes:</h4>
                    {routeOptimization.optimizedRoutes.map((route, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">Route {index + 1}</span>
                            <Badge variant="outline">
                              {route.estimatedDuration}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600">
                            Vehicle: {route.vehicleId} | Driver: {route.driverId}
                          </div>
                          <div className="text-sm text-gray-600">
                            Distance: {route.totalDistance}km | Fuel Cost: £{route.fuelCost}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold">Recommendations:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {routeOptimization.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-gray-700">{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drivers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-500" />
                Driver Assignment
              </CardTitle>
              <p className="text-gray-600">
                Intelligent driver assignment considering qualifications, compliance, and workload.
              </p>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleDriverAssignment} 
                disabled={isLoading}
                className="mb-4"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Assigning Drivers...
                  </>
                ) : (
                  <>
                    <Users className="w-4 h-4 mr-2" />
                    Assign Drivers
                  </>
                )}
              </Button>

              {driverAssignments && (
                <div className="space-y-4">
                  {driverAssignments.map((assignment, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">
                            {assignment.driverId} → {assignment.vehicleId}
                          </span>
                          <Badge 
                            variant={assignment.compliance.isCompliant ? "default" : "destructive"}
                          >
                            {assignment.compliance.isCompliant ? 'Compliant' : 'Non-compliant'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Route:</span> {assignment.routeId}
                          </div>
                          <div>
                            <span className="text-gray-600">Driving Time:</span> {assignment.compliance.drivingTime}h
                          </div>
                          <div>
                            <span className="text-gray-600">Rest Time:</span> {assignment.compliance.restTime}h
                          </div>
                          <div>
                            <span className="text-gray-600">Schedule:</span> {assignment.startTime} - {assignment.endTime}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-orange-500" />
                Maintenance Prediction
              </CardTitle>
              <p className="text-gray-600">
                Predictive maintenance using AI to prevent breakdowns and optimize costs.
              </p>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleMaintenancePrediction} 
                disabled={isLoading}
                className="mb-4"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Predicting Maintenance...
                  </>
                ) : (
                  <>
                    <Wrench className="w-4 h-4 mr-2" />
                    Predict Maintenance
                  </>
                )}
              </Button>

              {maintenancePrediction && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-orange-600">
                          {maintenancePrediction.maintenanceType}
                        </div>
                        <div className="text-sm text-gray-600">Maintenance Type</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-red-600">
                          £{maintenancePrediction.estimatedCost}
                        </div>
                        <div className="text-sm text-gray-600">Estimated Cost</div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-sm text-gray-600">Predicted Date:</span>
                      <div className="font-medium">{maintenancePrediction.predictedDate}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Confidence:</span>
                      <div className="font-medium">{(maintenancePrediction.confidence * 100).toFixed(1)}%</div>
                    </div>
                    <Badge className={getUrgencyColor(maintenancePrediction.urgency)}>
                      {maintenancePrediction.urgency.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold">Recommended Actions:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {maintenancePrediction.recommendedActions.map((action, index) => (
                        <li key={index} className="text-sm text-gray-700">{action}</li>
                      ))}
                    </ul>
                  </div>

                  {maintenancePrediction.partsNeeded.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold">Parts Needed:</h4>
                      <div className="flex flex-wrap gap-2">
                        {maintenancePrediction.partsNeeded.map((part, index) => (
                          <Badge key={index} variant="outline">{part}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fuel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Fuel className="w-5 h-5 text-purple-500" />
                Fuel Efficiency Analysis
              </CardTitle>
              <p className="text-gray-600">
                AI-powered fuel efficiency analysis and optimization recommendations.
              </p>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleFuelAnalysis} 
                disabled={isLoading}
                className="mb-4"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing Fuel Efficiency...
                  </>
                ) : (
                  <>
                    <Fuel className="w-4 h-4 mr-2" />
                    Analyze Fuel Efficiency
                  </>
                )}
              </Button>

              {fuelAnalysis && (
                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">Analysis Results:</h4>
                      <div className="text-sm text-gray-700 whitespace-pre-wrap">
                        {typeof fuelAnalysis === 'string' 
                          ? fuelAnalysis 
                          : JSON.stringify(fuelAnalysis, null, 2)
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



