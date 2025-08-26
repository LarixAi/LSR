import { aiService } from '../AIService';
import { TMSContext } from '../AIService';

export interface RouteOptimization {
  optimizedRoutes: Array<{
    routeId: string;
    vehicleId: string;
    driverId: string;
    stops: Array<{
      location: string;
      estimatedTime: string;
      type: 'pickup' | 'delivery' | 'fuel' | 'break';
    }>;
    totalDistance: number;
    estimatedDuration: string;
    fuelCost: number;
  }>;
  totalSavings: {
    distance: number;
    time: string;
    fuel: number;
  };
  recommendations: string[];
}

export interface DriverAssignment {
  driverId: string;
  vehicleId: string;
  routeId: string;
  startTime: string;
  endTime: string;
  breaks: Array<{
    startTime: string;
    endTime: string;
    duration: number;
  }>;
  compliance: {
    drivingTime: number;
    restTime: number;
    isCompliant: boolean;
  };
}

export interface MaintenancePrediction {
  vehicleId: string;
  maintenanceType: string;
  predictedDate: string;
  confidence: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  estimatedCost: number;
  recommendedActions: string[];
  partsNeeded: string[];
}

export class FleetManagementAgent {
  private context: TMSContext | null = null;

  async setContext(context: TMSContext): Promise<void> {
    this.context = context;
  }

  async optimizeRoutes(
    vehicles: any[],
    jobs: any[],
    constraints?: {
      maxDrivingTime?: number;
      fuelEfficiency?: boolean;
      driverPreferences?: any;
    }
  ): Promise<RouteOptimization> {
    if (!this.context) {
      throw new Error('Context not set. Call setContext() first.');
    }

    const prompt = this.buildRouteOptimizationPrompt(vehicles, jobs, constraints);
    
    try {
      const response = await aiService.chat(prompt, this.context.user.id, 'gpt4');
      return this.parseRouteOptimizationResponse(response);
    } catch (error) {
      console.error('Route optimization error:', error);
      throw new Error('Failed to optimize routes');
    }
  }

  async assignDrivers(
    vehicles: any[],
    drivers: any[],
    jobs: any[]
  ): Promise<DriverAssignment[]> {
    if (!this.context) {
      throw new Error('Context not set. Call setContext() first.');
    }

    const prompt = this.buildDriverAssignmentPrompt(vehicles, drivers, jobs);
    
    try {
      const response = await aiService.chat(prompt, this.context.user.id, 'gpt4');
      return this.parseDriverAssignmentResponse(response);
    } catch (error) {
      console.error('Driver assignment error:', error);
      throw new Error('Failed to assign drivers');
    }
  }

  async predictMaintenance(vehicle: any): Promise<MaintenancePrediction> {
    if (!this.context) {
      throw new Error('Context not set. Call setContext() first.');
    }

    const prompt = this.buildMaintenancePredictionPrompt(vehicle);
    
    try {
      const response = await aiService.chat(prompt, this.context.user.id, 'gpt4');
      return this.parseMaintenancePredictionResponse(response);
    } catch (error) {
      console.error('Maintenance prediction error:', error);
      throw new Error('Failed to predict maintenance');
    }
  }

  async analyzeFuelEfficiency(vehicles: any[], timeRange: { start: string; end: string }): Promise<any> {
    if (!this.context) {
      throw new Error('Context not set. Call setContext() first.');
    }

    const prompt = this.buildFuelEfficiencyPrompt(vehicles, timeRange);
    
    try {
      const response = await aiService.chat(prompt, this.context.user.id, 'gpt4');
      return this.parseFuelEfficiencyResponse(response);
    } catch (error) {
      console.error('Fuel efficiency analysis error:', error);
      throw new Error('Failed to analyze fuel efficiency');
    }
  }

  private buildRouteOptimizationPrompt(
    vehicles: any[],
    jobs: any[],
    constraints?: any
  ): string {
    return `As a Fleet Management AI Agent, optimize delivery routes for the following scenario:

FLEET CONTEXT:
- Total Vehicles: ${vehicles.length}
- Available Vehicles: ${vehicles.filter(v => v.status === 'active').length}
- Total Jobs: ${jobs.length}
- Current Fleet Status: ${JSON.stringify(this.context?.fleet, null, 2)}

VEHICLES:
${vehicles.map(v => `- ${v.vehicle_name} (${v.id}): ${v.status}, Capacity: ${v.capacity || 'N/A'}, Fuel: ${v.fuel_level || 'N/A'}%`).join('\n')}

JOBS:
${jobs.map(j => `- ${j.job_name || j.id}: ${j.pickup_location} → ${j.delivery_location}, Priority: ${j.priority || 'normal'}, Deadline: ${j.deadline || 'N/A'}`).join('\n')}

CONSTRAINTS:
${constraints ? JSON.stringify(constraints, null, 2) : 'None specified'}

Please provide an optimized route plan that:
1. Minimizes total distance and fuel consumption
2. Ensures timely delivery within deadlines
3. Balances workload across available vehicles
4. Considers driver working hours and rest periods
5. Optimizes for fuel efficiency

Return the response in JSON format with the following structure:
{
  "optimizedRoutes": [
    {
      "routeId": "string",
      "vehicleId": "string", 
      "driverId": "string",
      "stops": [
        {
          "location": "string",
          "estimatedTime": "string",
          "type": "pickup|delivery|fuel|break"
        }
      ],
      "totalDistance": number,
      "estimatedDuration": "string",
      "fuelCost": number
    }
  ],
  "totalSavings": {
    "distance": number,
    "time": "string", 
    "fuel": number
  },
  "recommendations": ["string"]
}`;
  }

