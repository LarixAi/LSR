import { aiService } from '../AIService';
import { TMSContext } from '../AIService';

export interface JobSchedule {
  jobId: string;
  vehicleId: string;
  driverId: string;
  startTime: string;
  endTime: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'scheduled' | 'in_progress' | 'completed' | 'delayed';
  estimatedDuration: string;
  actualDuration?: string;
  delays: Array<{
    reason: string;
    duration: number;
    impact: 'low' | 'medium' | 'high';
  }>;
  optimization: {
    efficiency: number; // 0-100
    recommendations: string[];
    costSavings: number;
  };
}

export interface ResourceAllocation {
  resourceId: string;
  resourceType: 'vehicle' | 'driver' | 'equipment' | 'facility';
  allocation: Array<{
    jobId: string;
    startTime: string;
    endTime: string;
    utilization: number; // 0-100
    efficiency: number; // 0-100
  }>;
  totalUtilization: number;
  availability: {
    available: boolean;
    nextAvailable: string;
    conflicts: string[];
  };
  recommendations: string[];
}

export interface PerformanceMetrics {
  timeRange: { start: string; end: string };
  fleetMetrics: {
    totalJobs: number;
    completedJobs: number;
    onTimeDeliveries: number;
    averageJobDuration: string;
    totalDistance: number;
    fuelConsumption: number;
    costPerMile: number;
  };
  driverMetrics: {
    totalDrivers: number;
    activeDrivers: number;
    averageHours: number;
    complianceRate: number;
    safetyScore: number;
  };
  vehicleMetrics: {
    totalVehicles: number;
    activeVehicles: number;
    averageUtilization: number;
    maintenanceCost: number;
    reliabilityScore: number;
  };
  aiInsights: {
    trends: string[];
    anomalies: string[];
    recommendations: string[];
    riskFactors: string[];
  };
}

export interface OperationalAnalytics {
  analysisType: 'efficiency' | 'cost' | 'safety' | 'compliance' | 'predictive';
  timeRange: { start: string; end: string };
  dataPoints: Array<{
    timestamp: string;
    value: number;
    category: string;
    metadata?: any;
  }>;
  trends: Array<{
    direction: 'increasing' | 'decreasing' | 'stable';
    magnitude: number;
    confidence: number;
    description: string;
  }>;
  predictions: Array<{
    metric: string;
    predictedValue: number;
    confidence: number;
    timeframe: string;
    factors: string[];
  }>;
  recommendations: Array<{
    category: string;
    priority: 'low' | 'medium' | 'high';
    description: string;
    expectedImpact: string;
    implementation: string[];
  }>;
}

export class OperationsAgent {
  private context: TMSContext | null = null;

  async setContext(context: TMSContext): Promise<void> {
    this.context = context;
  }

  async optimizeJobSchedule(
    jobs: any[],
    vehicles: any[],
    drivers: any[],
    constraints?: {
      maxWorkingHours?: number;
      vehicleCapacity?: boolean;
      driverPreferences?: any;
      timeWindows?: any[];
    }
  ): Promise<JobSchedule[]> {
    if (!this.context) {
      throw new Error('Context not set. Call setContext() first.');
    }

    const prompt = this.buildJobSchedulePrompt(jobs, vehicles, drivers, constraints);
    
    try {
      const response = await aiService.chat(prompt, this.context.user.id, 'gpt4');
      return this.parseJobScheduleResponse(response);
    } catch (error) {
      console.error('Job schedule optimization error:', error);
      throw new Error('Failed to optimize job schedule');
    }
  }

  async allocateResources(
    resources: any[],
    jobs: any[],
    timeRange: { start: string; end: string }
  ): Promise<ResourceAllocation[]> {
    if (!this.context) {
      throw new Error('Context not set. Call setContext() first.');
    }

    const prompt = this.buildResourceAllocationPrompt(resources, jobs, timeRange);
    
    try {
      const response = await aiService.chat(prompt, this.context.user.id, 'gpt4');
      return this.parseResourceAllocationResponse(response);
    } catch (error) {
      console.error('Resource allocation error:', error);
      throw new Error('Failed to allocate resources');
    }
  }

