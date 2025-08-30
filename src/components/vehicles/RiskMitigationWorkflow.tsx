import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Shield,
  TrendingDown,
  TrendingUp,
  User,
  Calendar,
  DollarSign,
  Target,
  Zap
} from 'lucide-react';
import { format } from 'date-fns';
import { RiskAssessment, RiskFactor, ComplianceAlert, MitigationAction } from '@/hooks/useComplianceRiskAssessment';

interface RiskMitigationWorkflowProps {
  riskAssessments: RiskAssessment[];
  complianceAlerts: ComplianceAlert[];
  onUpdateRiskAssessment: (id: string, updates: Partial<RiskAssessment>) => void;
  onAcknowledgeAlert: (alertId: string, assignedTo: string) => void;
  onResolveAlert: (alertId: string, resolutionNotes?: string) => void;
}

const RiskMitigationWorkflow: React.FC<RiskMitigationWorkflowProps> = ({
  riskAssessments,
  complianceAlerts,
  onUpdateRiskAssessment,
  onAcknowledgeAlert,
  onResolveAlert
}) => {
  const [selectedRisk, setSelectedRisk] = useState<RiskAssessment | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<ComplianceAlert | null>(null);
  const [newAction, setNewAction] = useState<Partial<MitigationAction>>({});
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'mitigating' | 'resolved'>('all');

  // Filter risk assessments based on status
  const filteredAssessments = riskAssessments.filter(assessment => {
    if (filterStatus === 'all') return true;
    return assessment.mitigationStatus === filterStatus;
  });

  // Get risk level color
  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get alert severity color
  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate mitigation progress
  const calculateMitigationProgress = (assessment: RiskAssessment) => {
    const totalFactors = assessment.riskFactors.length;
    const resolvedFactors = assessment.riskFactors.filter(f => f.status === 'resolved').length;
    return totalFactors > 0 ? Math.round((resolvedFactors / totalFactors) * 100) : 0;
  };

  // Handle risk factor status update
  const handleRiskFactorUpdate = (assessmentId: string, factorId: string, status: 'open' | 'mitigating' | 'resolved') => {
    const assessment = riskAssessments.find(r => r.id === assessmentId);
    if (!assessment) return;

    const updatedFactors = assessment.riskFactors.map(f => 
      f.id === factorId ? { ...f, status } : f
    );

    const updatedAssessment = {
      ...assessment,
      riskFactors: updatedFactors,
      mitigationStatus: updatedFactors.every(f => f.status === 'resolved') ? 'completed' : 'in_progress'
    };

    onUpdateRiskAssessment(assessmentId, updatedAssessment);
  };

  // Handle new mitigation action
  const handleCreateAction = () => {
    if (!selectedRisk || !newAction.action || !newAction.assignedTo || !newAction.dueDate) return;

    const action: MitigationAction = {
      id: `action-${Date.now()}`,
      riskFactorId: newAction.riskFactorId || '',
      action: newAction.action,
      assignedTo: newAction.assignedTo,
      dueDate: newAction.dueDate,
      status: 'pending',
      cost: newAction.cost || 0,
      notes: newAction.notes || ''
    };

    // In a real implementation, this would be saved to the database
    console.log('Creating new mitigation action:', action);
    
    // Reset form
    setNewAction({});
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Risk Mitigation Workflow</h2>
          <p className="text-gray-600">Track and manage risk mitigation actions</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="mitigating">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Risk Assessment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">High Risk Vehicles</p>
                <p className="text-2xl font-bold text-red-600">
                  {riskAssessments.filter(r => r.riskLevel === 'high' || r.riskLevel === 'critical').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {riskAssessments.filter(r => r.mitigationStatus === 'in_progress').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {riskAssessments.filter(r => r.mitigationStatus === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Assessments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Assessments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAssessments.map((assessment) => (
              <div key={assessment.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="font-semibold">{assessment.vehicleNumber}</h3>
                      <p className="text-sm text-gray-600">{assessment.vehicleName}</p>
                    </div>
                    <Badge className={getRiskLevelColor(assessment.riskLevel)}>
                      {assessment.riskLevel.toUpperCase()}
                    </Badge>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{assessment.riskScore}</div>
                      <div className="text-xs text-gray-500">Risk Score</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Mitigation Progress</div>
                    <Progress value={calculateMitigationProgress(assessment)} className="w-24 h-2" />
                    <div className="text-xs text-gray-500 mt-1">
                      {calculateMitigationProgress(assessment)}% Complete
                    </div>
                  </div>
                </div>

                {/* Risk Factors */}
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Risk Factors</h4>
                  {assessment.riskFactors.map((factor) => (
                    <div key={factor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {factor.category}
                          </Badge>
                          <Badge className={getRiskLevelColor(factor.severity)}>
                            {factor.severity}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium">{factor.description}</p>
                        <p className="text-xs text-gray-600">{factor.impact}</p>
                        {factor.cost && (
                          <div className="flex items-center space-x-1 mt-1">
                            <DollarSign className="w-3 h-3 text-gray-500" />
                            <span className="text-xs text-gray-600">£{factor.cost}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Select 
                          value={factor.status} 
                          onValueChange={(value: any) => handleRiskFactorUpdate(assessment.id, factor.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="mitigating">Mitigating</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                          </SelectContent>
                        </Select>
                        {factor.assignedTo && (
                          <div className="flex items-center space-x-1 text-xs text-gray-600">
                            <User className="w-3 h-3" />
                            <span>{factor.assignedTo}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mitigation Actions */}
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Mitigation Actions</h4>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedRisk(assessment)}
                    >
                      <Target className="w-4 h-4 mr-2" />
                      Add Action
                    </Button>
                  </div>
                  
                  {/* Action form */}
                  {selectedRisk?.id === assessment.id && (
                    <div className="p-4 bg-blue-50 rounded-lg space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Input
                          placeholder="Action description"
                          value={newAction.action || ''}
                          onChange={(e) => setNewAction({ ...newAction, action: e.target.value })}
                        />
                        <Input
                          placeholder="Assigned to"
                          value={newAction.assignedTo || ''}
                          onChange={(e) => setNewAction({ ...newAction, assignedTo: e.target.value })}
                        />
                        <Input
                          type="date"
                          value={newAction.dueDate || ''}
                          onChange={(e) => setNewAction({ ...newAction, dueDate: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Input
                          type="number"
                          placeholder="Estimated cost"
                          value={newAction.cost || ''}
                          onChange={(e) => setNewAction({ ...newAction, cost: parseFloat(e.target.value) || 0 })}
                        />
                        <Textarea
                          placeholder="Additional notes"
                          value={newAction.notes || ''}
                          onChange={(e) => setNewAction({ ...newAction, notes: e.target.value })}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" onClick={handleCreateAction}>
                          Create Action
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedRisk(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Compliance Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {complianceAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge className={getAlertSeverityColor(alert.severity)}>
                      {alert.severity.toUpperCase()}
                    </Badge>
                    <Badge variant="outline">{alert.type}</Badge>
                    <span className="text-sm text-gray-600">{alert.vehicleNumber}</span>
                  </div>
                  <h4 className="font-medium text-gray-900">{alert.title}</h4>
                  <p className="text-sm text-gray-600">{alert.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>Due: {format(new Date(alert.dueDate), 'MMM dd, yyyy')}</span>
                    </div>
                    {alert.assignedTo && (
                      <div className="flex items-center space-x-1">
                        <User className="w-3 h-3" />
                        <span>Assigned: {alert.assignedTo}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {alert.status === 'open' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onAcknowledgeAlert(alert.id, 'Current User')}
                    >
                      Acknowledge
                    </Button>
                  )}
                  {alert.status === 'acknowledged' && (
                    <Button 
                      size="sm"
                      onClick={() => onResolveAlert(alert.id, 'Alert resolved')}
                    >
                      Resolve
                    </Button>
                  )}
                  <Badge variant="outline">
                    {alert.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RiskMitigationWorkflow;
