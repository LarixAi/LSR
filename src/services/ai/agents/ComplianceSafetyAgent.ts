import { aiService } from '../AIService';
import { TMSContext } from '../AIService';

export interface ComplianceCheck {
  vehicleId: string;
  driverId: string;
  checkType: 'daily' | 'weekly' | 'monthly' | 'annual';
  status: 'compliant' | 'non-compliant' | 'warning';
  issues: Array<{
    type: 'safety' | 'regulatory' | 'documentation' | 'maintenance';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    recommendation: string;
    deadline?: string;
  }>;
  nextCheckDate: string;
  complianceScore: number; // 0-100
}

export interface SafetyIncident {
  incidentId: string;
  vehicleId: string;
  driverId: string;
  incidentType: 'collision' | 'breakdown' | 'traffic_violation' | 'safety_violation';
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  description: string;
  location: string;
  timestamp: string;
  aiAnalysis: {
    rootCause: string;
    contributingFactors: string[];
    recommendations: string[];
    riskLevel: 'low' | 'medium' | 'high';
    similarIncidents: number;
  };
}

export interface DVSACompliance {
  operatorId: string;
  complianceStatus: 'compliant' | 'at_risk' | 'non_compliant';
  lastInspection: string;
  nextInspection: string;
  outstandingIssues: Array<{
    category: string;
    description: string;
    deadline: string;
    priority: 'low' | 'medium' | 'high';
  }>;
  complianceScore: number;
  recommendations: string[];
}