  async analyzePerformance(
    timeRange: { start: string; end: string },
    jobs: any[],
    vehicles: any[],
    drivers: any[]
  ): Promise<PerformanceMetrics> {
    if (!this.context) {
      throw new Error('Context not set. Call setContext() first.');
    }

    const prompt = this.buildPerformanceAnalysisPrompt(timeRange, jobs, vehicles, drivers);
    
    try {
      const response = await aiService.chat(prompt, this.context.user.id, 'gpt4');
      return this.parsePerformanceMetricsResponse(response);
    } catch (error) {
      console.error('Performance analysis error:', error);
      throw new Error('Failed to analyze performance');
    }
  }

  async generateOperationalAnalytics(
    analysisType: 'efficiency' | 'cost' | 'safety' | 'compliance' | 'predictive',
    timeRange: { start: string; end: string },
    data: any[]
  ): Promise<OperationalAnalytics> {
    if (!this.context) {
      throw new Error('Context not set. Call setContext() first.');
    }

    const prompt = this.buildOperationalAnalyticsPrompt(analysisType, timeRange, data);
    
    try {
      const response = await aiService.chat(prompt, this.context.user.id, 'gpt4');
      return this.parseOperationalAnalyticsResponse(response);
    } catch (error) {
      console.error('Operational analytics error:', error);
      throw new Error('Failed to generate operational analytics');
    }
  }

  async predictDemand(
    historicalData: any[],
    timeHorizon: { start: string; end: string },
    factors?: string[]
  ): Promise<any> {
    if (!this.context) {
      throw new Error('Context not set. Call setContext() first.');
    }

    const prompt = this.buildDemandPredictionPrompt(historicalData, timeHorizon, factors);
    
    try {
      const response = await aiService.chat(prompt, this.context.user.id, 'gpt4');
      return this.parseDemandPredictionResponse(response);
    } catch (error) {
      console.error('Demand prediction error:', error);
      throw new Error('Failed to predict demand');
    }
  }

  private buildJobSchedulePrompt(
    jobs: any[],
    vehicles: any[],
    drivers: any[],
    constraints?: any
  ): string {
    return `As an Operations AI Agent, optimize job scheduling for this transport operation:

OPERATIONS CONTEXT:
- Total Jobs: ${jobs.length}
- Available Vehicles: ${vehicles.length}
- Available Drivers: ${drivers.length}
- Current Operations Status: ${JSON.stringify(this.context?.fleet, null, 2)}

JOBS:
${jobs.map(j => `- ${j.job_name || j.id}: ${j.pickup_location} → ${j.delivery_location}, Priority: ${j.priority || 'medium'}, Duration: ${j.estimated_duration || 'N/A'}, Deadline: ${j.deadline || 'N/A'}`).join('\n')}

VEHICLES:
${vehicles.map(v => `- ${v.vehicle_name} (${v.id}): ${v.status}, Capacity: ${v.capacity || 'N/A'}, Type: ${v.vehicle_type || 'N/A'}`).join('\n')}

DRIVERS:
${drivers.map(d => `- ${d.full_name} (${d.id}): ${d.status}, License: ${d.license_type || 'N/A'}, Experience: ${d.experience_years || 'N/A'} years`).join('\n')}

CONSTRAINTS:
${constraints ? JSON.stringify(constraints, null, 2) : 'None specified'}

Please optimize the job schedule considering:
1. Job priorities and deadlines
2. Vehicle and driver availability
3. Working time regulations
4. Route efficiency
5. Resource utilization
6. Cost optimization

Return the response in JSON format with the following structure:
{
  "jobSchedules": [
    {
      "jobId": "string",
      "vehicleId": "string",
      "driverId": "string",
      "startTime": "string",
      "endTime": "string",
      "priority": "low|medium|high|urgent",
      "status": "scheduled|in_progress|completed|delayed",
      "estimatedDuration": "string",
      "actualDuration": "string",
      "delays": [
        {
          "reason": "string",
          "duration": number,
          "impact": "low|medium|high"
        }
      ],
      "optimization": {
        "efficiency": number,
        "recommendations": ["string"],
        "costSavings": number
      }
    }
  ]
}`;
  }

