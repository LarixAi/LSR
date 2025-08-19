import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useInfringementStats, useInfringements } from '@/hooks/useInfringements';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Scale, 
  Plus, 
  Search, 
  AlertTriangle, 
  FileText,
  Calendar,
  TrendingUp,
  DollarSign,
  Eye,
  Download
} from 'lucide-react';

const InfringementManagement = () => {
  const { user, profile, loading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // Fetch real data from backend
  const { data: infringements = [], isLoading: infringementsLoading } = useInfringements();
  const infringementStats = useInfringementStats();

  if (loading || infringementsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-lg">Loading infringement management...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/auth" replace />;
  }

  // Only admins and council can access
  if (!['admin', 'council'].includes(profile.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Filter infringements based on search and driver selection
  const filteredInfringements = infringements.filter(inf => {
    const matchesSearch = !searchTerm || 
      inf.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inf.driver?.first_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inf.driver?.last_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inf.vehicle?.vehicle_number || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDriver = !selectedDriver || inf.driver_id === selectedDriver;
    
    return matchesSearch && matchesDriver;
  });

  const driverSummary = [
    {
      driverId: '1',
      driverName: 'John Smith',
      totalInfringements: 3,
      totalPoints: 9,
      totalFines: 450.00,
      riskLevel: 'high'
    },
    {
      driverId: '2',
      driverName: 'Sarah Johnson',
      totalInfringements: 1,
      totalPoints: 0,
      totalFines: 80.00,
      riskLevel: 'low'
    },
    {
      driverId: '3',
      driverName: 'Mike Davis',
      totalInfringements: 2,
      totalPoints: 6,
      totalFines: 380.00,
      riskLevel: 'medium'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>;
      case 'disputed':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Disputed</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Overdue</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRiskLevelBadge = (level: string) => {
    switch (level) {
      case 'low':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Low Risk</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Medium Risk</Badge>;
      case 'high':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">High Risk</Badge>;
      default:
        return <Badge variant="secondary">{level}</Badge>;
    }
  };

  // Use real statistics from the hook
  const totalFines = infringementStats.total_fines;
  const pendingFines = infringements.filter(inf => inf.status === 'pending').reduce((sum, inf) => sum + (inf.fine_amount || 0), 0);
  const totalPoints = infringementStats.total_points;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Scale className="w-8 h-8 text-red-600" />
            Infringement Management
          </h1>
          <p className="text-gray-600 mt-1">Track and manage driver infringements and violations</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700">
              <Plus className="w-4 h-4 mr-2" />
              Record Infringement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Record New Infringement</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="driver">Driver</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select driver" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="john">John Smith</SelectItem>
                    <SelectItem value="sarah">Sarah Johnson</SelectItem>
                    <SelectItem value="mike">Mike Davis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="vehicle">Vehicle</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LSR-001">LSR-001</SelectItem>
                    <SelectItem value="LSR-002">LSR-002</SelectItem>
                    <SelectItem value="LSR-003">LSR-003</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="type">Infringement Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="speeding">Speeding</SelectItem>
                    <SelectItem value="parking">Parking Violation</SelectItem>
                    <SelectItem value="weight">Weight Violation</SelectItem>
                    <SelectItem value="hours">Driving Hours Violation</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input id="location" placeholder="Location of infringement" />
              </div>
              <div>
                <Label htmlFor="fine">Fine Amount (£)</Label>
                <Input id="fine" type="number" step="0.01" placeholder="0.00" />
              </div>
              <div>
                <Label htmlFor="points">Penalty Points</Label>
                <Input id="points" type="number" placeholder="0" />
              </div>
              <Button className="w-full bg-red-600 hover:bg-red-700">Record Infringement</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Infringements</p>
                <p className="text-2xl font-bold">{infringementStats.total_infringements}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Total Fines</p>
                <p className="text-2xl font-bold">£{totalFines.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Pending Fines</p>
                <p className="text-2xl font-bold text-yellow-600">£{pendingFines.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Total Points</p>
                <p className="text-2xl font-bold">{totalPoints}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="infringements" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="infringements">All Infringements</TabsTrigger>
          <TabsTrigger value="driver-summary">Driver Summary</TabsTrigger>
          <TabsTrigger value="reports">Reports & Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="infringements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5" />
                Infringement Records
              </CardTitle>
              <div className="flex gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search infringements..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="disputed">Disputed</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Driver</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Fine Amount</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {infringements.map((infringement) => (
                    <TableRow key={infringement.id}>
                      <TableCell className="font-medium">{infringement.driverName}</TableCell>
                      <TableCell>{infringement.vehicleNumber}</TableCell>
                      <TableCell>{infringement.infringementType}</TableCell>
                      <TableCell>{infringement.date}</TableCell>
                      <TableCell>{infringement.location}</TableCell>
                      <TableCell>£{infringement.fineAmount.toFixed(2)}</TableCell>
                      <TableCell>{infringement.points}</TableCell>
                      <TableCell>{getStatusBadge(infringement.status)}</TableCell>
                      <TableCell>{infringement.dueDate}</TableCell>
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

        <TabsContent value="driver-summary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Driver Risk Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Driver Name</TableHead>
                    <TableHead>Total Infringements</TableHead>
                    <TableHead>Total Points</TableHead>
                    <TableHead>Total Fines</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {driverSummary.map((driver) => (
                    <TableRow key={driver.driverId}>
                      <TableCell className="font-medium">{driver.driverName}</TableCell>
                      <TableCell>{driver.totalInfringements}</TableCell>
                      <TableCell>{driver.totalPoints}</TableCell>
                      <TableCell>£{driver.totalFines.toFixed(2)}</TableCell>
                      <TableCell>{getRiskLevelBadge(driver.riskLevel)}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Reports & Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Infringement Analytics</h3>
                <p className="text-gray-600 mb-6">
                  Generate detailed reports on driver behavior, infringement trends, and risk analysis.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button className="bg-red-600 hover:bg-red-700">
                    <Download className="w-4 h-4 mr-2" />
                    Monthly Report
                  </Button>
                  <Button variant="outline">
                    <Calendar className="w-4 h-4 mr-2" />
                    Custom Date Range
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InfringementManagement;