  private buildDriverAssignmentPrompt(vehicles: any[], drivers: any[], jobs: any[]): string {
    return `As a Fleet Management AI Agent, assign drivers to vehicles and routes optimally:

DRIVERS:
${drivers.map(d => `- ${d.full_name} (${d.id}): ${d.status}, License: ${d.license_type || 'N/A'}, Experience: ${d.experience_years || 'N/A'} years`).join('\n')}

VEHICLES:
${vehicles.map(v => `- ${v.vehicle_name} (${v.id}): ${v.vehicle_type || 'N/A'}, Requires License: ${v.required_license || 'N/A'}`).join('\n')}

JOBS:
${jobs.map(j => `- ${j.job_name || j.id}: ${j.pickup_location} → ${j.delivery_location}, Duration: ${j.estimated_duration || 'N/A'}`).join('\n')}

COMPLIANCE REQUIREMENTS:
- Maximum driving time: 9 hours per day
- Required rest breaks: 45 minutes after 4.5 hours
- Weekly rest: 45 hours minimum

Please assign drivers considering:
1. Driver qualifications and vehicle requirements
2. Working time regulations compliance
3. Driver experience and performance
4. Current workload and availability
5. Route complexity and driver skills

Return the response in JSON format with the following structure:
{
  "assignments": [
    {
      "driverId": "string",
      "vehicleId": "string",
      "routeId": "string", 
      "startTime": "string",
      "endTime": "string",
      "breaks": [
        {
          "startTime": "string",
          "endTime": "string",
          "duration": number
        }
      ],
      "compliance": {
        "drivingTime": number,
        "restTime": number,
        "isCompliant": boolean
      }
    }
  ]
}`;
  }

  private buildMaintenancePredictionPrompt(vehicle: any): string {
    return `As a Fleet Management AI Agent, predict maintenance needs for this vehicle:

VEHICLE DETAILS:
- Name: ${vehicle.vehicle_name}
- Type: ${vehicle.vehicle_type || 'N/A'}
- Mileage: ${vehicle.current_mileage || 'N/A'}
- Last Service: ${vehicle.last_service_date || 'N/A'}
- Age: ${vehicle.age || 'N/A'} years
- Usage Pattern: ${vehicle.usage_pattern || 'N/A'}

MAINTENANCE HISTORY:
${vehicle.maintenance_history ? JSON.stringify(vehicle.maintenance_history, null, 2) : 'No history available'}

Please predict:
1. Next maintenance due date
2. Type of maintenance required
3. Estimated cost
4. Urgency level
5. Recommended actions
6. Parts that may need replacement

Consider factors like:
- Vehicle age and mileage
- Usage patterns
- Manufacturer recommendations
- Historical maintenance data
- Current vehicle condition

Return the response in JSON format with the following structure:
{
  "vehicleId": "string",
  "maintenanceType": "string",
  "predictedDate": "string",
  "confidence": number,
  "urgency": "low|medium|high|critical",
  "estimatedCost": number,
  "recommendedActions": ["string"],
  "partsNeeded": ["string"]
}`;
  }

  private buildFuelEfficiencyPrompt(vehicles: any[], timeRange: { start: string; end: string }): string {
    return `As a Fleet Management AI Agent, analyze fuel efficiency for the fleet:

TIME RANGE: ${timeRange.start} to ${timeRange.end}

VEHICLES:
${vehicles.map(v => `- ${v.vehicle_name}: Current MPG: ${v.fuel_efficiency || 'N/A'}, Fuel Type: ${v.fuel_type || 'N/A'}`).join('\n')}

Please analyze:
1. Fuel consumption patterns
2. Efficiency comparisons between vehicles
3. Cost optimization opportunities
4. Driver behavior impact on fuel usage
5. Recommendations for improvement

Return the analysis in JSON format.`;
  }

  private parseRouteOptimizationResponse(response: string): RouteOptimization {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback: create a basic structure
      return {
        optimizedRoutes: [],
        totalSavings: { distance: 0, time: '0h', fuel: 0 },
        recommendations: [response]
      };
    } catch (error) {
      console.error('Error parsing route optimization response:', error);
      return {
        optimizedRoutes: [],
        totalSavings: { distance: 0, time: '0h', fuel: 0 },
        recommendations: ['Failed to parse optimization response']
      };
    }
  }

  private parseDriverAssignmentResponse(response: string): DriverAssignment[] {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.assignments || [];
      }
      return [];
    } catch (error) {
      console.error('Error parsing driver assignment response:', error);
      return [];
    }
  }

  private parseMaintenancePredictionResponse(response: string): MaintenancePrediction {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback structure
      return {
        vehicleId: '',
        maintenanceType: 'General',
        predictedDate: new Date().toISOString(),
        confidence: 0.5,
        urgency: 'medium',
        estimatedCost: 0,
        recommendedActions: [response],
        partsNeeded: []
      };
    } catch (error) {
      console.error('Error parsing maintenance prediction response:', error);
      return {
        vehicleId: '',
        maintenanceType: 'General',
        predictedDate: new Date().toISOString(),
        confidence: 0.5,
        urgency: 'medium',
        estimatedCost: 0,
        recommendedActions: ['Failed to parse maintenance prediction'],
        partsNeeded: []
      };
    }
  }

  private parseFuelEfficiencyResponse(response: string): any {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return { analysis: response };
    } catch (error) {
      console.error('Error parsing fuel efficiency response:', error);
      return { analysis: 'Failed to parse fuel efficiency analysis' };
    }
  }
}

// Export singleton instance
export const fleetManagementAgent = new FleetManagementAgent();


