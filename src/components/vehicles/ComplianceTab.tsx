import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  TrendingUp,
  Car,
  Wrench,
  Award,
  Scale,
  Database,
  Eye,
  Download,
  Plus,
  Search,
  Filter,
  Settings,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Lock
} from 'lucide-react';
import { format } from 'date-fns';

interface ComplianceData {
  orvDeclarations: {
    id: string;
    vehicleId: string;
    vehicleNumber: string;
    vehicleName: string;
    vehicleImage?: string;
    declarationType: 'planned' | 'unplanned';
    startDate: string;
    endDate: string;
    reason: string;
    status: 'active' | 'expired' | 'returned';
    documents: string[];
    watchers?: string[];
    priority?: string;
    totalCost?: number;
    isLocked?: boolean;
  }[];
  borReturns: {
    id: string;
    vehicleId: string;
    vehicleNumber: string;
    vehicleName: string;
    vehicleImage?: string;
    returnDate: string;
    inspectionRequired: boolean;
    inspectionCompleted: boolean;
    roadworthinessCheck: boolean;
    status: 'pending' | 'completed' | 'failed';
    watchers?: string[];
    priority?: string;
    totalCost?: number;
    isLocked?: boolean;
  }[];
  documentCompliance: {
    id: string;
    vehicleId: string;
    vehicleNumber: string;
    vehicleName: string;
    vehicleImage?: string;
    documentType: string;
    documentName: string;
    expiryDate: string;
    status: 'valid' | 'expiring_soon' | 'expired';
    daysUntilExpiry: number;
    watchers?: string[];
    priority?: string;
    totalCost?: number;
    isLocked?: boolean;
  }[];
  regulatoryCompliance: {
    id: string;
    vehicleId: string;
    vehicleNumber: string;
    vehicleName: string;
    vehicleImage?: string;
    regulation: string;
    requirement: string;
    lastCheck: string;
    nextCheck: string;
    status: 'compliant' | 'non_compliant' | 'pending';
    notes: string;
    watchers?: string[];
    priority?: string;
    totalCost?: number;
    isLocked?: boolean;
  }[];
}

