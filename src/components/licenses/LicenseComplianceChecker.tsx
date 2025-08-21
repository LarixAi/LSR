import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Shield, 
  Activity,
  RefreshCw,
  FileText,
  Calendar,
  AlertCircle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { DriverLicense } from '@/hooks/useLicenses';
import { format, isAfter, isBefore, addDays, differenceInDays } from 'date-fns';

interface LicenseComplianceCheckerProps {
  licenses: DriverLicense[];
  onRefresh?: () => void;
}

interface ComplianceIssue {
  type: 'expired' | 'expiring-soon' | 'missing-medical' | 'missing-background' | 'missing-drug-test' | 'missing-training';
  severity: 'critical' | 'warning' | 'info';
  message: string;
  license: DriverLicense;
  daysUntilExpiry?: number;
}

interface ComplianceStats {
  total: number;
  compliant: number;
  nonCompliant: number;
  criticalIssues: number;
  warnings: number;
  complianceRate: number;
}

const LicenseComplianceChecker: React.FC<LicenseComplianceCheckerProps> = ({ 
  licenses, 
  onRefresh 
}) => {
  const [complianceIssues, setComplianceIssues] = useState<ComplianceIssue[]>([]);
  const [stats, setStats] = useState<ComplianceStats>({
    total: 0,
    compliant: 0,
    nonCompliant: 0,
    criticalIssues: 0,
    warnings: 0,
    complianceRate: 0
  });
  const [isChecking, setIsChecking] = useState(false);

  const checkCompliance = () => {
    setIsChecking(true);
    const issues: ComplianceIssue[] = [];
    const now = new Date();
    const thirtyDaysFromNow = addDays(now, 30);
    const ninetyDaysFromNow = addDays(now, 90);

    licenses.forEach(license => {
      // Check license expiry
      const expiryDate = new Date(license.expiry_date);
      const daysUntilExpiry = differenceInDays(expiryDate, now);

      if (isBefore(expiryDate, now)) {
        issues.push({
          type: 'expired',
          severity: 'critical',
          message: `License expired ${Math.abs(daysUntilExpiry)} days ago`,
          license,
          daysUntilExpiry
        });
      } else if (isBefore(expiryDate, thirtyDaysFromNow)) {
        issues.push({
          type: 'expiring-soon',
          severity: 'warning',
          message: `License expires in ${daysUntilExpiry} days`,
          license,
          daysUntilExpiry
        });
      }

      // Check medical certificate
      if (license.medical_certificate_expiry) {
        const medicalExpiry = new Date(license.medical_certificate_expiry);
        const medicalDaysUntilExpiry = differenceInDays(medicalExpiry, now);

        if (isBefore(medicalExpiry, now)) {
          issues.push({
            type: 'missing-medical',
            severity: 'critical',
            message: `Medical certificate expired ${Math.abs(medicalDaysUntilExpiry)} days ago`,
            license,
            daysUntilExpiry: medicalDaysUntilExpiry
          });
        } else if (isBefore(medicalExpiry, thirtyDaysFromNow)) {
          issues.push({
            type: 'missing-medical',
            severity: 'warning',
            message: `Medical certificate expires in ${medicalDaysUntilExpiry} days`,
            license,
            daysUntilExpiry: medicalDaysUntilExpiry
          });
        }
      } else {
        issues.push({
          type: 'missing-medical',
          severity: 'warning',
          message: 'Medical certificate expiry date not set',
          license
        });
      }

      // Check background check
      if (license.background_check_expiry) {
        const backgroundExpiry = new Date(license.background_check_expiry);
        const backgroundDaysUntilExpiry = differenceInDays(backgroundExpiry, now);

        if (isBefore(backgroundExpiry, now)) {
          issues.push({
            type: 'missing-background',
            severity: 'critical',
            message: `Background check expired ${Math.abs(backgroundDaysUntilExpiry)} days ago`,
            license,
            daysUntilExpiry: backgroundDaysUntilExpiry
          });
        } else if (isBefore(backgroundExpiry, ninetyDaysFromNow)) {
          issues.push({
            type: 'missing-background',
            severity: 'warning',
            message: `Background check expires in ${backgroundDaysUntilExpiry} days`,
            license,
            daysUntilExpiry: backgroundDaysUntilExpiry
          });
        }
      } else {
        issues.push({
          type: 'missing-background',
          severity: 'info',
          message: 'Background check expiry date not set',
          license
        });
      }

      // Check drug test
      if (license.drug_test_expiry) {
        const drugTestExpiry = new Date(license.drug_test_expiry);
        const drugTestDaysUntilExpiry = differenceInDays(drugTestExpiry, now);

        if (isBefore(drugTestExpiry, now)) {
          issues.push({
            type: 'missing-drug-test',
            severity: 'critical',
            message: `Drug test expired ${Math.abs(drugTestDaysUntilExpiry)} days ago`,
            license,
            daysUntilExpiry: drugTestDaysUntilExpiry
          });
        } else if (isBefore(drugTestExpiry, ninetyDaysFromNow)) {
          issues.push({
            type: 'missing-drug-test',
            severity: 'warning',
            message: `Drug test expires in ${drugTestDaysUntilExpiry} days`,
            license,
            daysUntilExpiry: drugTestDaysUntilExpiry
          });
        }
      } else {
        issues.push({
          type: 'missing-drug-test',
          severity: 'info',
          message: 'Drug test expiry date not set',
          license
        });
      }

      // Check training
      if (license.training_expiry) {
        const trainingExpiry = new Date(license.training_expiry);
        const trainingDaysUntilExpiry = differenceInDays(trainingExpiry, now);

        if (isBefore(trainingExpiry, now)) {
          issues.push({
            type: 'missing-training',
            severity: 'critical',
            message: `Training expired ${Math.abs(trainingDaysUntilExpiry)} days ago`,
            license,
            daysUntilExpiry: trainingDaysUntilExpiry
          });
        } else if (isBefore(trainingExpiry, ninetyDaysFromNow)) {
          issues.push({
            type: 'missing-training',
            severity: 'warning',
            message: `Training expires in ${trainingDaysUntilExpiry} days`,
            license,
            daysUntilExpiry: trainingDaysUntilExpiry
          });
        }
      } else {
        issues.push({
          type: 'missing-training',
          severity: 'info',
          message: 'Training expiry date not set',
          license
        });
      }
    });

    setComplianceIssues(issues);

    // Calculate stats
    const total = licenses.length;
    const criticalIssues = issues.filter(issue => issue.severity === 'critical').length;
    const warnings = issues.filter(issue => issue.severity === 'warning').length;
    const nonCompliant = criticalIssues + warnings;
    const compliant = total - nonCompliant;
    const complianceRate = total > 0 ? Math.round((compliant / total) * 100) : 100;

    setStats({
      total,
      compliant,
      nonCompliant,
      criticalIssues,
      warnings,
      complianceRate
    });

    setIsChecking(false);
  };

  useEffect(() => {
    checkCompliance();
  }, [licenses]);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info': return <Activity className="w-4 h-4 text-blue-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-200 bg-red-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'info': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getIssueTypeLabel = (type: string) => {
    switch (type) {
      case 'expired': return 'License Expired';
      case 'expiring-soon': return 'License Expiring Soon';
      case 'missing-medical': return 'Medical Certificate';
      case 'missing-background': return 'Background Check';
      case 'missing-drug-test': return 'Drug Test';
      case 'missing-training': return 'Training';
      default: return type;
    }
  };

  const criticalIssues = complianceIssues.filter(issue => issue.severity === 'critical');
  const warningIssues = complianceIssues.filter(issue => issue.severity === 'warning');
  const infoIssues = complianceIssues.filter(issue => issue.severity === 'info');

  return (
    <div className="space-y-6">
      {/* Compliance Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>License Compliance Overview</CardTitle>
              <CardDescription>
                Automated compliance checking for all driver licenses
              </CardDescription>
            </div>
            <Button 
              onClick={() => {
                checkCompliance();
                onRefresh?.();
              }}
              disabled={isChecking}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Licenses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.compliant}</div>
              <div className="text-sm text-gray-600">Compliant</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.criticalIssues}</div>
              <div className="text-sm text-gray-600">Critical Issues</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.warnings}</div>
              <div className="text-sm text-gray-600">Warnings</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Compliance Rate</span>
              <span>{stats.complianceRate}%</span>
            </div>
            <Progress value={stats.complianceRate} className="h-2" />
            <div className="flex items-center gap-2 text-sm">
              {stats.complianceRate >= 90 ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span className={stats.complianceRate >= 90 ? 'text-green-600' : 'text-red-600'}>
                {stats.complianceRate >= 90 ? 'Excellent' : 'Needs Attention'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Critical Issues */}
      {criticalIssues.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <XCircle className="w-5 h-5" />
              Critical Issues ({criticalIssues.length})
            </CardTitle>
            <CardDescription>
              These issues require immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {criticalIssues.map((issue, index) => (
                <Alert key={index} className={getSeverityColor(issue.severity)}>
                  <div className="flex items-start gap-3">
                    {getSeverityIcon(issue.severity)}
                    <div className="flex-1">
                      <AlertDescription>
                        <div className="flex items-center justify-between">
                          <div>
                            <strong>{issue.license.driver_name}</strong> - {getIssueTypeLabel(issue.type)}
                          </div>
                          <Badge variant="destructive" className="ml-2">
                            {issue.daysUntilExpiry !== undefined ? 
                              `${Math.abs(issue.daysUntilExpiry)} days` : 'Unknown'
                            }
                          </Badge>
                        </div>
                        <p className="text-sm mt-1">{issue.message}</p>
                        <div className="text-xs text-gray-500 mt-1">
                          License: {issue.license.license_number} | Type: {issue.license.license_type}
                        </div>
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warnings */}
      {warningIssues.length > 0 && (
        <Card className="border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <AlertTriangle className="w-5 h-5" />
              Warnings ({warningIssues.length})
            </CardTitle>
            <CardDescription>
              These issues should be addressed soon
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {warningIssues.map((issue, index) => (
                <Alert key={index} className={getSeverityColor(issue.severity)}>
                  <div className="flex items-start gap-3">
                    {getSeverityIcon(issue.severity)}
                    <div className="flex-1">
                      <AlertDescription>
                        <div className="flex items-center justify-between">
                          <div>
                            <strong>{issue.license.driver_name}</strong> - {getIssueTypeLabel(issue.type)}
                          </div>
                          <Badge variant="secondary" className="ml-2">
                            {issue.daysUntilExpiry !== undefined ? 
                              `${issue.daysUntilExpiry} days` : 'Unknown'
                            }
                          </Badge>
                        </div>
                        <p className="text-sm mt-1">{issue.message}</p>
                        <div className="text-xs text-gray-500 mt-1">
                          License: {issue.license.license_number} | Type: {issue.license.license_type}
                        </div>
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Issues */}
      {infoIssues.length > 0 && (
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <Activity className="w-5 h-5" />
              Information ({infoIssues.length})
            </CardTitle>
            <CardDescription>
              Missing information that should be completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {infoIssues.map((issue, index) => (
                <Alert key={index} className={getSeverityColor(issue.severity)}>
                  <div className="flex items-start gap-3">
                    {getSeverityIcon(issue.severity)}
                    <div className="flex-1">
                      <AlertDescription>
                        <div className="flex items-center justify-between">
                          <div>
                            <strong>{issue.license.driver_name}</strong> - {getIssueTypeLabel(issue.type)}
                          </div>
                        </div>
                        <p className="text-sm mt-1">{issue.message}</p>
                        <div className="text-xs text-gray-500 mt-1">
                          License: {issue.license.license_number} | Type: {issue.license.license_type}
                        </div>
                      </AlertDescription>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Clear */}
      {complianceIssues.length === 0 && (
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              All Clear
            </CardTitle>
            <CardDescription>
              All licenses are compliant with current requirements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-green-700 font-medium">No compliance issues found</p>
              <p className="text-sm text-gray-600 mt-2">
                All driver licenses are up to date and compliant
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LicenseComplianceChecker;

