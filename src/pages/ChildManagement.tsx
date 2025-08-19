import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Plus, 
  MapPin, 
  Clock,
  School,
  Phone,
  Edit,
  Eye,
  Calendar,
  AlertCircle,
  CheckCircle,
  Navigation,
  User
} from 'lucide-react';
import EmergencyContacts from '@/components/parent/EmergencyContacts';
import ComprehensiveChildRegistration from '@/components/parent/ComprehensiveChildRegistration';

const ChildManagement = () => {
  const { user, profile, loading } = useAuth();
  const [isAddChildDialogOpen, setIsAddChildDialogOpen] = useState(false);
  const [isComprehensiveRegistrationOpen, setIsComprehensiveRegistrationOpen] = useState(false);
  const [trackingChild, setTrackingChild] = useState<string | null>(null);
  const [scheduleChild, setScheduleChild] = useState<string | null>(null);
  const [showCallDialog, setShowCallDialog] = useState<string | null>(null);
  const [editingChild, setEditingChild] = useState<any>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-lg">Loading child management...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/auth" replace />;
  }

  // Only parents can access
  if (profile.role !== 'parent') {
    return <Navigate to="/dashboard" replace />;
  }

  // Enhanced mock data for demonstration
  const children = [
    {
      id: '1',
      firstName: 'Emma',
      lastName: 'Smith',
      age: 8,
      grade: 'Year 3',
      school: 'Elmwood Primary School',
      emergencyContact: '+44 7123 456789',
      medicalNotes: 'Mild asthma - inhaler required',
      pickupTime: '15:30',
      dropoffTime: '08:00',
      route: 'Route 1',
      currentStatus: 'at_school',
      transportStatus: 'active',
      avatar: '/api/placeholder/100/100',
      driver: 'John Smith',
      driverPhone: '+44 7123 456790',
      transportOffice: '+44 7123 456791',
      lastSeen: '15:25',
      estimatedArrival: '15:35'
    },
    {
      id: '2',
      firstName: 'James',
      lastName: 'Smith',
      age: 6,
      grade: 'Year 1',
      school: 'Elmwood Primary School',
      emergencyContact: '+44 7123 456789',
      medicalNotes: 'No known allergies',
      pickupTime: '15:30',
      dropoffTime: '08:00',
      route: 'Route 1',
      currentStatus: 'on_transport',
      transportStatus: 'active',
      avatar: '/api/placeholder/100/100',
      driver: 'Sarah Johnson',
      driverPhone: '+44 7123 456792',
      transportOffice: '+44 7123 456791',
      lastSeen: '15:20',
      estimatedArrival: '15:40'
    }
  ];

  const recentActivity = [
    {
      id: '1',
      childId: '1',
      childName: 'Emma',
      type: 'pickup',
      time: '15:35',
      date: '2024-01-15',
      location: 'Elmwood Primary School',
      status: 'completed',
      driver: 'John Smith',
      vehicle: 'LSR-001'
    },
    {
      id: '2',
      childId: '2',
      childName: 'James',
      type: 'dropoff',
      time: '08:02',
      date: '2024-01-15',
      location: 'Elmwood Primary School',
      status: 'completed',
      driver: 'John Smith',
      vehicle: 'LSR-001'
    },
    {
      id: '3',
      childId: '1',
      childName: 'Emma',
      type: 'absence',
      date: '2024-01-12',
      reason: 'Medical appointment',
      status: 'approved'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'at_home':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">At Home</Badge>;
      case 'on_transport':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">On Transport</Badge>;
      case 'at_school':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">At School</Badge>;
      case 'absent':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Absent</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'pickup':
        return <MapPin className="w-4 h-4 text-green-600" />;
      case 'dropoff':
        return <MapPin className="w-4 h-4 text-blue-600" />;
      case 'absence':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const handleTrackLive = (childId: string, childName: string) => {
    setTrackingChild(childId);
    // In a real app, this would open a tracking interface
    console.log(`Starting live tracking for ${childName}`);
    // You could navigate to a tracking page or open a modal
    window.open(`/tracking/${childId}`, '_blank');
  };

  const handleSchedule = (childId: string, childName: string) => {
    setScheduleChild(childId);
    // In a real app, this would open a detailed schedule view
    console.log(`Opening schedule for ${childName}`);
    // You could navigate to a schedule page or open a modal
    window.open(`/schedule/${childId}`, '_blank');
  };

  const handleCall = (childId: string, childName: string) => {
    setShowCallDialog(childId);
    // In a real app, this would show contact options
    console.log(`Opening call options for ${childName}`);
  };

  const handleEmergencyCall = (phoneNumber: string) => {
    window.location.href = `tel:${phoneNumber}`;
    setShowCallDialog(null);
  };

  const handleDriverCall = (driverPhone: string) => {
    window.location.href = `tel:${driverPhone}`;
    setShowCallDialog(null);
  };

  const getChildById = (childId: string) => {
    return children.find(child => child.id === childId);
  };

  const handleEditChild = (child: any) => {
    setEditingChild({ ...child });
    setShowEditDialog(true);
  };

  const handleSaveChild = () => {
    if (!editingChild) return;
    
    // In a real app, this would save to the backend
    console.log('Saving child updates:', editingChild);
    
    // For now, we'll just close the dialog
    // In a real implementation, you would:
    // 1. Call API to update child
    // 2. Update local state
    // 3. Show success message
    
    setShowEditDialog(false);
    setEditingChild(null);
  };

  const handleCancelEdit = () => {
    setShowEditDialog(false);
    setEditingChild(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            My Children
          </h1>
          <p className="text-gray-600 mt-1">Manage your children's transport and school information</p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => setIsComprehensiveRegistrationOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Child (Comprehensive)
        </Button>
      </div>

      {/* Children Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {children.map((child) => (
          <Card key={child.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{child.firstName} {child.lastName}</CardTitle>
                    <p className="text-gray-600">{child.grade} • Age {child.age}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {getStatusBadge(child.currentStatus)}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditChild(child)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <School className="w-4 h-4 text-purple-600" />
                  <span>{child.school}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-600" />
                  <span>{child.route}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-green-600" />
                  <span>Pickup: {child.pickupTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>Dropoff: {child.dropoffTime}</span>
                </div>
                {child.currentStatus === 'on_transport' && (
                  <>
                    <div className="flex items-center gap-2 col-span-2">
                      <Navigation className="w-4 h-4 text-orange-600" />
                      <span className="text-orange-600 font-medium">
                        Last seen: {child.lastSeen} • ETA: {child.estimatedArrival}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 col-span-2">
                      <User className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-600">Driver: {child.driver}</span>
                    </div>
                  </>
                )}
              </div>
              
              {child.medicalNotes && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                  <div className="flex items-center gap-2 text-yellow-800 mb-1">
                    <AlertCircle className="w-4 h-4" />
                    <span className="font-medium">Medical Notes</span>
                  </div>
                  <p className="text-yellow-700 text-sm">{child.medicalNotes}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={() => handleTrackLive(child.id, child.firstName)}
                  disabled={trackingChild === child.id}
                >
                  <Navigation className="w-4 h-4 mr-1" />
                  {trackingChild === child.id ? 'Tracking...' : 'Track Live'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleSchedule(child.id, child.firstName)}
                >
                  <Calendar className="w-4 h-4 mr-1" />
                  Schedule
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleCall(child.id, child.firstName)}
                >
                  <Phone className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="activity" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="schedule">Weekly Schedule</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="contacts">Emergency Contacts</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Recent Transport Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="flex-shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">
                        {activity.childName} - {activity.type === 'pickup' ? 'Picked up' : 
                         activity.type === 'dropoff' ? 'Dropped off' : 'Absence reported'}
                      </h4>
                      <div className="text-sm text-gray-600">
                        {activity.time && <span>{activity.time} • </span>}
                        {activity.date}
                        {activity.location && <span> • {activity.location}</span>}
                        {activity.driver && <span> • Driver: {activity.driver}</span>}
                      </div>
                      {activity.reason && (
                        <p className="text-sm text-gray-600 mt-1">Reason: {activity.reason}</p>
                      )}
                    </div>
                    <div>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Weekly Transport Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                  <div key={day} className="border rounded-lg p-3">
                    <h3 className="font-medium text-center mb-3">{day}</h3>
                    <div className="space-y-2">
                      {day !== 'Saturday' && day !== 'Sunday' ? (
                        <>
                          <div className="bg-blue-50 p-2 rounded text-xs">
                            <div className="font-medium">Morning Pickup</div>
                            <div className="text-gray-600">08:00 - Route 1</div>
                          </div>
                          <div className="bg-green-50 p-2 rounded text-xs">
                            <div className="font-medium">Afternoon Return</div>
                            <div className="text-gray-600">15:30 - Route 1</div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center text-gray-400 text-xs py-4">
                          No transport
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Attendance Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {children.map((child) => (
                  <div key={child.id} className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-3">{child.firstName} {child.lastName}</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">This Month</span>
                        <span className="font-medium">18/20 days</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">This Term</span>
                        <span className="font-medium">85/90 days</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Attendance Rate</span>
                        <span className="font-medium text-green-600">94%</span>
                      </div>
                      <div className="bg-green-100 rounded-full h-2">
                        <div className="bg-green-600 rounded-full h-2 w-[94%]"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4">
          <EmergencyContacts />
        </TabsContent>
      </Tabs>

      {/* Comprehensive Child Registration Dialog */}
      <ComprehensiveChildRegistration
        open={isComprehensiveRegistrationOpen}
        onOpenChange={setIsComprehensiveRegistrationOpen}
        onChildAdded={() => {
          setIsComprehensiveRegistrationOpen(false);
          // You can add a toast notification here if needed
        }}
      />

      {/* Call Options Dialog */}
      <Dialog open={!!showCallDialog} onOpenChange={() => setShowCallDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Contact Options - {showCallDialog && getChildById(showCallDialog)?.firstName}
            </DialogTitle>
            <DialogDescription>
              Choose who you'd like to contact regarding your child's transport.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {showCallDialog && getChildById(showCallDialog) && (
              <>
                <Button 
                  className="w-full bg-red-600 hover:bg-red-700"
                  onClick={() => handleEmergencyCall(getChildById(showCallDialog)!.emergencyContact)}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Emergency Contact
                </Button>
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => handleDriverCall(getChildById(showCallDialog)!.driverPhone)}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call Driver ({getChildById(showCallDialog)!.driver})
                </Button>
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => handleDriverCall(getChildById(showCallDialog)!.transportOffice)}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call Transport Office
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Child Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Child Information</DialogTitle>
            <DialogDescription>
              Update your child's transport and school information.
            </DialogDescription>
          </DialogHeader>
          
          {editingChild && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-firstName">First Name</Label>
                    <Input
                      id="edit-firstName"
                      value={editingChild.firstName}
                      onChange={(e) => setEditingChild({ ...editingChild, firstName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-lastName">Last Name</Label>
                    <Input
                      id="edit-lastName"
                      value={editingChild.lastName}
                      onChange={(e) => setEditingChild({ ...editingChild, lastName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-age">Age</Label>
                    <Input
                      id="edit-age"
                      type="number"
                      value={editingChild.age}
                      onChange={(e) => setEditingChild({ ...editingChild, age: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-grade">Grade</Label>
                    <Input
                      id="edit-grade"
                      value={editingChild.grade}
                      onChange={(e) => setEditingChild({ ...editingChild, grade: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* School Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">School Information</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-school">School</Label>
                    <Input
                      id="edit-school"
                      value={editingChild.school}
                      onChange={(e) => setEditingChild({ ...editingChild, school: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Transport Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Transport Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-pickupTime">Pickup Time</Label>
                    <Input
                      id="edit-pickupTime"
                      type="time"
                      value={editingChild.pickupTime}
                      onChange={(e) => setEditingChild({ ...editingChild, pickupTime: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-dropoffTime">Dropoff Time</Label>
                    <Input
                      id="edit-dropoffTime"
                      type="time"
                      value={editingChild.dropoffTime}
                      onChange={(e) => setEditingChild({ ...editingChild, dropoffTime: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-route">Route</Label>
                    <Input
                      id="edit-route"
                      value={editingChild.route}
                      onChange={(e) => setEditingChild({ ...editingChild, route: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-emergencyContact">Emergency Contact</Label>
                    <Input
                      id="edit-emergencyContact"
                      value={editingChild.emergencyContact}
                      onChange={(e) => setEditingChild({ ...editingChild, emergencyContact: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Medical Information</h3>
                <div>
                  <Label htmlFor="edit-medicalNotes">Medical Notes</Label>
                  <Textarea
                    id="edit-medicalNotes"
                    value={editingChild.medicalNotes}
                    onChange={(e) => setEditingChild({ ...editingChild, medicalNotes: e.target.value })}
                    rows={3}
                    placeholder="Any medical conditions, allergies, or special requirements..."
                  />
                </div>
              </div>

              {/* Status Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Status Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-currentStatus">Current Status</Label>
                    <Select 
                      value={editingChild.currentStatus} 
                      onValueChange={(value) => setEditingChild({ ...editingChild, currentStatus: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="at_home">At Home</SelectItem>
                        <SelectItem value="on_transport">On Transport</SelectItem>
                        <SelectItem value="at_school">At School</SelectItem>
                        <SelectItem value="absent">Absent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-transportStatus">Transport Status</Label>
                    <Select 
                      value={editingChild.transportStatus} 
                      onValueChange={(value) => setEditingChild({ ...editingChild, transportStatus: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={handleCancelEdit}>
              Cancel
            </Button>
            <Button onClick={handleSaveChild} className="bg-blue-600 hover:bg-blue-700">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChildManagement;