import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  FileText, 
  Shield, 
  Wrench, 
  Car, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Calendar,
  Download,
  Upload,
  Eye,
  Edit,
  Plus,
  Truck,
  Fuel,
  Gauge,
  MapPin,
  User,
  Settings,
  FileCheck,
  Award,
  BookOpen,
  Hammer,
  Zap,
  AlertCircle
} from 'lucide-react';
import { useVehicles } from '@/hooks/useVehicles';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface VehicleDocument {
  id: string;
  name: string;
  type: 'registration' | 'insurance' | 'mot' | 'service' | 'compliance' | 'other';
  status: 'valid' | 'expired' | 'expiring_soon' | 'missing';
  expiryDate?: string;
  fileUrl?: string;
  uploadedAt: string;
  uploadedBy: string;
  notes?: string;
}

interface VehicleMaintenance {
  id: string;
  type: 'service' | 'repair' | 'inspection' | 'emergency';
  date: string;
  mileage: number;
  cost: number;
  description: string;
  performedBy: string;
  nextDueDate?: string;
  status: 'completed' | 'scheduled' | 'overdue';
}

const VehicleDetails = () => {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: vehicles = [], isLoading } = useVehicles();
  const [activeTab, setActiveTab] = useState('overview');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<VehicleDocument | null>(null);

  const vehicle = vehicles.find(v => v.id === vehicleId);

  // Mock data for documents - in real implementation, this would come from the database
  const vehicleDocuments: VehicleDocument[] = [
    {
      id: '1',
      name: 'Vehicle Registration (V5C)',
      type: 'registration',
      status: 'valid',
      expiryDate: '2025-12-31',
      uploadedAt: '2024-01-15',
      uploadedBy: 'Admin User',
      notes: 'Original registration document'
    },
    {
      id: '2',
      name: 'Insurance Certificate',
      type: 'insurance',
      status: 'expiring_soon',
      expiryDate: '2024-03-15',
      uploadedAt: '2024-01-10',
      uploadedBy: 'Admin User',
      notes: 'Comprehensive insurance coverage'
    },
    {
      id: '3',
      name: 'MOT Certificate',
      type: 'mot',
      status: 'valid',
      expiryDate: '2024-11-20',
      uploadedAt: '2023-11-20',
      uploadedBy: 'Admin User',
      notes: 'Annual MOT test certificate'
    },
    {
      id: '4',
      name: 'Service History',
      type: 'service',
      status: 'valid',
      uploadedAt: '2024-01-20',
      uploadedBy: 'Mechanic',
      notes: 'Complete service history log'
    }
  ];

  // Mock maintenance records
  const maintenanceRecords: VehicleMaintenance[] = [
    {
      id: '1',
      type: 'service',
      date: '2024-01-15',
      mileage: 45000,
      cost: 250.00,
      description: 'Annual service - oil change, filters, brake check',
      performedBy: 'ABC Garage',
      nextDueDate: '2025-01-15',
      status: 'completed'
    },
    {
      id: '2',
      type: 'repair',
      date: '2023-12-10',
      mileage: 43000,
      cost: 180.00,
      description: 'Brake pad replacement',
      performedBy: 'ABC Garage',
      status: 'completed'
    }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-lg">Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Vehicle Not Found</h2>
          <p className="text-gray-600 mb-4">The vehicle you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/vehicle-management')}>
            Back to Vehicle Management
          </Button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusColors = {
      active: 'bg-green-100 text-green-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
      out_of_service: 'bg-red-100 text-red-800',
      inactive: 'bg-gray-100 text-gray-800'
    };
    return statusColors[status as keyof typeof statusColors] || statusColors.inactive;
  };

  const getDocumentStatusBadge = (status: string) => {
    const statusColors = {
      valid: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
      expiring_soon: 'bg-yellow-100 text-yellow-800',
      missing: 'bg-gray-100 text-gray-800'
    };
    return statusColors[status as keyof typeof statusColors] || statusColors.missing;
  };

  const getDocumentIcon = (type: string) => {
      const icons = {
    registration: FileText,
    insurance: Shield,
    mot: Award,
    service: Wrench,
    compliance: FileCheck,
    other: FileText
  };
    return icons[type as keyof typeof icons] || FileText;
  };

  const getMaintenanceStatusBadge = (status: string) => {
    const statusColors = {
      completed: 'bg-green-100 text-green-800',
      scheduled: 'bg-blue-100 text-blue-800',
      overdue: 'bg-red-100 text-red-800'
    };
    return statusColors[status as keyof typeof statusColors] || statusColors.completed;
  };

  const getMaintenanceIcon = (type: string) => {
    const icons = {
      service: Wrench,
      repair: Hammer,
      inspection: Eye,
      emergency: AlertTriangle
    };
    return icons[type as keyof typeof icons] || Wrench;
  };

  const handleUploadDocument = () => {
    setShowUploadDialog(true);
  };

  const handleViewDocument = (document: VehicleDocument) => {
    setSelectedDocument(document);
    // In real implementation, this would open the document viewer
    toast.info(`Viewing ${document.name}`);
  };

  const handleEditDocument = (document: VehicleDocument) => {
    // In real implementation, this would open the edit dialog
    toast.info(`Editing ${document.name}`);
  };

  const handleDownloadDocument = (document: VehicleDocument) => {
    // In real implementation, this would trigger download
    toast.success(`Downloading ${document.name}`);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigate('/vehicle-management')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{vehicle.vehicle_number}</h1>
            <p className="text-gray-600">{vehicle.make} {vehicle.model} ({vehicle.year})</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge className={getStatusBadge(vehicle.status)}>
            {vehicle.status.replace('_', ' ').toUpperCase()}
          </Badge>
          <Button 
            variant="outline"
            onClick={() => navigate(`/vehicle-service/${vehicleId}`)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Service
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">License Plate</p>
                <p className="text-2xl font-bold">{vehicle.license_plate}</p>
              </div>
              <Car className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Capacity</p>
                <p className="text-2xl font-bold">{vehicle.capacity || 0}</p>
                <p className="text-sm text-muted-foreground">seats</p>
              </div>
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Documents</p>
                <p className="text-2xl font-bold">{vehicleDocuments.length}</p>
                <p className="text-sm text-muted-foreground">on file</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Service</p>
                <p className="text-2xl font-bold">
                  {maintenanceRecords.length > 0 
                    ? format(new Date(maintenanceRecords[0].date), 'MMM dd')
                    : 'N/A'
                  }
                </p>
                <p className="text-sm text-muted-foreground">maintenance</p>
              </div>
              <Wrench className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Vehicle Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Vehicle Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Make</p>
                    <p className="text-lg">{vehicle.make || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Model</p>
                    <p className="text-lg">{vehicle.model || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Year</p>
                    <p className="text-lg">{vehicle.year || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Type</p>
                    <p className="text-lg capitalize">{vehicle.vehicle_type || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">VIN</p>
                    <p className="text-lg font-mono text-sm">{vehicle.vin || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Fuel Type</p>
                    <p className="text-lg capitalize">{vehicle.fuel_type || 'Not specified'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Current Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Vehicle Status</span>
                    <Badge className={getStatusBadge(vehicle.status)}>
                      {vehicle.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Documents Status</span>
                    <Badge className="bg-green-100 text-green-800">
                      {vehicleDocuments.filter(d => d.status === 'valid').length}/{vehicleDocuments.length} Valid
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Next Service Due</span>
                    <span className="text-sm">
                      {maintenanceRecords.length > 0 && maintenanceRecords[0].nextDueDate
                        ? format(new Date(maintenanceRecords[0].nextDueDate), 'MMM dd, yyyy')
                        : 'Not scheduled'
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <Upload className="h-6 w-6" />
                  <span>Upload Document</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <Wrench className="h-6 w-6" />
                  <span>Schedule Service</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <FileText className="h-6 w-6" />
                  <span>Generate Report</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <Edit className="h-6 w-6" />
                  <span>Edit Details</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Vehicle Documents</h3>
              <p className="text-sm text-muted-foreground">
                Manage all vehicle-related documents and certificates
              </p>
            </div>
            <Button onClick={handleUploadDocument}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicleDocuments.map((document) => {
              const IconComponent = getDocumentIcon(document.type);
              return (
                <Card key={document.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-5 w-5 text-blue-600" />
                        <div>
                          <h4 className="font-medium text-sm">{document.name}</h4>
                          <Badge className={`text-xs ${getDocumentStatusBadge(document.status)}`}>
                            {document.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm text-muted-foreground">
                      {document.expiryDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span>Expires: {format(new Date(document.expiryDate), 'MMM dd, yyyy')}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3" />
                        <span>Uploaded by: {document.uploadedBy}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        <span>Uploaded: {format(new Date(document.uploadedAt), 'MMM dd, yyyy')}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDocument(document)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditDocument(document)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownloadDocument(document)}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Document Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Required Documents Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Legal Documents</h4>
                  <div className="space-y-2">
                    {['Vehicle Registration (V5C)', 'Insurance Certificate', 'MOT Certificate', 'Operator\'s License'].map((doc) => (
                      <div key={doc} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Commercial Vehicle Documents</h4>
                  <div className="space-y-2">
                    {['PSV License', 'Section 19 Permit', 'Accessibility Certificate', 'Safety Inspection Report'].map((doc) => (
                      <div key={doc} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maintenance Tab */}
        <TabsContent value="maintenance" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Maintenance Records</h3>
              <p className="text-sm text-muted-foreground">
                Track service history and maintenance schedules
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Maintenance Record
            </Button>
          </div>

          <div className="space-y-4">
            {maintenanceRecords.map((record) => {
              const IconComponent = getMaintenanceIcon(record.type);
              return (
                <Card key={record.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <IconComponent className="h-5 w-5 text-blue-600 mt-1" />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium capitalize">{record.type}</h4>
                            <Badge className={getMaintenanceStatusBadge(record.status)}>
                              {record.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{record.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Date: {format(new Date(record.date), 'MMM dd, yyyy')}</span>
                            <span>Mileage: {record.mileage.toLocaleString()} km</span>
                            <span>Cost: £{record.cost.toFixed(2)}</span>
                            <span>By: {record.performedBy}</span>
                          </div>
                          {record.nextDueDate && (
                            <div className="flex items-center gap-2 text-xs text-blue-600">
                              <Calendar className="h-3 w-3" />
                              <span>Next due: {format(new Date(record.nextDueDate), 'MMM dd, yyyy')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Maintenance Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Maintenance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Wrench className="h-5 w-5 text-blue-600" />
                    <div>
                      <h4 className="font-medium">Annual Service</h4>
                      <p className="text-sm text-muted-foreground">Oil change, filters, brake check</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">Due: Jan 15, 2025</p>
                    <p className="text-xs text-muted-foreground">~50,000 km</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <h4 className="font-medium">MOT Test</h4>
                      <p className="text-sm text-muted-foreground">Annual vehicle inspection</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">Due: Nov 20, 2024</p>
                    <p className="text-xs text-muted-foreground">~3 months</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Compliance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-medium text-green-800">Legal Compliance</h4>
                  <p className="text-2xl font-bold text-green-600">100%</p>
                  <p className="text-sm text-green-600">All documents valid</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <FileCheck className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-medium text-blue-800">Safety Standards</h4>
                  <p className="text-2xl font-bold text-blue-600">95%</p>
                  <p className="text-sm text-blue-600">1 item pending</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <AlertTriangle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <h4 className="font-medium text-yellow-800">Maintenance</h4>
                  <p className="text-2xl font-bold text-yellow-600">85%</p>
                  <p className="text-sm text-yellow-600">Service due soon</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Compliance Checklist</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    {[
                      'Vehicle Registration Valid',
                      'Insurance Certificate Current',
                      'MOT Certificate Valid',
                      'Operator License Active',
                      'PSV License (if applicable)'
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    {[
                      'Safety Inspection Passed',
                      'Accessibility Certificate Valid',
                      'Fire Extinguisher Certificate',
                      'Emergency Procedures Documented',
                      'Driver Training Records Updated'
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <h4 className="font-medium">Vehicle Added to Fleet</h4>
                      <p className="text-sm text-muted-foreground">Vehicle registered in system</p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(vehicle.created_at), 'MMM dd, yyyy')}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <h4 className="font-medium">First Service Completed</h4>
                      <p className="text-sm text-muted-foreground">Initial maintenance check</p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">Jan 15, 2024</span>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div>
                      <h4 className="font-medium">MOT Test Passed</h4>
                      <p className="text-sm text-muted-foreground">Annual inspection completed</p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">Nov 20, 2023</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Document Expiry Alerts</h4>
                    <p className="text-sm text-muted-foreground">Get notified before documents expire</p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Maintenance Reminders</h4>
                    <p className="text-sm text-muted-foreground">Set up service schedule alerts</p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Compliance Reporting</h4>
                    <p className="text-sm text-muted-foreground">Generate compliance reports</p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VehicleDetails;