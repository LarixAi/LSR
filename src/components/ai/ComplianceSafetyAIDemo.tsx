import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  FileText, 
  Clock, 
  TrendingUp,
  Loader2,
  AlertCircle,
  Award,
  Gauge
} from 'lucide-react';
import { useComplianceSafetyAI } from '@/hooks/useComplianceSafetyAI';
import { ComplianceCheck, SafetyIncident, DVSACompliance, RegulatoryUpdate } from '@/services/ai/agents/ComplianceSafetyAgent';

export const ComplianceSafetyAIDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState('compliance');
  const [complianceChecks, setComplianceChecks] = useState<ComplianceCheck[] | null>(null);
  const [safetyIncident, setSafetyIncident] = useState<SafetyIncident | null>(null);
  const [dvsaCompliance, setDvsaCompliance] = useState<DVSACompliance | null>(null);
  const [regulatoryUpdates, setRegulatoryUpdates] = useState<RegulatoryUpdate[] | null>(null);
  const [safetyReport, setSafetyReport] = useState<any | null>(null);

  const {
    isLoading,
    error,
    checkCompliance,
    analyzeSafetyIncident,
    checkDVSACompliance,
    getRegulatoryUpdates,
    generateSafetyReport,
    clearError
  } = useComplianceSafetyAI();

  // Sample data for demonstration
  const sampleVehicles = [
    {
      id: 'v1',
      vehicle_name: 'LHR-001',
      status: 'active',
      vehicle_type: 'Box Truck',
      last_inspection_date: '2024-12-01'
    },
    {
      id: 'v2',
      vehicle_name: 'LHR-002',
      status: 'maintenance',
      vehicle_type: 'Rigid Truck',
      last_inspection_date: '2024-11-15'
    }
  ];

  const sampleDrivers = [
    {
      id: 'd1',
      full_name: 'John Smith',
      status: 'active',
      license_type: 'C+E',
      license_expiry: '2025-06-15'
    },
    {
      id: 'd2',
      full_name: 'Sarah Johnson',
      status: 'active',
      license_type: 'C',
      license_expiry: '2024-12-31'
    }
  ];

  const sampleInspections = [
    {
      vehicle_id: 'v1',
      inspection_type: 'Daily Check',
      inspection_date: '2025-01-15',
      status: 'passed'
    },
    {
      vehicle_id: 'v2',
      inspection_type: 'Annual MOT',
      inspection_date: '2024-11-15',
      status: 'failed'
    }
  ];

  const sampleIncident = {
    incident_type: 'minor_collision',
    vehicle_id: 'v1',
    driver_id: 'd1',
    location: 'M25 Junction 15',
    timestamp: '2025-01-15T08:30:00Z',
    description: 'Minor rear-end collision during morning traffic',
    severity: 'minor'
  };

  const sampleHistoricalIncidents = [
    {
      incident_type: 'breakdown',
      description: 'Engine failure on M1',
      timestamp: '2024-12-20T14:15:00Z'
    },
    {
      incident_type: 'traffic_violation',
      description: 'Speeding ticket on A1',
      timestamp: '2024-12-10T10:30:00Z'
    }
  ];

  const sampleOperatorData = {
    operator_id: 'OP123456',
    license_type: 'Standard National',
    authorized_vehicles: 5,
    last_inspection_date: '2024-10-15'
  };

  const sampleRegulations = [
    {
      regulation_id: 'DVSA-2024-001',
      title: 'Updated Driver Hours Regulations',
      effective_date: '2024-06-01'
    },
    {
      regulation_id: 'DVSA-2024-002',
      title: 'Enhanced Vehicle Safety Standards',
      effective_date: '2024-09-01'
    }
  ];

  const handleComplianceCheck = async () => {
    const result = await checkCompliance(sampleVehicles, sampleDrivers, sampleInspections);
    setComplianceChecks(result);
  };

  const handleSafetyIncidentAnalysis = async () => {
    const result = await analyzeSafetyIncident(sampleIncident, sampleHistoricalIncidents);
    setSafetyIncident(result);
  };

  const handleDVSAComplianceCheck = async () => {
    const result = await checkDVSACompliance(sampleOperatorData, sampleVehicles, sampleDrivers);
    setDvsaCompliance(result);
  };

  const handleRegulatoryUpdates = async () => {
    const result = await getRegulatoryUpdates(sampleRegulations, 'transport');
    setRegulatoryUpdates(result);
  };

  const handleSafetyReport = async () => {
    const result = await generateSafetyReport(
      { start: '2025-01-01', end: '2025-01-15' },
      sampleVehicles,
      [sampleIncident, ...sampleHistoricalIncidents]
    );
    setSafetyReport(result);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800';
      case 'non-compliant': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
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
          <h2 className="text-2xl font-bold text-gray-900">Compliance & Safety AI</h2>
          <p className="text-gray-600">AI-powered compliance monitoring and safety analysis</p>
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
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Compliance
          </TabsTrigger>
          <TabsTrigger value="safety" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Safety
          </TabsTrigger>
          <TabsTrigger value="dvsa" className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            DVSA
          </TabsTrigger>
          <TabsTrigger value="regulations" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Regulations
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-500" />
                Compliance Check
              </CardTitle>
              <p className="text-gray-600">
                AI-powered compliance monitoring for vehicles, drivers, and operations.
              </p>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleComplianceCheck} 
                disabled={isLoading}
                className="mb-4"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Checking Compliance...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Check Compliance
                  </>
                )}
              </Button>

              {complianceChecks && (
                <div className="space-y-4">
                  {complianceChecks.map((check, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <span className="font-medium">Vehicle: {check.vehicleId}</span>
                            <span className="mx-2">•</span>
                            <span>Driver: {check.driverId}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(check.status)}>
                              {check.status.toUpperCase()}
                            </Badge>
                            <Badge variant="outline">
                              Score: {check.complianceScore}%
                            </Badge>
                          </div>
                        </div>
                        
                        {check.issues.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-semibold text-sm">Issues Found:</h4>
                            {check.issues.map((issue, issueIndex) => (
                              <div key={issueIndex} className="p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium text-sm">{issue.type}</span>
                                  <Badge className={getSeverityColor(issue.severity)}>
                                    {issue.severity}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-700 mb-1">{issue.description}</p>
                                <p className="text-sm text-blue-600">{issue.recommendation}</p>
                                {issue.deadline && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Deadline: {issue.deadline}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <div className="mt-3 text-sm text-gray-600">
                          Next check: {check.nextCheckDate}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="safety" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                Safety Incident Analysis
              </CardTitle>
              <p className="text-gray-600">
                AI-powered incident analysis with root cause identification and prevention recommendations.
              </p>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleSafetyIncidentAnalysis} 
                disabled={isLoading}
                className="mb-4"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing Incident...
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Analyze Incident
                  </>
                )}
              </Button>

              {safetyIncident && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-orange-600">
                          {safetyIncident.incidentType.replace('_', ' ').toUpperCase()}
                        </div>
                        <div className="text-sm text-gray-600">Incident Type</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-red-600">
                          {safetyIncident.severity.toUpperCase()}
                        </div>
                        <div className="text-sm text-gray-600">Severity</div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">AI Analysis:</h4>
                      <div className="space-y-3">
                        <div>
                          <span className="font-medium text-sm">Root Cause:</span>
                          <p className="text-sm text-gray-700">{safetyIncident.aiAnalysis.rootCause}</p>
                        </div>
                        <div>
                          <span className="font-medium text-sm">Risk Level:</span>
                          <Badge className={getSeverityColor(safetyIncident.aiAnalysis.riskLevel)}>
                            {safetyIncident.aiAnalysis.riskLevel.toUpperCase()}
                          </Badge>
                        </div>
                        <div>
                          <span className="font-medium text-sm">Similar Incidents:</span>
                          <p className="text-sm text-gray-700">{safetyIncident.aiAnalysis.similarIncidents} in history</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">Recommendations:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {safetyIncident.aiAnalysis.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm text-gray-700">{rec}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dvsa" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-green-500" />
                DVSA Compliance
              </CardTitle>
              <p className="text-gray-600">
                Comprehensive DVSA operator compliance assessment and monitoring.
              </p>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleDVSAComplianceCheck} 
                disabled={isLoading}
                className="mb-4"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Checking DVSA Compliance...
                  </>
                ) : (
                  <>
                    <Award className="w-4 h-4 mr-2" />
                    Check DVSA Compliance
                  </>
                )}
              </Button>

              {dvsaCompliance && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-green-600">
                          {dvsaCompliance.complianceStatus.replace('_', ' ').toUpperCase()}
                        </div>
                        <div className="text-sm text-gray-600">Status</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-blue-600">
                          {dvsaCompliance.complianceScore}%
                        </div>
                        <div className="text-sm text-gray-600">Compliance Score</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-orange-600">
                          {dvsaCompliance.outstandingIssues.length}
                        </div>
                        <div className="text-sm text-gray-600">Outstanding Issues</div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">Last Inspection:</span>
                      <div className="font-medium">{dvsaCompliance.lastInspection}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Next Inspection:</span>
                      <div className="font-medium">{dvsaCompliance.nextInspection}</div>
                    </div>
                  </div>

                  {dvsaCompliance.outstandingIssues.length > 0 && (
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-2">Outstanding Issues:</h4>
                        <div className="space-y-2">
                          {dvsaCompliance.outstandingIssues.map((issue, index) => (
                            <div key={index} className="p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-medium text-sm">{issue.category}</span>
                                <Badge className={getSeverityColor(issue.priority)}>
                                  {issue.priority}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-700 mb-1">{issue.description}</p>
                              <p className="text-xs text-gray-500">Deadline: {issue.deadline}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">Recommendations:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {dvsaCompliance.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm text-gray-700">{rec}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regulations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-500" />
                Regulatory Updates
              </CardTitle>
              <p className="text-gray-600">
                Stay updated with the latest transport regulations and compliance requirements.
              </p>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleRegulatoryUpdates} 
                disabled={isLoading}
                className="mb-4"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Fetching Updates...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Get Regulatory Updates
                  </>
                )}
              </Button>

              {regulatoryUpdates && (
                <div className="space-y-4">
                  {regulatoryUpdates.map((update, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{update.title}</h4>
                          <Badge className={getSeverityColor(update.impact)}>
                            {update.impact.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 mb-3">{update.description}</p>
                        
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <span className="text-sm text-gray-600">Effective Date:</span>
                            <div className="font-medium text-sm">{update.effectiveDate}</div>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Deadline:</span>
                            <div className="font-medium text-sm">{update.deadline}</div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div>
                            <span className="text-sm font-medium">Affected Areas:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {update.affectedAreas.map((area, areaIndex) => (
                                <Badge key={areaIndex} variant="outline" className="text-xs">
                                  {area}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <span className="text-sm font-medium">Required Actions:</span>
                            <ul className="list-disc list-inside space-y-1 mt-1">
                              {update.requiredActions.map((action, actionIndex) => (
                                <li key={actionIndex} className="text-sm text-gray-700">{action}</li>
                              ))}
                            </ul>
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

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-500" />
                Safety Reports
              </CardTitle>
              <p className="text-gray-600">
                AI-generated safety reports with trends, insights, and recommendations.
              </p>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleSafetyReport} 
                disabled={isLoading}
                className="mb-4"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Report...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Generate Safety Report
                  </>
                )}
              </Button>

              {safetyReport && (
                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-2">Safety Report Analysis:</h4>
                      <div className="text-sm text-gray-700 whitespace-pre-wrap">
                        {typeof safetyReport === 'string' 
                          ? safetyReport 
                          : JSON.stringify(safetyReport, null, 2)
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



