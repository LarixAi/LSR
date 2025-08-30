
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, FileText, Calendar, DollarSign, Scale, Eye, ArrowLeft, Users, ChevronDown, Truck, Link } from 'lucide-react';
import { format } from 'date-fns';
import { useLocation } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';

interface InfringementTrackerProps {
  driverId: string;
}

const InfringementTracker: React.FC<InfringementTrackerProps> = ({ driverId }) => {
  const [selectedInfringement, setSelectedInfringement] = useState<string | null>(null);

  // Mock infringement data
  const infringements = [
    {
      id: '1',
      type: 'Speed Violation',
      description: 'Exceeding speed limit by 15 km/h',
      date: '2024-05-15',
      location: 'Highway A1, Mile 45',
      fineAmount: 150,
      points: 3,
      status: 'paid',
      dueDate: '2024-06-15',
      referenceNumber: 'SPD-2024-001',
      severity: 'moderate'
    },
    {
      id: '2',
      type: 'Documentation',
      description: 'Vehicle inspection certificate expired',
      date: '2024-04-20',
      location: 'Checkpoint B',
      fineAmount: 200,
      points: 2,
      status: 'resolved',
      dueDate: '2024-05-20',
      referenceNumber: 'DOC-2024-002',
      severity: 'minor'
    }
  ];

  const currentPoints = infringements.reduce((total, inf) => total + inf.points, 0);
  const totalFines = infringements.reduce((total, inf) => total + inf.fineAmount, 0);
  const activeInfringements = infringements.filter(inf => inf.status !== 'resolved').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
      case 'resolved':
        return <Badge className="bg-blue-100 text-blue-800">Resolved</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'minor': return 'text-yellow-600';
      case 'moderate': return 'text-orange-600';
      case 'major': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Infringements</p>
                <p className="text-2xl font-bold text-red-600">{activeInfringements}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Points</p>
                <p className="text-2xl font-bold text-orange-600">{currentPoints}</p>
                <p className="text-xs text-gray-500">Out of 12 limit</p>
              </div>
              <Scale className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Fines</p>
                <p className="text-2xl font-bold text-blue-600">${totalFines}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Record Status</p>
                <Badge className="bg-green-100 text-green-800">Good Standing</Badge>
              </div>
              <FileText className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Infringements List */}
      <Card>
        <CardHeader>
          <CardTitle>Infringement History</CardTitle>
          <CardDescription>
            Track all traffic violations and compliance issues
          </CardDescription>
        </CardHeader>
        <CardContent>
          {infringements.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Clean Record</h3>
              <p className="text-gray-600">No infringements on record. Keep up the great work!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {infringements.map((infringement) => (
                <div key={infringement.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium">{infringement.type}</h4>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getSeverityColor(infringement.severity)}`}
                        >
                          {infringement.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{infringement.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {format(new Date(infringement.date), 'MMM dd, yyyy')}
                        </span>
                        <span>Ref: {infringement.referenceNumber}</span>
                        <span>{infringement.location}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(infringement.status)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="flex items-center text-red-600">
                        <DollarSign className="w-4 h-4 mr-1" />
                        ${infringement.fineAmount}
                      </div>
                      <div className="flex items-center text-orange-600">
                        <Scale className="w-4 h-4 mr-1" />
                        {infringement.points} points
                      </div>
                      {infringement.status === 'pending' && (
                        <div className="text-gray-600">
                          Due: {format(new Date(infringement.dueDate), 'MMM dd, yyyy')}
                        </div>
                      )}
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Points System Info */}
      <Card>
        <CardHeader>
          <CardTitle>Points System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Current Points</span>
              <span className="font-semibold">{currentPoints}/12</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  currentPoints <= 3 ? 'bg-green-500' :
                  currentPoints <= 6 ? 'bg-yellow-500' :
                  currentPoints <= 9 ? 'bg-orange-500' : 'bg-red-500'
                }`}
                style={{ width: `${(currentPoints / 12) * 100}%` }}
              ></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="font-medium text-green-800">0-3 Points</p>
                <p className="text-green-600">Good Standing</p>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <p className="font-medium text-yellow-800">4-9 Points</p>
                <p className="text-yellow-600">Warning Level</p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <p className="font-medium text-red-800">10+ Points</p>
                <p className="text-red-600">License Suspension Risk</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Main InfringementManagement component that handles navigation state
export default function InfringementManagement() {
  const location = useLocation();
  const [selectedTachographRecord, setSelectedTachographRecord] = useState<any>(null);
  const [showTachographDetails, setShowTachographDetails] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewFilter, setViewFilter] = useState('all');

  // Check for navigation state from Tachograph Manager
  useEffect(() => {
    if (location.state?.source === 'tachograph' && location.state?.selectedRecord) {
      setSelectedTachographRecord(location.state.selectedRecord);
      setShowTachographDetails(true);
    }
  }, [location.state]);

  // If we have tachograph record details, show them
  if (showTachographDetails && selectedTachographRecord) {
    return (
      <PageLayout
        title="Tachograph Violation Details"
        description={`Violations detected in tachograph record from ${format(new Date(selectedTachographRecord.record_date), 'MMM dd, yyyy')}`}
        actionButton={{
          label: "Back to Infringements",
          onClick: () => setShowTachographDetails(false),
          icon: <ArrowLeft className="w-4 h-4 mr-2" />
        }}
        summaryCards={[
          {
            title: "Driver",
            value: `${selectedTachographRecord.driver?.first_name} ${selectedTachographRecord.driver?.last_name}`,
            icon: <Users className="h-4 w-4" />,
            color: "text-blue-600"
          },
          {
            title: "Vehicle",
            value: `${selectedTachographRecord.vehicle?.vehicle_number} - ${selectedTachographRecord.vehicle?.make} ${selectedTachographRecord.vehicle?.model}`,
            icon: <AlertTriangle className="h-4 w-4" />,
            color: "text-green-600"
          },
          {
            title: "Record Date",
            value: format(new Date(selectedTachographRecord.record_date), 'MMM dd, yyyy'),
            icon: <Calendar className="h-4 w-4" />,
            color: "text-purple-600"
          },
          {
            title: "Violations",
            value: selectedTachographRecord.violations?.length || 0,
            icon: <AlertTriangle className="h-4 w-4" />,
            color: "text-red-600"
          }
        ]}
        searchPlaceholder="Search violations..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        filters={[
          {
            label: "Status",
            value: viewFilter,
            options: [
              { value: "all", label: "All Status" },
              { value: "pending", label: "Pending" },
              { value: "resolved", label: "Resolved" }
            ],
            onChange: setViewFilter
          }
        ]}
        tabs={[
          { value: "overview", label: "Overview" },
          { value: "violations", label: "Violations" },
          { value: "actions", label: "Actions" }
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isLoading={false}
      >
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Record Information */}
            <Card>
              <CardHeader>
                <CardTitle>Record Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm text-gray-600 mb-2">Card Type</h4>
                    <p className="text-lg capitalize">{selectedTachographRecord.card_type}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-gray-600 mb-2">Distance</h4>
                    <p className="text-lg">{selectedTachographRecord.distance_km ? `${Math.round(selectedTachographRecord.distance_km)}km` : '—'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Violations */}
            <Card>
              <CardHeader>
                <CardTitle>Detected Violations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedTachographRecord.violations?.map((violation: string, index: number) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="text-red-800">{violation}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "violations" && (
          <Card>
            <CardHeader>
              <CardTitle>Violation Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedTachographRecord.violations?.map((violation: string, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <h4 className="font-medium">Violation {index + 1}</h4>
                    </div>
                    <p className="text-gray-700">{violation}</p>
                    <div className="mt-3 flex gap-2">
                      <Badge variant="outline">Tachograph</Badge>
                      <Badge variant="outline">Driver Card</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "actions" && (
          <Card>
            <CardHeader>
              <CardTitle>Recommended Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <Button className="bg-red-600 hover:bg-red-700">
                    <FileText className="w-4 h-4 mr-2" />
                    Create Infringement Report
                  </Button>
                  <Button variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    View Full Record
                  </Button>
                  <Button variant="outline">
                    <Users className="w-4 h-4 mr-2" />
                    Contact Driver
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </PageLayout>
    );
  }

  // Default infringement management view with PageLayout
  return (
    <PageLayout
      title="Infringement Management"
      description="Track and manage driver infringements, fines, and compliance violations"
      actionButton={{
        label: "Add Infringement",
        onClick: () => console.log("Add infringement"),
        icon: <AlertTriangle className="w-4 h-4 mr-2" />
      }}
      summaryCards={[
        {
          title: "Active Infringements",
          value: "2",
          icon: <AlertTriangle className="h-4 w-4" />,
          color: "text-red-600"
        },
        {
          title: "Total Points",
          value: "5/12",
          icon: <Scale className="h-4 w-4" />,
          color: "text-orange-600"
        },
        {
          title: "Total Fines",
          value: "£350",
          icon: <DollarSign className="h-4 w-4" />,
          color: "text-yellow-600"
        },
        {
          title: "Resolved Cases",
          value: "1",
          icon: <Eye className="h-4 w-4" />,
          color: "text-green-600"
        }
      ]}
      searchPlaceholder="Search infringements..."
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      filters={[
        {
          label: "Status",
          value: viewFilter,
          options: [
            { value: "all", label: "All Status" },
            { value: "pending", label: "Pending" },
            { value: "paid", label: "Paid" },
            { value: "overdue", label: "Overdue" },
            { value: "resolved", label: "Resolved" }
          ],
          onChange: setViewFilter
        }
      ]}
      tabs={[
        { value: "overview", label: "Overview" },
        { value: "infringements", label: "Infringements" },
        { value: "drivers", label: "Driver Records" },
        { value: "reports", label: "Reports" }
      ]}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      isLoading={false}
    >
      {activeTab === "overview" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Infringements</CardTitle>
              <CardDescription>
                Latest traffic violations and compliance issues that require attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <div>
                      <h4 className="font-medium">Speed Violation</h4>
                      <p className="text-sm text-gray-600">Exceeding speed limit by 15 km/h</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-red-100 text-red-800">Pending</Badge>
                    <span className="text-sm text-gray-500">May 15, 2024</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-yellow-600" />
                    <div>
                      <h4 className="font-medium">Documentation Issue</h4>
                      <p className="text-sm text-gray-600">Vehicle inspection certificate expired</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-100 text-green-800">Resolved</Badge>
                    <span className="text-sm text-gray-500">Apr 20, 2024</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks and actions for managing infringements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                  <FileText className="h-6 w-6" />
                  <span>Create New Infringement</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                  <Eye className="h-6 w-6" />
                  <span>View All Records</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                  <Users className="h-6 w-6" />
                  <span>Driver Reports</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
                  <Scale className="h-6 w-6" />
                  <span>Compliance Status</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {activeTab === "infringements" && (
        <Card>
          <CardHeader>
            <CardTitle>Infringement Records</CardTitle>
            <CardDescription>
              Track all traffic violations and compliance issues
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-3 font-medium text-sm">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        Vehicle
                      </div>
                    </th>
                    <th className="text-left p-3 font-medium text-sm">Driver</th>
                    <th className="text-left p-3 font-medium text-sm">
                      <div className="flex items-center gap-1">
                        Violation Type
                        <ChevronDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="text-left p-3 font-medium text-sm">Date</th>
                    <th className="text-left p-3 font-medium text-sm">Location</th>
                    <th className="text-left p-3 font-medium text-sm">Fine</th>
                    <th className="text-left p-3 font-medium text-sm">Points</th>
                    <th className="text-left p-3 font-medium text-sm">Status</th>
                    <th className="text-left p-3 font-medium text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-gray-50 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <input type="checkbox" className="rounded" />
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                            <Truck className="w-5 h-5 text-gray-500" />
                          </div>
                          <div>
                            <p className="font-medium">1100 [2018 Toyota Prius]</p>
                            <p className="text-xs text-gray-500">Management</p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                          KL
                        </div>
                        <span className="text-sm text-gray-700 hover:text-gray-900 cursor-pointer">kenny laing</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Speed Violation</span>
                        <Badge variant="outline" className="text-xs border-gray-300 text-gray-600">moderate</Badge>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <span className="text-sm">May 15, 2024</span>
                        <Link className="h-3 w-3 text-gray-400" />
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="text-sm">Highway A1, Mile 45</span>
                    </td>
                    <td className="p-3">
                      <span className="font-medium text-gray-900">$150</span>
                    </td>
                    <td className="p-3">
                      <span className="text-sm text-gray-700">3 points</span>
                    </td>
                    <td className="p-3">
                      <Badge className="bg-gray-100 text-gray-700 border border-gray-200">Pending</Badge>
                    </td>
                    <td className="p-3">
                      <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </td>
                  </tr>
                  
                  <tr className="border-b hover:bg-gray-50 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <input type="checkbox" className="rounded" />
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                            <Truck className="w-5 h-5 text-gray-500" />
                          </div>
                          <div>
                            <p className="font-medium">3100 [2014 Chevrolet Express]</p>
                            <p className="text-xs text-gray-500">Sales</p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                          KL
                        </div>
                        <span className="text-sm text-gray-700 hover:text-gray-900 cursor-pointer">kenny laing</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Documentation Issue</span>
                        <Badge variant="outline" className="text-xs border-gray-300 text-gray-600">minor</Badge>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <span className="text-sm">Apr 20, 2024</span>
                        <Link className="h-3 w-3 text-gray-400" />
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="text-sm">Checkpoint B</span>
                    </td>
                    <td className="p-3">
                      <span className="font-medium text-gray-900">$200</span>
                    </td>
                    <td className="p-3">
                      <span className="text-sm text-gray-700">2 points</span>
                    </td>
                    <td className="p-3">
                      <Badge className="bg-gray-100 text-gray-700 border border-gray-200">Resolved</Badge>
                    </td>
                    <td className="p-3">
                      <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </td>
                  </tr>
                  
                  <tr className="border-b hover:bg-gray-50 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <input type="checkbox" className="rounded" />
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                            <Truck className="w-5 h-5 text-gray-500" />
                          </div>
                          <div>
                            <p className="font-medium">2200 [2019 Ford Transit]</p>
                            <p className="text-xs text-gray-500">Operations</p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                          KL
                        </div>
                        <span className="text-sm text-gray-700 hover:text-gray-900 cursor-pointer">kenny laing</span>
                        <Badge variant="outline" className="text-xs border-red-200 text-red-700 bg-red-50">Critical</Badge>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Hours of Service</span>
                        <Badge variant="outline" className="text-xs border-gray-300 text-gray-600">major</Badge>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <span className="text-sm">Apr 15, 2024</span>
                        <Link className="h-3 w-3 text-gray-400" />
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="text-sm">Route 66, Exit 12</span>
                    </td>
                    <td className="p-3">
                      <span className="font-medium text-gray-900">$500</span>
                    </td>
                    <td className="p-3">
                      <span className="text-sm text-gray-700">6 points</span>
                    </td>
                    <td className="p-3">
                      <Badge className="bg-red-50 text-red-700 border border-red-200">Overdue</Badge>
                    </td>
                    <td className="p-3">
                      <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "drivers" && (
        <Card>
          <CardHeader>
            <CardTitle>Driver Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Driver Infringement Records</h3>
              <p className="text-gray-600">View individual driver infringement history and compliance records.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "reports" && (
        <Card>
          <CardHeader>
            <CardTitle>Infringement Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Generate Reports</h3>
              <p className="text-gray-600">Create detailed infringement reports for regulatory compliance.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
}