  private buildResourceAllocationPrompt(
    resources: any[],
    jobs: any[],
    timeRange: { start: string; end: string }
  ): string {
    return `As an Operations AI Agent, optimize resource allocation for this transport operation:

RESOURCES:
${resources.map(r => `- ${r.resource_name || r.id} (${r.resource_type}): ${r.status}, Capacity: ${r.capacity || 'N/A'}`).join('\n')}

JOBS:
${jobs.map(j => `- ${j.job_name || j.id}: ${j.start_time} - ${j.end_time}, Requirements: ${j.resource_requirements || 'N/A'}`).join('\n')}

TIME RANGE: ${timeRange.start} to ${timeRange.end}

Please optimize resource allocation considering:
1. Resource availability and capacity
2. Job requirements and timing
3. Utilization efficiency
4. Cost optimization
5. Conflict resolution
6. Load balancing

Return the response in JSON format with the following structure:
{
  "resourceAllocations": [
    {
      "resourceId": "string",
      "resourceType": "vehicle|driver|equipment|facility",
      "allocation": [
        {
          "jobId": "string",
          "startTime": "string",
          "endTime": "string",
          "utilization": number,
          "efficiency": number
        }
      ],
      "totalUtilization": number,
      "availability": {
        "available": boolean,
        "nextAvailable": "string",
        "conflicts": ["string"]
      },
      "recommendations": ["string"]
    }
  ]
}`;
  }

  private buildPerformanceAnalysisPrompt(
    timeRange: { start: string; end: string },
    jobs: any[],
    vehicles: any[],
    drivers: any[]
  ): string {
    return `As an Operations AI Agent, analyze operational performance for this transport operation:

TIME RANGE: ${timeRange.start} to ${timeRange.end}

OPERATIONAL DATA:
- Total Jobs: ${jobs.length}
- Completed Jobs: ${jobs.filter(j => j.status === 'completed').length}
- Total Vehicles: ${vehicles.length}
- Active Vehicles: ${vehicles.filter(v => v.status === 'active').length}
- Total Drivers: ${drivers.length}
- Active Drivers: ${drivers.filter(d => d.status === 'active').length}

Please analyze performance metrics including:
1. Fleet efficiency and utilization
2. Driver performance and compliance
3. Vehicle reliability and maintenance
4. Cost analysis and optimization
5. Safety and compliance metrics
6. AI-powered insights and trends

Return the response in JSON format with the following structure:
{
  "timeRange": {
    "start": "string",
    "end": "string"
  },
  "fleetMetrics": {
    "totalJobs": number,
    "completedJobs": number,
    "onTimeDeliveries": number,
    "averageJobDuration": "string",
    "totalDistance": number,
    "fuelConsumption": number,
    "costPerMile": number
  },
  "driverMetrics": {
    "totalDrivers": number,
    "activeDrivers": number,
    "averageHours": number,
    "complianceRate": number,
    "safetyScore": number
  },
  "vehicleMetrics": {
    "totalVehicles": number,
    "activeVehicles": number,
    "averageUtilization": number,
    "maintenanceCost": number,
    "reliabilityScore": number
  },
  "aiInsights": {
    "trends": ["string"],
    "anomalies": ["string"],
    "recommendations": ["string"],
    "riskFactors": ["string"]
  }
}`;
  }

  private buildOperationalAnalyticsPrompt(
    analysisType: string,
    timeRange: { start: string; end: string },
    data: any[]
  ): string {
    return `As an Operations AI Agent, generate ${analysisType} analytics for this transport operation:

ANALYSIS TYPE: ${analysisType}
TIME RANGE: ${timeRange.start} to ${timeRange.end}
DATA POINTS: ${data.length}

Please provide comprehensive analytics including:
1. Data trends and patterns
2. Performance indicators
3. Predictive insights
4. Optimization recommendations
5. Risk assessment
6. Actionable insights

Focus on ${analysisType}-specific metrics and insights.

Return the analysis in JSON format with the following structure:
{
  "analysisType": "string",
  "timeRange": {
    "start": "string",
    "end": "string"
  },
  "dataPoints": [
    {
      "timestamp": "string",
      "value": number,
      "category": "string",
      "metadata": {}
    }
  ],
  "trends": [
    {
      "direction": "increasing|decreasing|stable",
      "magnitude": number,
      "confidence": number,
      "description": "string"
    }
  ],
  "predictions": [
    {
      "metric": "string",
      "predictedValue": number,
      "confidence": number,
      "timeframe": "string",
      "factors": ["string"]
    }
  ],
  "recommendations": [
    {
      "category": "string",
      "priority": "low|medium|high",
      "description": "string",
      "expectedImpact": "string",
      "implementation": ["string"]
    }
  ]
}`;
  }

