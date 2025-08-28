
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, AlertTriangle, XCircle, Clock, TrendingUp } from 'lucide-react';

interface ComplianceOverview {
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  complianceScore: number;
  lastInspection: string;
  drivers: any[];
  violations: any[];
  licenses: any[];
  riskScores: any[];
}

interface ComplianceMetricsProps {
  complianceOverview: ComplianceOverview;
}

const ComplianceMetrics: React.FC<ComplianceMetricsProps> = ({ complianceOverview }) => {
  // Calculate compliance metrics
  const complianceMetrics = React.useMemo(() => {
    if (!complianceOverview) return null;

    const totalDrivers = complianceOverview.drivers.length;
    const activeViolations = complianceOverview.violations.length;
    const criticalViolations = complianceOverview.violations.filter(v => v.severity === 'critical').length;
    const expiringLicenses = complianceOverview.licenses.filter(l => {
      const expiryDate = new Date(l.expiry_date);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      return expiryDate <= thirtyDaysFromNow && l.status === 'active';
    }).length;

    const avgRiskScore = complianceOverview.riskScores.length > 0 
      ? Math.round(complianceOverview.riskScores.reduce((sum, score) => sum + score.risk_score, 0) / complianceOverview.riskScores.length)
      : 100;

    const highRiskDrivers = complianceOverview.riskScores.filter(score => score.risk_category === 'high' || score.risk_category === 'critical').length;

    return {
      totalDrivers,
      activeViolations,
      criticalViolations,
      expiringLicenses,
      avgRiskScore,
      highRiskDrivers
    };
  }, [complianceOverview]);

  if (!complianceMetrics) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Drivers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{complianceMetrics.totalDrivers}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Violations</CardTitle>
          <AlertTriangle className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{complianceMetrics.activeViolations}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
          <XCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{complianceMetrics.criticalViolations}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Expiring Licenses</CardTitle>
          <Clock className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{complianceMetrics.expiringLicenses}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Risk Score</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{complianceMetrics.avgRiskScore}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">High Risk Drivers</CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{complianceMetrics.highRiskDrivers}</div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComplianceMetrics;