const ComplianceTab: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Mock compliance data
  const complianceData: ComplianceData = {
    orvDeclarations: [
      {
        id: 'orv-1',
        vehicleId: 'v1',
        vehicleNumber: 'BUS001',
        vehicleName: '2016 Ford F-150',
        declarationType: 'planned',
        startDate: '2024-08-15',
        endDate: '2024-09-15',
        reason: 'Scheduled maintenance',
        status: 'active',
        documents: ['Maintenance Schedule', 'Safety Certificate'],
        totalCost: 1250.00,
        isLocked: false
      },
      {
        id: 'orv-2',
        vehicleId: 'v2',
        vehicleNumber: 'NBG-001',
        vehicleName: '2014 Chevrolet Express Cargo',
        declarationType: 'unplanned',
        startDate: '2024-08-20',
        endDate: '2024-08-25',
        reason: 'Emergency repair',
        status: 'active',
        documents: ['Repair Authorization', 'Parts Invoice'],
        totalCost: 850.00,
        isLocked: true
      }
    ],
    borReturns: [
      {
        id: 'bor-1',
        vehicleId: 'v1',
        vehicleNumber: 'BUS001',
        vehicleName: '2016 Ford F-150',
        returnDate: '2024-09-15',
        inspectionRequired: true,
        inspectionCompleted: true,
        roadworthinessCheck: true,
        status: 'completed',
        totalCost: 150.00
      }
    ],
    documentCompliance: [
      {
        id: 'doc-1',
        vehicleId: 'v1',
        vehicleNumber: 'BUS001',
        vehicleName: '2016 Ford F-150',
        documentType: 'Registration',
        documentName: 'Vehicle Registration Certificate',
        expiryDate: '2025-01-15',
        status: 'valid',
        daysUntilExpiry: 120,
        totalCost: 0
      },
      {
        id: 'doc-2',
        vehicleId: 'v2',
        vehicleNumber: 'NBG-001',
        vehicleName: '2014 Chevrolet Express Cargo',
        documentType: 'Insurance',
        documentName: 'Commercial Vehicle Insurance',
        expiryDate: '2024-12-01',
        status: 'expiring_soon',
        daysUntilExpiry: 30,
        totalCost: 0
      }
    ],
    regulatoryCompliance: [
      {
        id: 'reg-1',
        vehicleId: 'v1',
        vehicleNumber: 'BUS001',
        vehicleName: '2016 Ford F-150',
        regulation: 'PSV Regulations',
        requirement: 'Annual Safety Inspection',
        lastCheck: '2024-01-15',
        nextCheck: '2025-01-15',
        status: 'compliant',
        notes: 'All requirements met',
        totalCost: 200.00
      }
    ]
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'valid':
      case 'compliant':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'expired':
      case 'non_compliant':
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'expiring_soon':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'valid':
      case 'compliant':
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'expired':
      case 'non_compliant':
      case 'failed':
        return <AlertTriangle className="w-4 h-4" />;
      case 'expiring_soon':
      case 'pending':
        return <Clock className="w-4 h-4" />;
      default:
        return <Database className="w-4 h-4" />;
    }
  };

  const renderVehicleCell = (item: any) => (
    <div className="flex items-center space-x-3">
      <Checkbox />
      <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
        <Car className="w-4 h-4 text-gray-600" />
      </div>
      <div className="flex items-center space-x-2">
        <span className="font-medium">{item.vehicleNumber}</span>
        <span className="text-gray-500">[{item.vehicleName}]</span>
        {item.isLocked && <Lock className="w-3 h-3 text-gray-400" />}
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      </div>
    </div>
  );

  const renderTable = (data: any[], columns: any[]) => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
          <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Vehicle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Vehicles</SelectItem>
              <SelectItem value="bus001">BUS001</SelectItem>
              <SelectItem value="nbg001">NBG-001</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
          <Select defaultValue="save-view">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="save-view">Save View</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Compliance Records</CardTitle>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>1 - {data.length} of {data.length}</span>
            <Button variant="outline" size="sm" disabled>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" disabled>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column.key}>{column.label}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id}>
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      {column.render ? column.render(item) : item[column.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const orvColumns = [
    { key: 'vehicle', label: 'Vehicle', render: renderVehicleCell },
    { key: 'startDate', label: 'Declaration Start Date', render: (item: any) => format(new Date(item.startDate), 'MM/dd/yyyy h:mm a') },
    { key: 'watchers', label: 'Watchers', render: () => '-' },
    { key: 'priority', label: 'Priority', render: () => '-' },
    { key: 'declarationType', label: 'Declaration Type', render: (item: any) => item.declarationType.charAt(0).toUpperCase() + item.declarationType.slice(1) },
    { key: 'reason', label: 'Reason', render: (item: any) => item.reason },
    { key: 'status', label: 'Status', render: (item: any) => (
      <Badge className={getStatusColor(item.status)}>
        {getStatusIcon(item.status)}
        <span className="ml-1">{item.status}</span>
      </Badge>
    )},
    { key: 'totalCost', label: 'Total', render: (item: any) => item.totalCost ? `$${item.totalCost.toFixed(2)}` : '-' }
  ];

  const borColumns = [
    { key: 'vehicle', label: 'Vehicle', render: renderVehicleCell },
    { key: 'returnDate', label: 'Return Date', render: (item: any) => format(new Date(item.returnDate), 'MM/dd/yyyy h:mm a') },
    { key: 'watchers', label: 'Watchers', render: () => '-' },
    { key: 'priority', label: 'Priority', render: () => '-' },
    { key: 'inspectionRequired', label: 'Inspection Required', render: (item: any) => item.inspectionRequired ? 'Yes' : 'No' },
    { key: 'inspectionCompleted', label: 'Inspection Completed', render: (item: any) => item.inspectionCompleted ? 'Yes' : 'No' },
    { key: 'status', label: 'Status', render: (item: any) => (
      <Badge className={getStatusColor(item.status)}>
        {getStatusIcon(item.status)}
        <span className="ml-1">{item.status}</span>
      </Badge>
    )},
    { key: 'totalCost', label: 'Total', render: (item: any) => item.totalCost ? `$${item.totalCost.toFixed(2)}` : '-' }
  ];

  const documentColumns = [
    { key: 'vehicle', label: 'Vehicle', render: renderVehicleCell },
    { key: 'expiryDate', label: 'Expiry Date', render: (item: any) => format(new Date(item.expiryDate), 'MM/dd/yyyy') },
    { key: 'watchers', label: 'Watchers', render: () => '-' },
    { key: 'priority', label: 'Priority', render: () => '-' },
    { key: 'documentType', label: 'Document Type', render: (item: any) => item.documentType },
    { key: 'documentName', label: 'Document Name', render: (item: any) => item.documentName },
    { key: 'status', label: 'Status', render: (item: any) => (
      <Badge className={getStatusColor(item.status)}>
        {getStatusIcon(item.status)}
        <span className="ml-1">{item.status}</span>
      </Badge>
    )},
    { key: 'totalCost', label: 'Total', render: (item: any) => item.totalCost ? `$${item.totalCost.toFixed(2)}` : '-' }
  ];

  const regulatoryColumns = [
    { key: 'vehicle', label: 'Vehicle', render: renderVehicleCell },
    { key: 'nextCheck', label: 'Next Check Date', render: (item: any) => format(new Date(item.nextCheck), 'MM/dd/yyyy') },
    { key: 'watchers', label: 'Watchers', render: () => '-' },
    { key: 'priority', label: 'Priority', render: () => '-' },
    { key: 'regulation', label: 'Regulation', render: (item: any) => item.regulation },
    { key: 'requirement', label: 'Requirement', render: (item: any) => item.requirement },
    { key: 'status', label: 'Status', render: (item: any) => (
      <Badge className={getStatusColor(item.status)}>
        {getStatusIcon(item.status)}
        <span className="ml-1">{item.status}</span>
      </Badge>
    )},
    { key: 'totalCost', label: 'Total', render: (item: any) => item.totalCost ? `$${item.totalCost.toFixed(2)}` : '-' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold">Compliance</h2>
          <Button variant="link" className="text-blue-600">Learn</Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Compliance Entry
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-4 border-b">
        <Button variant="ghost" className={activeSubTab === 'overview' ? 'border-b-2 border-blue-600' : ''} onClick={() => setActiveSubTab('overview')}>
          All
        </Button>
        <Button variant="ghost" className={activeSubTab === 'orv' ? 'border-b-2 border-blue-600' : ''} onClick={() => setActiveSubTab('orv')}>
          ORV Declarations
        </Button>
        <Button variant="ghost" className={activeSubTab === 'bor' ? 'border-b-2 border-blue-600' : ''} onClick={() => setActiveSubTab('bor')}>
          BOR Returns
        </Button>
        <Button variant="ghost" className={activeSubTab === 'documents' ? 'border-b-2 border-blue-600' : ''} onClick={() => setActiveSubTab('documents')}>
          Documents
        </Button>
        <Button variant="ghost" className={activeSubTab === 'regulatory' ? 'border-b-2 border-blue-600' : ''} onClick={() => setActiveSubTab('regulatory')}>
          Regulatory
        </Button>
        <Button variant="ghost">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="sm">
          + Add Tab
        </Button>
      </div>

      {/* Content based on active sub-tab */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Recent ORV Declarations */}
          <Card>
            <CardHeader>
              <CardTitle>Recent ORV Declarations</CardTitle>
            </CardHeader>
            <CardContent>
              {renderTable(complianceData.orvDeclarations, orvColumns)}
            </CardContent>
          </Card>
        </div>
      )}

      {activeSubTab === 'orv' && renderTable(complianceData.orvDeclarations, orvColumns)}
      {activeSubTab === 'bor' && renderTable(complianceData.borReturns, borColumns)}
      {activeSubTab === 'documents' && renderTable(complianceData.documentCompliance, documentColumns)}
      {activeSubTab === 'regulatory' && renderTable(complianceData.regulatoryCompliance, regulatoryColumns)}
    </div>
  );
};

export default ComplianceTab;
