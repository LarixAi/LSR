import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText, 
  Download,
  TrendingUp,
  Users,
  Calendar,
  RefreshCw,
  Filter,
  Eye,
  Printer,
  BarChart3,
  Activity
} from 'lucide-react';
import { useComplianceStats } from '@/hooks/useComplianceData';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const ComplianceReportsPage = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/auth" replace />;
  }

  // Only admins and council can access compliance reports
  if (profile.role !== 'admin' && profile.role !== 'council') {
    return <Navigate to="/" replace />;
  }

  const { data: complianceStats, isLoading: statsLoading } = useComplianceStats();
  
  const { data: recentViolations, isLoading: violationsLoading } = useQuery({
    queryKey: ['recent-violations'],
    queryFn: async () => {
      try {
        // Fetch compliance violations
        const { data: violations, error: violationsError } = await supabase
          .from('compliance_violations')
          .select('*')
          .eq('organization_id', profile.organization_id)
          .order('violation_date', { ascending: false })
          .limit(10);

        if (violationsError) {
          console.warn('Error fetching compliance violations:', violationsError);
          return [];
        }

        // Get unique driver IDs for fetching related data
        const driverIds = [...new Set(violations?.filter(v => v.driver_id).map(v => v.driver_id) || [])];

        let drivers: any[] = [];

        // Fetch driver profiles
        if (driverIds.length > 0) {
          const { data: driversData } = await supabase
            .from('profiles')
            .select('id, first_name, last_name')
            .in('id', driverIds);
          drivers = driversData || [];
        }

        // Create lookup map
        const driverMap = new Map(drivers.map(d => [d.id, d]));

        // Transform violations to include driver information
        return violations?.map(violation => ({
          id: violation.id,
          driver: violation.driver_id && driverMap.has(violation.driver_id) ? 
            `${driverMap.get(violation.driver_id)?.first_name || ''} ${driverMap.get(violation.driver_id)?.last_name || ''}`.trim() || 'Unknown Driver' : 
            'Unknown Driver',
          type: violation.violation_type || 'Unknown Violation',
          severity: violation.severity || 'Unknown',
          date: new Date(violation.violation_date).toLocaleDateString(),
          status: violation.status || 'Unknown'
        })) || [];
      } catch (error) {
        console.warn('Error fetching compliance violations:', error);
        return [];
      }
    },
    enabled: !!profile?.organization_id
  });

  const isLoading = statsLoading || violationsLoading;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'default';
      case 'pending': return 'secondary';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-lg">Loading compliance reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Shield className="w-8 h-8 text-green-600" />
            Compliance Reports
          </h1>
          <p className="text-muted-foreground mt-2">Monitor compliance analytics and generate comprehensive reports</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Drivers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceStats?.totalDrivers || 0}</div>
            <p className="text-xs text-muted-foreground">Active drivers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Violations</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{complianceStats?.activeViolations || 0}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            <Shield className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{complianceStats?.criticalAlerts || 0}</div>
            <p className="text-xs text-muted-foreground">Requires immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{complianceStats?.overallScore || 0}%</div>
            <p className="text-xs text-muted-foreground">Overall compliance</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Violations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Recent Compliance Issues
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {!recentViolations || recentViolations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
                <p className="text-lg font-medium">No recent violations</p>
                <p>All compliance requirements are being met</p>
              </div>
            ) : (
              recentViolations.map((violation) => (
                <div key={violation.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div>
                      <p className="font-medium">{violation.driver}</p>
                      <p className="text-sm text-muted-foreground">{violation.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getSeverityColor(violation.severity)}>
                      {violation.severity}
                    </Badge>
                    <Badge variant={getStatusColor(violation.status)}>
                      {violation.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{violation.date}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Report Generation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Driver Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Comprehensive report on driver licenses, certifications, and violations.
            </p>
            <Button variant="outline" className="w-full">
              Generate Report
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Expiry Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Track upcoming expirations for licenses, MOTs, and insurance.
            </p>
            <Button variant="outline" className="w-full">
              Generate Report
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Audit Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Monthly audit summary with compliance scores and recommendations.
            </p>
            <Button variant="outline" className="w-full">
              Generate Report
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        Last updated: {new Date().toLocaleDateString()}
      </div>
    </div>
  );
};

export default ComplianceReportsPage;