// @ts-nocheck
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { useEnhancedVehicleChecks } from '@/hooks/useEnhancedVehicleChecks';
import ComplianceCheckDialog from './ComplianceCheckDialog';
import { useToast } from '@/hooks/use-toast';

const ComplianceChecksList = () => {
  const { data: vehicleChecks = [], isLoading } = useEnhancedVehicleChecks();
  const [selectedCheck, setSelectedCheck] = useState<any>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const { toast } = useToast();

  const getComplianceStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'non_compliant': return 'bg-red-100 text-red-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredChecks = vehicleChecks.filter(check => {
    if (filter === 'all') return true;
    return check.compliance_status === filter;
  });

  const handleApproveCheck = async (checkId: string, notes: string) => {
    try {
      // Here you would implement the API call to approve the check
      console.log('Approving check:', checkId, notes);
      toast({
        title: "Check Approved",
        description: "Vehicle check has been approved for compliance.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve vehicle check.",
        variant: "destructive",
      });
    }
  };

  const handleRejectCheck = async (checkId: string, notes: string) => {
    try {
      // Here you would implement the API call to reject the check
      console.log('Rejecting check:', checkId, notes);
      toast({
        title: "Check Rejected",
        description: "Vehicle check has been rejected. Driver will be notified.",
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject vehicle check.",
        variant: "destructive",
      });
    }
  };

  const handleViewCheck = (check: any) => {
    setSelectedCheck(check);
    setShowDialog(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Compliance Review Queue</CardTitle>
          <CardDescription>
            Review and approve vehicle inspections for compliance
          </CardDescription>
          
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filter:</span>
            <div className="flex space-x-2">
              {['all', 'compliant', 'warning', 'non_compliant', 'critical'].map((status) => (
                <Button
                  key={status}
                  variant={filter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(status)}
                >
                  {status === 'all' ? 'All' : status.replace('_', ' ').toUpperCase()}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredChecks.map((check) => (
              <div key={check.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-medium">
                      {check.vehicles?.vehicle_number} - {format(new Date(check.check_date), 'MMM dd, yyyy')}
                    </div>
                    <div className="text-sm text-gray-600">
                      Driver: {check.driver_profile ? `${check.driver_profile.first_name} ${check.driver_profile.last_name}` : 'Unknown'}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getComplianceStatusColor(check.compliance_status)}>
                      {check.compliance_status?.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <div className="text-sm font-medium">
                      Score: {check.compliance_score || 'N/A'}/100
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    {check.issues_reported?.length > 0 && (
                      <span className="text-orange-600">
                        {check.issues_reported.length} issue(s) reported
                      </span>
                    )}
                    {check.requires_maintenance && (
                      <span className="text-red-600">
                        Maintenance required ({check.maintenance_priority} priority)
                      </span>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewCheck(check)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Review
                  </Button>
                </div>
              </div>
            ))}

            {filteredChecks.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No vehicle checks found for the selected filter.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <ComplianceCheckDialog
        check={selectedCheck}
        open={showDialog}
        onOpenChange={setShowDialog}
        onApprove={handleApproveCheck}
        onReject={handleRejectCheck}
      />
    </>
  );
};

export default ComplianceChecksList;
