import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText, 
  TrendingUp, 
  Calendar,
  Users,
  Car,
  Wrench,
  Award,
  Scale,
  Database,
  Eye,
  Download,
  Plus
} from 'lucide-react';
import { format } from 'date-fns';

interface ComplianceData {
  // ORV (Off Road Vehicle) Compliance
  orvDeclarations: {
    id: string;
    vehicleId: string;
    vehicleNumber: string;
    declarationType: 'planned' | 'unplanned';
    startDate: string;
    endDate: string;
    reason: string;
    status: 'active' | 'expired' | 'returned';
    documents: string[];
  }[];
  
  // BOR (Back On Road) Compliance
  borReturns: {
    id: string;
    vehicleId: string;
    vehicleNumber: string;
    returnDate: string;
    inspectionRequired: boolean;
    inspectionCompleted: boolean;
    roadworthinessCheck: boolean;
    status: 'pending' | 'completed' | 'failed';
  }[];
  
  // Document Compliance
  documentCompliance: {
    id: string;
    vehicleId: string;
    vehicleNumber: string;
    documentType: string;
    documentName: string;
    expiryDate: string;
    status: 'valid' | 'expiring_soon' | 'expired';
    daysUntilExpiry: number;
  }[];
  
  // Regulatory Compliance
  regulatoryCompliance: {
    id: string;
    vehicleId: string;
    vehicleNumber: string;
    regulation: string;
    requirement: string;
    lastCheck: string;
    nextCheck: string;
    status: 'compliant' | 'non_compliant' | 'pending';
    notes: string;
  }[];
  
  // Compliance Statistics
  stats: {
    totalVehicles: number;
    compliantVehicles: number;
    nonCompliantVehicles: number;
    orvVehicles: number;
    borPending: number;
    documentsExpiringSoon: number;
    documentsExpired: number;
    overallComplianceRate: number;
  };
}

const ComplianceTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState('overview');

  // Mock compliance data
  const complianceData: ComplianceData = {
    orvDeclarations: [
      {
        id: 'orv-1',
        vehicleId: 'v1',
        vehicleNumber: 'BUS001',
        declarationType: 'planned',
        startDate: '2024-08-01',
        endDate: '2024-08-15',
        reason: 'Annual maintenance and inspection',
        status: 'active',
        documents: ['Maintenance Schedule', 'Inspection Report']
      },
      {
        id: 'orv-2',
        vehicleId: 'v2',
        vehicleNumber: 'BUS002',
        declarationType: 'unplanned',
        startDate: '2024-08-10',
        endDate: '2024-08-20',
        reason: 'Engine fault - awaiting parts',
        status: 'active',
        documents: ['Defect Report', 'Repair Authorization']
      }
    ],
    
    borReturns: [
      {
        id: 'bor-1',
        vehicleId: 'v1',
        vehicleNumber: 'BUS001',
        returnDate: '2024-08-16',
        inspectionRequired: true,
        inspectionCompleted: true,
        roadworthinessCheck: true,
        status: 'completed'
      },
      {
        id: 'bor-2',
        vehicleId: 'v2',
        vehicleNumber: 'BUS002',
        returnDate: '2024-08-21',
        inspectionRequired: true,
        inspectionCompleted: false,
        roadworthinessCheck: false,
        status: 'pending'
      }
    ],
    
    documentCompliance: [
      {
        id: 'doc-1',
        vehicleId: 'v1',
        vehicleNumber: 'BUS001',
        documentType: 'MOT Certificate',
        documentName: 'MOT Test Certificate',
        expiryDate: '2024-12-15',
        status: 'valid',
        daysUntilExpiry: 108
      },
      {
        id: 'doc-2',
        vehicleId: 'v2',
        vehicleNumber: 'BUS002',
        documentType: 'Insurance',
        documentName: 'Motor Vehicle Insurance',
        expiryDate: '2024-09-30',
        status: 'expiring_soon',
        daysUntilExpiry: 32
      },
      {
        id: 'doc-3',
        vehicleId: 'v3',
        vehicleNumber: 'BUS003',
        documentType: 'PSV License',
        documentName: 'Public Service Vehicle License',
        expiryDate: '2024-08-15',
        status: 'expired',
        daysUntilExpiry: -5
      }
    ],
    
    regulatoryCompliance: [
      {
        id: 'reg-1',
        vehicleId: 'v1',
        vehicleNumber: 'BUS001',
        regulation: 'DVSA Walkaround Check',
        requirement: 'Daily pre-use inspection',
        lastCheck: '2024-08-28',
        nextCheck: '2024-08-29',
        status: 'compliant',
        notes: 'All checks completed satisfactorily'
      },
      {
        id: 'reg-2',
        vehicleId: 'v2',
        vehicleNumber: 'BUS002',
        regulation: 'Tachograph Calibration',
        requirement: '2-year calibration check',
        lastCheck: '2024-06-15',
        nextCheck: '2026-06-15',
        status: 'compliant',
        notes: 'Calibration certificate valid'
      },
      {
        id: 'reg-3',
        vehicleId: 'v3',
        vehicleNumber: 'BUS003',
        regulation: 'Annual Test',
        requirement: 'Annual roadworthiness test',
        lastCheck: '2024-03-20',
        nextCheck: '2025-03-20',
        status: 'compliant',
        notes: 'Passed with no advisories'
      }
    ],
    
    stats: {
      totalVehicles: 15,
      compliantVehicles: 12,
      nonCompliantVehicles: 3,
      orvVehicles: 2,
      borPending: 1,
      documentsExpiringSoon: 3,
      documentsExpired: 1,
      overallComplianceRate: 80
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
      case 'compliant':
      case 'valid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
      case 'expiring_soon':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'expired':
      case 'non_compliant':
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
      case 'compliant':
      case 'valid':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
      case 'expiring_soon':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'expired':
      case 'non_compliant':
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Compliance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overall Compliance</p>
                <p className="text-2xl font-bold">{complianceData.stats.overallComplianceRate}%</p>
              </div>
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <Progress value={complianceData.stats.overallComplianceRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Compliant Vehicles</p>
                <p className="text-2xl font-bold text-green-600">
                  {complianceData.stats.compliantVehicles}/{complianceData.stats.totalVehicles}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ORV Vehicles</p>
                <p className="text-2xl font-bold text-yellow-600">{complianceData.stats.orvVehicles}</p>
              </div>
              <Wrench className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Documents Expiring</p>
                <p className="text-2xl font-bold text-red-600">{complianceData.stats.documentsExpiringSoon}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="orv" className="flex items-center gap-2">
            <Car className="w-4 h-4" />
            ORV Declarations
          </TabsTrigger>
          <TabsTrigger value="bor" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            BOR Returns
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="regulatory" className="flex items-center gap-2">
            <Scale className="w-4 h-4" />
            Regulatory
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent ORV Declarations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="w-5 h-5" />
                  Recent ORV Declarations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {complianceData.orvDeclarations.slice(0, 3).map((orv) => (
                    <div key={orv.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{orv.vehicleNumber}</p>
                        <p className="text-sm text-gray-600">{orv.reason}</p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(orv.startDate), 'MMM dd')} - {format(new Date(orv.endDate), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <Badge className={getStatusColor(orv.status)}>
                        {orv.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pending BOR Returns */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Pending BOR Returns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {complianceData.borReturns.filter(bor => bor.status === 'pending').map((bor) => (
                    <div key={bor.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{bor.vehicleNumber}</p>
                        <p className="text-sm text-gray-600">Return: {format(new Date(bor.returnDate), 'MMM dd, yyyy')}</p>
                        <p className="text-xs text-gray-500">
                          {bor.inspectionRequired ? 'Inspection Required' : 'No Inspection Required'}
                        </p>
                      </div>
                      <Badge className={getStatusColor(bor.status)}>
                        {bor.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Expiring Documents Alert */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Documents Requiring Attention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Document</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Days Left</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complianceData.documentCompliance
                    .filter(doc => doc.status !== 'valid')
                    .map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.vehicleNumber}</TableCell>
                      <TableCell>{doc.documentName}</TableCell>
                      <TableCell>{format(new Date(doc.expiryDate), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        <span className={doc.daysUntilExpiry < 0 ? 'text-red-600' : 'text-yellow-600'}>
                          {doc.daysUntilExpiry < 0 ? `${Math.abs(doc.daysUntilExpiry)} days overdue` : `${doc.daysUntilExpiry} days`}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(doc.status)}>
                          {doc.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ORV Declarations Tab */}
        <TabsContent value="orv" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Off Road Vehicle Declarations</h3>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New ORV Declaration
            </Button>
          </div>
          
          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complianceData.orvDeclarations.map((orv) => (
                    <TableRow key={orv.id}>
                      <TableCell className="font-medium">{orv.vehicleNumber}</TableCell>
                      <TableCell>
                        <Badge variant={orv.declarationType === 'planned' ? 'default' : 'secondary'}>
                          {orv.declarationType}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(new Date(orv.startDate), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{format(new Date(orv.endDate), 'MMM dd, yyyy')}</TableCell>
                      <TableCell className="max-w-xs truncate">{orv.reason}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(orv.status)}>
                          {orv.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BOR Returns Tab */}
        <TabsContent value="bor" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Back On Road Returns</h3>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New BOR Return
            </Button>
          </div>
          
          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Return Date</TableHead>
                    <TableHead>Inspection Required</TableHead>
                    <TableHead>Inspection Completed</TableHead>
                    <TableHead>Roadworthiness</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complianceData.borReturns.map((bor) => (
                    <TableRow key={bor.id}>
                      <TableCell className="font-medium">{bor.vehicleNumber}</TableCell>
                      <TableCell>{format(new Date(bor.returnDate), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        <Badge variant={bor.inspectionRequired ? 'default' : 'secondary'}>
                          {bor.inspectionRequired ? 'Yes' : 'No'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={bor.inspectionCompleted ? 'default' : 'secondary'}>
                          {bor.inspectionCompleted ? 'Yes' : 'No'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={bor.roadworthinessCheck ? 'default' : 'secondary'}>
                          {bor.roadworthinessCheck ? 'Passed' : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(bor.status)}>
                          {bor.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Document Compliance</h3>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
          </div>
          
          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Document Type</TableHead>
                    <TableHead>Document Name</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Days Left</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complianceData.documentCompliance.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">{doc.vehicleNumber}</TableCell>
                      <TableCell>{doc.documentType}</TableCell>
                      <TableCell>{doc.documentName}</TableCell>
                      <TableCell>{format(new Date(doc.expiryDate), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        <span className={doc.daysUntilExpiry < 0 ? 'text-red-600' : doc.daysUntilExpiry < 30 ? 'text-yellow-600' : 'text-green-600'}>
                          {doc.daysUntilExpiry < 0 ? `${Math.abs(doc.daysUntilExpiry)} days overdue` : `${doc.daysUntilExpiry} days`}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(doc.status)}>
                          {doc.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Regulatory Compliance Tab */}
        <TabsContent value="regulatory" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Regulatory Compliance</h3>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Compliance Check
            </Button>
          </div>
          
          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Regulation</TableHead>
                    <TableHead>Requirement</TableHead>
                    <TableHead>Last Check</TableHead>
                    <TableHead>Next Check</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complianceData.regulatoryCompliance.map((reg) => (
                    <TableRow key={reg.id}>
                      <TableCell className="font-medium">{reg.vehicleNumber}</TableCell>
                      <TableCell>{reg.regulation}</TableCell>
                      <TableCell className="max-w-xs truncate">{reg.requirement}</TableCell>
                      <TableCell>{format(new Date(reg.lastCheck), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{format(new Date(reg.nextCheck), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(reg.status)}>
                          {reg.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComplianceTab;