export interface RegulatoryUpdate {
  regulationId: string;
  title: string;
  description: string;
  effectiveDate: string;
  impact: 'low' | 'medium' | 'high';
  affectedAreas: string[];
  requiredActions: string[];
  deadline: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export class ComplianceSafetyAgent {
  private context: TMSContext | null = null;

  async setContext(context: TMSContext): Promise<void> {
    this.context = context;
  }

  async checkCompliance(
    vehicles: any[],
    drivers: any[],
    inspections: any[]
  ): Promise<ComplianceCheck[]> {
    if (!this.context) {
      throw new Error('Context not set. Call setContext() first.');
    }

    const prompt = this.buildComplianceCheckPrompt(vehicles, drivers, inspections);
    
    try {
      const response = await aiService.chat(prompt, this.context.user.id, 'gpt4');
      return this.parseComplianceCheckResponse(response);
    } catch (error) {
      console.error('Compliance check error:', error);
      throw new Error('Failed to check compliance');
    }
  }

  async analyzeSafetyIncident(
    incident: any,
    historicalIncidents: any[]
  ): Promise<SafetyIncident> {
    if (!this.context) {
      throw new Error('Context not set. Call setContext() first.');
    }

    const prompt = this.buildSafetyIncidentPrompt(incident, historicalIncidents);
    
    try {
      const response = await aiService.chat(prompt, this.context.user.id, 'gpt4');
      return this.parseSafetyIncidentResponse(response);
    } catch (error) {
      console.error('Safety incident analysis error:', error);
      throw new Error('Failed to analyze safety incident');
    }
  }

  async checkDVSACompliance(
    operatorData: any,
    vehicles: any[],
    drivers: any[]
  ): Promise<DVSACompliance> {
    if (!this.context) {
      throw new Error('Context not set. Call setContext() first.');
    }

    const prompt = this.buildDVSACompliancePrompt(operatorData, vehicles, drivers);
    
    try {
      const response = await aiService.chat(prompt, this.context.user.id, 'gpt4');
      return this.parseDVSAComplianceResponse(response);
    } catch (error) {
      console.error('DVSA compliance check error:', error);
      throw new Error('Failed to check DVSA compliance');
    }
  }

  async getRegulatoryUpdates(
    currentRegulations: any[],
    industry: string = 'transport'
  ): Promise<RegulatoryUpdate[]> {
    if (!this.context) {
      throw new Error('Context not set. Call setContext() first.');
    }

    const prompt = this.buildRegulatoryUpdatesPrompt(currentRegulations, industry);
    
    try {
      const response = await aiService.chat(prompt, this.context.user.id, 'gpt4');
      return this.parseRegulatoryUpdatesResponse(response);
    } catch (error) {
      console.error('Regulatory updates error:', error);
      throw new Error('Failed to get regulatory updates');
    }
  }

  async generateSafetyReport(
    timeRange: { start: string; end: string },
    vehicles: any[],
    incidents: any[]
  ): Promise<any> {
    if (!this.context) {
      throw new Error('Context not set. Call setContext() first.');
    }

    const prompt = this.buildSafetyReportPrompt(timeRange, vehicles, incidents);
    
    try {
      const response = await aiService.chat(prompt, this.context.user.id, 'gpt4');
      return this.parseSafetyReportResponse(response);
    } catch (error) {
      console.error('Safety report generation error:', error);
      throw new Error('Failed to generate safety report');
    }
  }

  private buildComplianceCheckPrompt(
    vehicles: any[],
    drivers: any[],
    inspections: any[]
  ): string {
    return `As a Compliance & Safety AI Agent, perform a comprehensive compliance check for this transport operation:

FLEET CONTEXT:
- Total Vehicles: ${vehicles.length}
- Total Drivers: ${drivers.length}
- Recent Inspections: ${inspections.length}
- Current Fleet Status: ${JSON.stringify(this.context?.fleet, null, 2)}

VEHICLES:
${vehicles.map(v => `- ${v.vehicle_name} (${v.id}): ${v.status}, Type: ${v.vehicle_type || 'N/A'}, Last Inspection: ${v.last_inspection_date || 'N/A'}`).join('\n')}

DRIVERS:
${drivers.map(d => `- ${d.full_name} (${d.id}): ${d.status}, License: ${d.license_type || 'N/A'}, Expiry: ${d.license_expiry || 'N/A'}`).join('\n')}

INSPECTIONS:
${inspections.map(i => `- ${i.vehicle_id}: ${i.inspection_type || 'N/A'}, Date: ${i.inspection_date || 'N/A'}, Status: ${i.status || 'N/A'}`).join('\n')}

COMPLIANCE REQUIREMENTS:
- DVSA Operator Compliance
- Driver Hours Regulations
- Vehicle Maintenance Standards
- Safety Equipment Requirements
- Documentation Standards

Please check compliance for each vehicle and driver, considering:
1. Vehicle roadworthiness and maintenance
2. Driver license validity and hours compliance
3. Safety equipment and documentation
4. Regulatory requirements
5. Inspection schedules and deadlines

Return the response in JSON format with the following structure:
{
  "complianceChecks": [
    {
      "vehicleId": "string",
      "driverId": "string",
      "checkType": "daily|weekly|monthly|annual",
      "status": "compliant|non-compliant|warning",
      "issues": [
        {
          "type": "safety|regulatory|documentation|maintenance",
          "severity": "low|medium|high|critical",
          "description": "string",
          "recommendation": "string",
          "deadline": "string"
        }
      ],
      "nextCheckDate": "string",
      "complianceScore": number
    }
  ]
}`;
  }

  private buildSafetyIncidentPrompt(
    incident: any,
    historicalIncidents: any[]
  ): string {
    return `As a Compliance & Safety AI Agent, analyze this safety incident:

CURRENT INCIDENT:
- Type: ${incident.incident_type || 'N/A'}
- Vehicle: ${incident.vehicle_id || 'N/A'}
- Driver: ${incident.driver_id || 'N/A'}
- Location: ${incident.location || 'N/A'}
- Time: ${incident.timestamp || 'N/A'}
- Description: ${incident.description || 'N/A'}
- Severity: ${incident.severity || 'N/A'}

HISTORICAL INCIDENTS (${historicalIncidents.length}):
${historicalIncidents.map(i => `- ${i.incident_type}: ${i.description}, Date: ${i.timestamp}`).join('\n')}

Please analyze this incident and provide:
1. Root cause analysis
2. Contributing factors
3. Risk assessment
4. Recommendations for prevention
5. Similar incident patterns
6. Safety improvements needed

Return the response in JSON format with the following structure:
{
  "incidentId": "string",
  "vehicleId": "string",
  "driverId": "string",
  "incidentType": "collision|breakdown|traffic_violation|safety_violation",
  "severity": "minor|moderate|major|critical",
  "description": "string",
  "location": "string",
  "timestamp": "string",
  "aiAnalysis": {
    "rootCause": "string",
    "contributingFactors": ["string"],
    "recommendations": ["string"],
    "riskLevel": "low|medium|high",
    "similarIncidents": number
  }
}`;
  }

  private buildDVSACompliancePrompt(
    operatorData: any,
    vehicles: any[],
    drivers: any[]
  ): string {
    return `As a Compliance & Safety AI Agent, assess DVSA compliance for this operator:

OPERATOR DATA:
- Operator ID: ${operatorData.operator_id || 'N/A'}
- License Type: ${operatorData.license_type || 'N/A'}
- Authorized Vehicles: ${operatorData.authorized_vehicles || 'N/A'}
- Last Inspection: ${operatorData.last_inspection_date || 'N/A'}

FLEET STATUS:
- Total Vehicles: ${vehicles.length}
- Active Vehicles: ${vehicles.filter(v => v.status === 'active').length}
- Total Drivers: ${drivers.length}
- Licensed Drivers: ${drivers.filter(d => d.license_type).length}

DVSA REQUIREMENTS:
- Operator License Compliance
- Vehicle Authorization
- Driver Qualification Standards
- Maintenance Standards
- Documentation Requirements
- Safety Management Systems

Please assess:
1. Overall compliance status
2. Outstanding issues and deadlines
3. Compliance score calculation
4. Recommendations for improvement
5. Risk areas requiring attention

Return the response in JSON format with the following structure:
{
  "operatorId": "string",
  "complianceStatus": "compliant|at_risk|non_compliant",
  "lastInspection": "string",
  "nextInspection": "string",
  "outstandingIssues": [
    {
      "category": "string",
      "description": "string",
      "deadline": "string",
      "priority": "low|medium|high"
    }
  ],
  "complianceScore": number,
  "recommendations": ["string"]
}`;
  }

  private buildRegulatoryUpdatesPrompt(
    currentRegulations: any[],
    industry: string
  ): string {
    return `As a Compliance & Safety AI Agent, provide regulatory updates for the ${industry} industry:

CURRENT REGULATIONS:
${currentRegulations.map(r => `- ${r.regulation_id}: ${r.title}, Effective: ${r.effective_date}`).join('\n')}

Please provide updates on:
1. New regulations coming into effect
2. Changes to existing regulations
3. Industry-specific requirements
4. Compliance deadlines
5. Required actions for operators

Focus on:
- DVSA regulations
- Transport safety standards
- Environmental requirements
- Driver qualification changes
- Vehicle standards updates

Return the response in JSON format with the following structure:
{
  "regulatoryUpdates": [
    {
      "regulationId": "string",
      "title": "string",
      "description": "string",
      "effectiveDate": "string",
      "impact": "low|medium|high",
      "affectedAreas": ["string"],
      "requiredActions": ["string"],
      "deadline": "string",
      "status": "pending|in_progress|completed"
    }
  ]
}`;
  }

  private buildSafetyReportPrompt(
    timeRange: { start: string; end: string },
    vehicles: any[],
    incidents: any[]
  ): string {
    return `As a Compliance & Safety AI Agent, generate a comprehensive safety report:

TIME RANGE: ${timeRange.start} to ${timeRange.end}

FLEET DATA:
- Total Vehicles: ${vehicles.length}
- Active Vehicles: ${vehicles.filter(v => v.status === 'active').length}

INCIDENTS (${incidents.length}):
${incidents.map(i => `- ${i.incident_type}: ${i.description}, Date: ${i.timestamp}, Severity: ${i.severity}`).join('\n')}

Please generate a safety report including:
1. Incident analysis and trends
2. Safety performance metrics
3. Risk assessment
4. Recommendations for improvement
5. Compliance status summary
6. Action items and priorities

Return the analysis in JSON format.`;
  }

  private parseComplianceCheckResponse(response: string): ComplianceCheck[] {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.complianceChecks || [];
      }
      return [];
    } catch (error) {
      console.error('Error parsing compliance check response:', error);
      return [];
    }
  }

  private parseSafetyIncidentResponse(response: string): SafetyIncident {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback structure
      return {
        incidentId: '',
        vehicleId: '',
        driverId: '',
        incidentType: 'safety_violation',
        severity: 'minor',
        description: '',
        location: '',
        timestamp: new Date().toISOString(),
        aiAnalysis: {
          rootCause: response,
          contributingFactors: [],
          recommendations: [],
          riskLevel: 'low',
          similarIncidents: 0
        }
      };
    } catch (error) {
      console.error('Error parsing safety incident response:', error);
      return {
        incidentId: '',
        vehicleId: '',
        driverId: '',
        incidentType: 'safety_violation',
        severity: 'minor',
        description: '',
        location: '',
        timestamp: new Date().toISOString(),
        aiAnalysis: {
          rootCause: 'Failed to parse incident analysis',
          contributingFactors: [],
          recommendations: [],
          riskLevel: 'low',
          similarIncidents: 0
        }
      };
    }
  }

  private parseDVSAComplianceResponse(response: string): DVSACompliance {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback structure
      return {
        operatorId: '',
        complianceStatus: 'at_risk',
        lastInspection: new Date().toISOString(),
        nextInspection: new Date().toISOString(),
        outstandingIssues: [],
        complianceScore: 0,
        recommendations: [response]
      };
    } catch (error) {
      console.error('Error parsing DVSA compliance response:', error);
      return {
        operatorId: '',
        complianceStatus: 'at_risk',
        lastInspection: new Date().toISOString(),
        nextInspection: new Date().toISOString(),
        outstandingIssues: [],
        complianceScore: 0,
        recommendations: ['Failed to parse compliance data']
      };
    }
  }

  private parseRegulatoryUpdatesResponse(response: string): RegulatoryUpdate[] {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed.regulatoryUpdates || [];
      }
      return [];
    } catch (error) {
      console.error('Error parsing regulatory updates response:', error);
      return [];
    }
  }

  private parseSafetyReportResponse(response: string): any {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return { report: response };
    } catch (error) {
      console.error('Error parsing safety report response:', error);
      return { report: 'Failed to parse safety report' };
    }
  }
}

// Export singleton instance
export const complianceSafetyAgent = new ComplianceSafetyAgent();