  private buildDemandPredictionPrompt(
    historicalData: any[],
    timeHorizon: { start: string; end: string },
    factors?: string[]
  ): string {
    return `As an Operations AI Agent, predict demand for this transport operation:

HISTORICAL DATA POINTS: ${historicalData.length}
PREDICTION HORIZON: ${timeHorizon.start} to ${timeHorizon.end}
FACTORS: ${factors ? factors.join(', ') : 'Standard factors'}

Please predict demand considering:
1. Historical patterns and trends
2. Seasonal variations
3. Market conditions
4. External factors
5. Growth projections
6. Confidence intervals

Return the prediction in JSON format.`;
  }

  private parseJobScheduleResponse(response: string): JobSchedule[] {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.jobSchedules || [];
      }
      return [];
    } catch (error) {
      console.error('Error parsing job schedule response:', error);
      return [];
    }
  }

  private parseResourceAllocationResponse(response: string): ResourceAllocation[] {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.resourceAllocations || [];
      }
      return [];
    } catch (error) {
      console.error('Error parsing resource allocation response:', error);
      return [];
    }
  }

  private parsePerformanceMetricsResponse(response: string): PerformanceMetrics {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback structure
      return {
        timeRange: { start: '', end: '' },
        fleetMetrics: {
          totalJobs: 0,
          completedJobs: 0,
          onTimeDeliveries: 0,
          averageJobDuration: '0h',
          totalDistance: 0,
          fuelConsumption: 0,
          costPerMile: 0
        },
        driverMetrics: {
          totalDrivers: 0,
          activeDrivers: 0,
          averageHours: 0,
          complianceRate: 0,
          safetyScore: 0
        },
        vehicleMetrics: {
          totalVehicles: 0,
          activeVehicles: 0,
          averageUtilization: 0,
          maintenanceCost: 0,
          reliabilityScore: 0
        },
        aiInsights: {
          trends: [response],
          anomalies: [],
          recommendations: [],
          riskFactors: []
        }
      };
    } catch (error) {
      console.error('Error parsing performance metrics response:', error);
      return {
        timeRange: { start: '', end: '' },
        fleetMetrics: {
          totalJobs: 0,
          completedJobs: 0,
          onTimeDeliveries: 0,
          averageJobDuration: '0h',
          totalDistance: 0,
          fuelConsumption: 0,
          costPerMile: 0
        },
        driverMetrics: {
          totalDrivers: 0,
          activeDrivers: 0,
          averageHours: 0,
          complianceRate: 0,
          safetyScore: 0
        },
        vehicleMetrics: {
          totalVehicles: 0,
          activeVehicles: 0,
          averageUtilization: 0,
          maintenanceCost: 0,
          reliabilityScore: 0
        },
        aiInsights: {
          trends: ['Failed to parse performance data'],
          anomalies: [],
          recommendations: [],
          riskFactors: []
        }
      };
    }
  }

  private parseOperationalAnalyticsResponse(response: string): OperationalAnalytics {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback structure
      return {
        analysisType: 'efficiency',
        timeRange: { start: '', end: '' },
        dataPoints: [],
        trends: [],
        predictions: [],
        recommendations: [{
          category: 'general',
          priority: 'medium',
          description: response,
          expectedImpact: 'Unknown',
          implementation: []
        }]
      };
    } catch (error) {
      console.error('Error parsing operational analytics response:', error);
      return {
        analysisType: 'efficiency',
        timeRange: { start: '', end: '' },
        dataPoints: [],
        trends: [],
        predictions: [],
        recommendations: [{
          category: 'general',
          priority: 'medium',
          description: 'Failed to parse analytics data',
          expectedImpact: 'Unknown',
          implementation: []
        }]
      };
    }
  }

  private parseDemandPredictionResponse(response: string): any {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return { prediction: response };
    } catch (error) {
      console.error('Error parsing demand prediction response:', error);
      return { prediction: 'Failed to parse demand prediction' };
    }
  }
}

// Export singleton instance
export const operationsAgent = new OperationsAgent();



