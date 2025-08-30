
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, Clock, TrendingDown, TrendingUp, Shield, Activity, FileText, Users } from 'lucide-react';
import { useDriverComplianceScore } from '@/hooks/useCompliance';
import { useAuth } from '@/contexts/AuthContext';
import { getComplianceStatusColor } from '@/utils/complianceScoring';
import PageLayout from '@/components/layout/PageLayout';

const ComplianceDashboard = () => {
  // ALL HOOKS MUST BE CALLED AT THE TOP LEVEL - NO CONDITIONAL HOOKS
  const { user } = useAuth();
  const { data: complianceScore, isLoading } = useDriverComplianceScore(user?.id);
  
  // PageLayout state
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewFilter, setViewFilter] = useState('all');

  const defaultScore = {
    overall_score: 100,
    vehicle_check_score: 100,
    safety_score: 100,
    documentation_score: 100,
    incident_count: 0,
    risk_level: 'low' as const
  };

  const score = complianceScore || defaultScore;

  // CONDITIONAL RENDERING AFTER ALL HOOKS ARE CALLED
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-lg">Loading compliance data...</p>
        </div>
      </div>
    );
  }

  return (
    <PageLayout
      title="Compliance Dashboard"
      description="Monitor driver compliance, safety scores, and regulatory requirements"
      actionButton={{
        label: "Generate Report",
        onClick: () => console.log("Generate compliance report"),
        icon: <FileText className="w-4 h-4 mr-2" />
      }}
      summaryCards={[
        {
          title: "Overall Score",
          value: `${score.overall_score}%`,
          icon: <Shield className="h-4 w-4" />,
          color: "text-blue-600"
        },
        {
          title: "Vehicle Checks",
          value: `${score.vehicle_check_score}%`,
          icon: <CheckCircle className="h-4 w-4" />,
          color: "text-green-600"
        },
        {
          title: "Safety Score",
          value: `${score.safety_score}%`,
          icon: <AlertTriangle className="h-4 w-4" />,
          color: "text-orange-600"
        },
        {
          title: "Documentation",
          value: `${score.documentation_score}%`,
          icon: <FileText className="h-4 w-4" />,
          color: "text-purple-600"
        },
        {
          title: "Incidents",
          value: score.incident_count,
          icon: <TrendingDown className="h-4 w-4" />,
          color: "text-red-600"
        },
        {
          title: "Risk Level",
          value: score.risk_level.toUpperCase(),
          icon: <Activity className="h-4 w-4" />,
          color: score.risk_level === 'low' ? "text-green-600" : score.risk_level === 'medium' ? "text-yellow-600" : "text-red-600"
        }
      ]}
      searchPlaceholder="Search compliance records..."
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      filters={[
        {
          label: "Risk Level",
          value: viewFilter,
          options: [
            { value: "all", label: "All Levels" },
            { value: "low", label: "Low Risk" },
            { value: "medium", label: "Medium Risk" },
            { value: "high", label: "High Risk" }
          ],
          onChange: setViewFilter
        }
      ]}
      tabs={[
        { value: "overview", label: "Overview" },
        { value: "drivers", label: "Driver Compliance" },
        { value: "vehicles", label: "Vehicle Compliance" },
        { value: "reports", label: "Compliance Reports" }
      ]}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      isLoading={isLoading}
      emptyState={!score || score.overall_score === 0 ? {
        icon: <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />,
        title: "No Compliance Data",
        description: "No compliance data available. Start monitoring your fleet compliance.",
        action: {
          label: "Setup Compliance",
          onClick: () => console.log("Setup compliance monitoring")
        }
      } : null}
    >
            {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Compliance Summary
              </CardTitle>
              <CardDescription>
                Detailed breakdown of your current compliance status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Last Updated</p>
                      <p className="text-sm text-gray-500">Today at 9:30 AM</p>
                    </div>
                  </div>
                  <Badge className={getComplianceStatusColor(score.risk_level)}>
                    {score.risk_level.toUpperCase()} RISK
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Compliance Trends</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Overall Score</span>
                        <span className="text-sm font-medium">{score.overall_score}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Vehicle Checks</span>
                        <span className="text-sm font-medium">{score.vehicle_check_score}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Safety Score</span>
                        <span className="text-sm font-medium">{score.safety_score}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Risk Assessment</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Current Risk Level</span>
                        <Badge variant="outline" className={getComplianceStatusColor(score.risk_level)}>
                          {score.risk_level.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Incident Count</span>
                        <span className="text-sm font-medium">{score.incident_count}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Documentation</span>
                        <span className="text-sm font-medium">{score.documentation_score}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Driver Compliance Tab */}
      {activeTab === "drivers" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Driver Compliance Overview
              </CardTitle>
              <CardDescription>
                Monitor individual driver compliance scores and training requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">85%</div>
                    <div className="text-sm text-gray-600">Average Driver Score</div>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">12</div>
                    <div className="text-sm text-gray-600">Active Drivers</div>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <div className="text-2xl font-bold text-orange-600 mb-1">3</div>
                    <div className="text-sm text-gray-600">Require Training</div>
                  </div>
                </div>
                <div className="text-center pt-4">
                  <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                    <Users className="w-4 h-4 mr-2" />
                    View Driver Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Vehicle Compliance Tab */}
      {activeTab === "vehicles" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                Vehicle Compliance Status
              </CardTitle>
              <CardDescription>
                Track vehicle inspection compliance and maintenance requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">92%</div>
                    <div className="text-sm text-gray-600">Inspection Compliance</div>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">8</div>
                    <div className="text-sm text-gray-600">Vehicles Due</div>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <div className="text-2xl font-bold text-red-600 mb-1">2</div>
                    <div className="text-sm text-gray-600">Maintenance Overdue</div>
                  </div>
                </div>
                <div className="text-center pt-4">
                  <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Check Vehicle Status
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Compliance Reports Tab */}
      {activeTab === "reports" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                Compliance Reports
              </CardTitle>
              <CardDescription>
                Generate detailed compliance reports for regulatory authorities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Available Reports</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <span className="text-sm text-gray-600">Monthly Compliance Summary</span>
                        <FileText className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <span className="text-sm text-gray-600">Driver Safety Report</span>
                        <FileText className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <span className="text-sm text-gray-600">Vehicle Inspection Log</span>
                        <FileText className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Quick Actions</h4>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50">
                        <FileText className="w-4 h-4 mr-2" />
                        Generate Monthly Report
                      </Button>
                      <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Export Compliance Data
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </PageLayout>
  );
};

export default ComplianceDashboard;
