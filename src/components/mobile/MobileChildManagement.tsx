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
  User,
  Mail,
  AlertTriangle,
  XCircle,
  Bus,
  Home,
  Activity,
  RefreshCw,
  Loader2,
  MessageSquare
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ResponsiveScaffold from './ResponsiveScaffold';
import { 
  useChildProfiles, 
  useChildTransportStatus, 
  useParentCommunications,
  useStudentAttendance,
  calculateAge,
  type ChildProfile,
  type ParentCommunication,
  type StudentAttendance
} from '@/hooks/useChildManagement';
import { format } from 'date-fns';

const MobileChildManagement = () => {
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();
  const [isAddChildDialogOpen, setIsAddChildDialogOpen] = useState(false);
  const [trackingChild, setTrackingChild] = useState<string | null>(null);
  const [scheduleChild, setScheduleChild] = useState<string | null>(null);
  const [showCallDialog, setShowCallDialog] = useState<string | null>(null);
  const [editingChild, setEditingChild] = useState<any>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedChild, setSelectedChild] = useState<ChildProfile | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch real data from backend
  const { data: children = [], isLoading: childrenLoading, error: childrenError, refetch: refetchChildren } = useChildProfiles();
  const { data: communications = [], isLoading: communicationsLoading } = useParentCommunications();
  const { data: attendance = [], isLoading: attendanceLoading } = useStudentAttendance(
    selectedChild?.id,
    format(new Date().setDate(new Date().getDate() - 7), 'yyyy-MM-dd'), // Last 7 days
    format(new Date(), 'yyyy-MM-dd')
  );

  // Get transport status for selected child
  const { data: transportStatus } = useChildTransportStatus(selectedChild?.id);

  if (loading) {
    return (
      <ResponsiveScaffold className="bg-gradient-to-br from-violet-50 via-blue-50 via-cyan-50 via-emerald-50 to-teal-50">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-muted-foreground">Loading child management...</p>
          </div>
        </div>
      </ResponsiveScaffold>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/auth" replace />;
  }

  // Only parents can access
  if (profile.role !== 'parent') {
    return <Navigate to="/dashboard" replace />;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'at_school': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'on_transport': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'at_home': return 'bg-green-100 text-green-800 border-green-200';
      case 'pickup_pending': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'dropoff_pending': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'at_school': return <School className="w-3 h-3" />;
      case 'on_transport': return <Bus className="w-3 h-3" />;
      case 'at_home': return <Home className="w-3 h-3" />;
      case 'pickup_pending': return <Clock className="w-3 h-3" />;
      case 'dropoff_pending': return <Navigation className="w-3 h-3" />;
      default: return <User className="w-3 h-3" />;
    }
  };

  const handleRefresh = async () => {
    try {
      await refetchChildren();
      toast({
        title: "Data refreshed",
        description: "Child information has been updated.",
      });
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: "Failed to refresh child data. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <ResponsiveScaffold
      className="bg-gradient-to-br from-violet-50 via-blue-50 via-cyan-50 via-emerald-50 to-teal-50 relative overflow-hidden"
      scrollable={true}
      padding="medium"
    >
      {/* Animated background elements to match landing page */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" style={{ animationDelay: '4s' }}></div>
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" style={{ animationDelay: '6s' }}></div>
        
        {/* Geometric patterns */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
      </div>
              {/* Header */}
        <div className="space-y-6 relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mobile-text-xl">My Children</h1>
            <p className="text-gray-600 mt-1 mobile-text-responsive">
              Manage your children's information and track their status
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddChildDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Child
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="mobile-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Children</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{children.length}</div>
              <p className="text-xs text-muted-foreground">Active registrations</p>
            </CardContent>
          </Card>
          
          <Card className="mobile-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">On Transport</CardTitle>
              <Bus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {children.filter(child => child.is_active).length}
              </div>
              <p className="text-xs text-muted-foreground">Currently traveling</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 mobile-tabs">
            <TabsTrigger value="overview" className="text-xs sm:text-sm px-1 sm:px-3 py-2">Overview</TabsTrigger>
            <TabsTrigger value="details" className="text-xs sm:text-sm px-1 sm:px-3 py-2">Details</TabsTrigger>
            <TabsTrigger value="attendance" className="text-xs sm:text-sm px-1 sm:px-3 py-2">Attendance</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Children List */}
            <Card className="mobile-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Children Status</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsAddChildDialogOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Child
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {childrenLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                      <span className="ml-2 text-muted-foreground">Loading children...</span>
                    </div>
                  ) : childrenError ? (
                    <div className="text-center py-8">
                      <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                      <p className="text-muted-foreground">Failed to load children data</p>
                      <Button onClick={handleRefresh} className="mt-2" size="sm">
                        Retry
                      </Button>
                    </div>
                  ) : children.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">No children registered</h3>
                      <p className="text-muted-foreground mb-4">
                        Add your first child to start tracking their transport
                      </p>
                      <Button onClick={() => setIsAddChildDialogOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Child
                      </Button>
                    </div>
                  ) : (
                    children.map((child) => {
                      const age = child.date_of_birth ? 
                        new Date().getFullYear() - new Date(child.date_of_birth).getFullYear() : 
                        'N/A';
                      
                      return (
                        <div key={child.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold mobile-text-responsive">{child.first_name} {child.last_name}</h3>
                                                             <p className="text-sm text-muted-foreground">
                                 {child.grade || 'N/A'} • Age {age}
                               </p>
                               <p className="text-sm text-muted-foreground">{child.school}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                                                         <Badge 
                               variant="outline" 
                               className="text-gray-600 bg-gray-50 border-gray-200"
                             >
                               <div className="flex items-center space-x-1">
                                 <User className="w-3 h-3" />
                                 <span className="text-xs">Active</span>
                               </div>
                             </Badge>
                            <div className="flex space-x-1">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => setSelectedChild(child)}
                              >
                                <Eye className="w-3 h-3" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                              >
                                <Phone className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="mobile-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setActiveTab('attendance')}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  View Attendance Records
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setIsAddChildDialogOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Register New Child
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Contact Transport
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6">
            {selectedChild ? (
              <Card className="mobile-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5 text-blue-600" />
                    <span>{selectedChild.first_name} {selectedChild.last_name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Age</Label>
                      <p className="text-foreground">{calculateAge(selectedChild.date_of_birth)} years</p>
                    </div>
                    <div>
                                           <Label className="text-sm font-medium text-muted-foreground">School</Label>
                     <p className="text-foreground">{selectedChild.school}</p>
                   </div>
                   <div>
                     <Label className="text-sm font-medium text-muted-foreground">Grade</Label>
                     <p className="text-foreground">{selectedChild.grade}</p>
                   </div>
                   <div>
                     <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                     <Badge className="text-gray-600 bg-gray-50 border-gray-200">
                       <User className="w-3 h-3" />
                       <span className="ml-1">Active</span>
                     </Badge>
                   </div>
                  </div>
                  
                                     <div className="pt-4 border-t">
                     <Label className="text-sm font-medium text-muted-foreground">Medical Notes</Label>
                     <p className="text-foreground mt-1">
                       {selectedChild.medical_conditions || 'No medical notes available'}
                     </p>
                   </div>

                  <div className="pt-4 border-t">
                    <Label className="text-sm font-medium text-muted-foreground">Pickup Location</Label>
                    <p className="text-foreground mt-1">
                      {selectedChild.pickup_location || 'Not specified'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="mobile-card">
                <CardContent className="p-6">
                  <div className="text-center">
                    <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Select a child to view detailed information</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-6">
            {selectedChild ? (
              <Card className="mobile-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-green-600" />
                    <span>Attendance History - {selectedChild.first_name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {attendanceLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                      <span className="ml-2 text-muted-foreground">Loading attendance...</span>
                    </div>
                  ) : attendance.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No attendance records found</p>
                  ) : (
                    <div className="space-y-2">
                      {attendance.slice(0, 7).map((record, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                                     <div>
                             <p className="text-sm font-medium">{format(new Date(record.date), 'MMM dd, yyyy')}</p>
                             <p className="text-xs text-muted-foreground">{format(new Date(record.date), 'EEEE')}</p>
                           </div>
                          <Badge variant={record.status === 'present' ? 'default' : 'destructive'}>
                            {record.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="mobile-card">
                <CardContent className="p-6">
                  <div className="text-center">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Select a child to view attendance records</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Child Dialog */}
      <Dialog open={isAddChildDialogOpen} onOpenChange={setIsAddChildDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Child</DialogTitle>
            <DialogDescription>
              Enter your child's information to register them for transport services.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" placeholder="Enter first name" />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" placeholder="Enter last name" />
              </div>
            </div>
            <div>
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input id="dateOfBirth" type="date" />
            </div>
            <div>
              <Label htmlFor="school">School</Label>
              <Input id="school" placeholder="Enter school name" />
            </div>
            <div>
              <Label htmlFor="grade">Grade Level</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pre-k">Pre-K</SelectItem>
                  <SelectItem value="k">Kindergarten</SelectItem>
                  <SelectItem value="1">Grade 1</SelectItem>
                  <SelectItem value="2">Grade 2</SelectItem>
                  <SelectItem value="3">Grade 3</SelectItem>
                  <SelectItem value="4">Grade 4</SelectItem>
                  <SelectItem value="5">Grade 5</SelectItem>
                  <SelectItem value="6">Grade 6</SelectItem>
                  <SelectItem value="7">Grade 7</SelectItem>
                  <SelectItem value="8">Grade 8</SelectItem>
                  <SelectItem value="9">Grade 9</SelectItem>
                  <SelectItem value="10">Grade 10</SelectItem>
                  <SelectItem value="11">Grade 11</SelectItem>
                  <SelectItem value="12">Grade 12</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="medicalNotes">Medical Notes (Optional)</Label>
              <Textarea id="medicalNotes" placeholder="Any medical conditions or special requirements" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddChildDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              // TODO: Implement add child functionality
              setIsAddChildDialogOpen(false);
              toast({
                title: "Child added",
                description: "Your child has been registered successfully.",
              });
            }}>
              Add Child
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ResponsiveScaffold>
  );
};

export default MobileChildManagement;
