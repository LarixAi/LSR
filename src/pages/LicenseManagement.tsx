import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  CheckCircle, 
  FileText, 
  Users, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  Clock,
  Shield,
  Activity,
  AlertCircle
} from 'lucide-react';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { useLicenses, useLicenseStats, useExpiringLicenses, useDeleteLicense, DriverLicense } from '@/hooks/useLicenses';
import AddLicenseDialog from '@/components/licenses/AddLicenseDialog';
import LicenseComplianceChecker from '@/components/licenses/LicenseComplianceChecker';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';

const LicenseManagement = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [licenseTypeFilter, setLicenseTypeFilter] = useState<string>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<DriverLicense | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Fetch data
  const { data: licenses, isLoading: licensesLoading } = useLicenses(profile?.organization_id);
  const { data: stats } = useLicenseStats(profile?.organization_id);
  const { data: expiringLicenses } = useExpiringLicenses(profile?.organization_id, 30);
  const deleteLicense = useDeleteLicense();

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

  // Filter licenses
  const filteredLicenses = licenses?.filter(license => {
    const matchesSearch = license.driver_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         license.license_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         license.issuing_authority.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || license.status === statusFilter;
    const matchesType = licenseTypeFilter === 'all' || license.license_type === licenseTypeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  }) || [];

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'suspended': return 'bg-yellow-100 text-yellow-800';
      case 'revoked': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'expired': return <AlertTriangle className="w-4 h-4" />;
      case 'suspended': return <Clock className="w-4 h-4" />;
      case 'revoked': return <Shield className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryStatus = (expiryDate: string) => {
    const daysUntilExpiry = getDaysUntilExpiry(expiryDate);
    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry <= 30) return 'expiring-soon';
    if (daysUntilExpiry <= 90) return 'expiring-warning';
    return 'valid';
  };

  const handleDeleteLicense = async (licenseId: string) => {
    if (window.confirm('Are you sure you want to delete this license? This action cannot be undone.')) {
      try {
        await deleteLicense.mutateAsync(licenseId);
        toast.success('License deleted successfully');
      } catch (error) {
        toast.error('Failed to delete license');
      }
    }
  };

  const handleViewLicense = (license: DriverLicense) => {
    // Navigate to driver profile page with documents tab focus
    navigate(`/drivers/${license.driver_id}?tab=documents&licenseId=${license.id}`);
  };

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">License Management</h1>
        <p className="text-gray-600">Manage driver licenses, renewals, and compliance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Licenses</p>
                <p className="text-2xl font-bold">{stats?.total || 0}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats?.active || 0}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                <p className="text-2xl font-bold text-yellow-600">{stats?.expiringSoon || 0}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expired</p>
                <p className="text-2xl font-bold text-red-600">{stats?.expired || 0}</p>
              </div>
              <Users className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex flex-col md:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search licenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="revoked">Revoked</SelectItem>
            </SelectContent>
          </Select>

          <Select value={licenseTypeFilter} onValueChange={setLicenseTypeFilter}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="CDL-A">CDL-A</SelectItem>
              <SelectItem value="CDL-B">CDL-B</SelectItem>
              <SelectItem value="CDL-C">CDL-C</SelectItem>
              <SelectItem value="Regular">Regular</SelectItem>
              <SelectItem value="Provisional">Provisional</SelectItem>
              <SelectItem value="Learner">Learner</SelectItem>
              <SelectItem value="International">International</SelectItem>
              <SelectItem value="International-Permit">International Permit</SelectItem>
              <SelectItem value="Motorcycle">Motorcycle</SelectItem>
              <SelectItem value="Heavy-Vehicle">Heavy Vehicle</SelectItem>
              <SelectItem value="Bus-D">Bus</SelectItem>
              <SelectItem value="Coach">Coach</SelectItem>
              <SelectItem value="School-Bus">School Bus</SelectItem>
              <SelectItem value="Hazmat">Hazmat</SelectItem>
              <SelectItem value="Tanker">Tanker</SelectItem>
              <SelectItem value="Passenger">Passenger</SelectItem>
              <SelectItem value="Taxi">Taxi</SelectItem>
              <SelectItem value="Private-Hire">Private Hire</SelectItem>
              <SelectItem value="Agricultural">Agricultural</SelectItem>
              <SelectItem value="Military">Military</SelectItem>
              <SelectItem value="Emergency">Emergency</SelectItem>
              <SelectItem value="Police">Police</SelectItem>
              <SelectItem value="Fire">Fire</SelectItem>
              <SelectItem value="Ambulance">Ambulance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add License
        </Button>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Licenses ({filteredLicenses.length})</TabsTrigger>
          <TabsTrigger value="expiring">Expiring Soon ({expiringLicenses?.length || 0})</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Check</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Driver Licenses</CardTitle>
              <CardDescription>
                Manage all driver licenses in your organization
              </CardDescription>
            </CardHeader>
            <CardContent>
              {licensesLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                  <p>Loading licenses...</p>
                </div>
              ) : filteredLicenses.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Driver</TableHead>
                      <TableHead>License Number</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Days Left</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLicenses.map((license) => {
                      const daysUntilExpiry = getDaysUntilExpiry(license.expiry_date);
                      const expiryStatus = getExpiryStatus(license.expiry_date);
                      
                      return (
                        <TableRow key={license.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{license.driver_name}</div>
                              <div className="text-sm text-gray-500">{license.driver_email}</div>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono">{license.license_number}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{license.license_type}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(license.status)}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(license.status)}
                                {license.status}
                              </div>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              {format(new Date(license.expiry_date), 'MMM dd, yyyy')}
                            </div>
                          </TableCell>
                          <TableCell>
                            {daysUntilExpiry >= 0 ? (
                              <Badge 
                                variant={expiryStatus === 'expiring-soon' ? 'destructive' : 
                                        expiryStatus === 'expiring-warning' ? 'secondary' : 'default'}
                              >
                                {daysUntilExpiry} days
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                Expired {Math.abs(daysUntilExpiry)} days ago
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewLicense(license)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteLicense(license.id)}
                                disabled={deleteLicense.isPending}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No licenses found</p>
                  <Button 
                    onClick={() => setIsAddDialogOpen(true)} 
                    className="mt-4"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add First License
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expiring">
          <Card>
            <CardHeader>
              <CardTitle>Licenses Expiring Soon</CardTitle>
              <CardDescription>
                Licenses that will expire within the next 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              {expiringLicenses && expiringLicenses.length > 0 ? (
                <div className="space-y-4">
                  {expiringLicenses.map((license) => {
                    const daysUntilExpiry = getDaysUntilExpiry(license.expiry_date);
                    
                    return (
                      <div key={license.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{license.driver_name}</h4>
                            <p className="text-sm text-gray-600">
                              {license.license_type} - {license.license_number}
                            </p>
                            <p className="text-sm text-gray-600">
                              Issued by: {license.issuing_authority}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant="destructive" className="mb-2">
                              <AlertCircle className="w-4 h-4 mr-1" />
                              {daysUntilExpiry} days left
                            </Badge>
                            <p className="text-sm text-gray-600">
                              Expires: {format(new Date(license.expiry_date), 'MMM dd, yyyy')}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 mx-auto text-green-400 mb-4" />
                  <p className="text-gray-500">No licenses expiring soon</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
          <LicenseComplianceChecker 
            licenses={licenses || []} 
            onRefresh={() => {
              // This will trigger a refetch of the licenses data
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Add License Dialog */}
      <AddLicenseDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen} 
      />

      {/* View License Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl" aria-describedby="license-details-desc">
          <DialogHeader>
            <DialogTitle>License Details</DialogTitle>
            <DialogDescription id="license-details-desc">
              Complete information about the selected license
            </DialogDescription>
          </DialogHeader>
          
          {selectedLicense && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Driver</Label>
                  <p className="font-medium">{selectedLicense.driver_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">License Number</Label>
                  <p className="font-mono">{selectedLicense.license_number}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Type</Label>
                  <Badge variant="outline">{selectedLicense.license_type}</Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <Badge className={getStatusColor(selectedLicense.status)}>
                    {selectedLicense.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Issuing Authority</Label>
                  <p>{selectedLicense.issuing_authority}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">License Class</Label>
                  <p>{selectedLicense.license_class || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Issue Date</Label>
                  <p>{format(new Date(selectedLicense.issue_date), 'MMM dd, yyyy')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Expiry Date</Label>
                  <p>{format(new Date(selectedLicense.expiry_date), 'MMM dd, yyyy')}</p>
                </div>
              </div>

              {/* Endorsements and Restrictions */}
              {selectedLicense.endorsements && selectedLicense.endorsements.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Endorsements</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedLicense.endorsements.map((endorsement) => (
                      <Badge key={endorsement} variant="secondary">
                        {endorsement}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedLicense.restrictions && selectedLicense.restrictions.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Restrictions</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedLicense.restrictions.map((restriction) => (
                      <Badge key={restriction} variant="destructive">
                        {restriction}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Expiry Dates */}
              <div className="grid grid-cols-2 gap-4">
                {selectedLicense.medical_certificate_expiry && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Medical Certificate Expiry</Label>
                    <p>{format(new Date(selectedLicense.medical_certificate_expiry), 'MMM dd, yyyy')}</p>
                  </div>
                )}
                {selectedLicense.background_check_expiry && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Background Check Expiry</Label>
                    <p>{format(new Date(selectedLicense.background_check_expiry), 'MMM dd, yyyy')}</p>
                  </div>
                )}
                {selectedLicense.drug_test_expiry && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Drug Test Expiry</Label>
                    <p>{format(new Date(selectedLicense.drug_test_expiry), 'MMM dd, yyyy')}</p>
                  </div>
                )}
                {selectedLicense.training_expiry && (
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Training Expiry</Label>
                    <p>{format(new Date(selectedLicense.training_expiry), 'MMM dd, yyyy')}</p>
                  </div>
                )}
              </div>

              {/* Notes */}
              {selectedLicense.notes && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Notes</Label>
                  <p className="mt-2 text-sm">{selectedLicense.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LicenseManagement;