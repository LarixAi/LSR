import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useVehicles } from '@/hooks/useVehicles';
import { useStudents } from '@/hooks/useStudents';
import { usePersonalAssistants } from '@/hooks/usePersonalAssistants';
import { useCreateRoute } from '@/hooks/useRoutes';
import { useCreateRouteStop } from '@/hooks/usePersonalAssistants';
import { useCreateRouteStudent } from '@/hooks/useStudents';
import { useCreateRoutePersonalAssistant } from '@/hooks/usePersonalAssistants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  Circle, 
  Bus, 
  Users, 
  MapPin, 
  UserPlus,
  Plus,
  Trash2,
  Clock
} from 'lucide-react';

interface RouteData {
  // Basic Route Info
  route_name: string;
  school_name: string;
  grade_levels: string;
  contact_person: string;
  contact_phone: string;
  contact_email: string;
  notes: string;
  
  // Vehicle & Driver
  assigned_vehicle_id: string;
  assigned_driver_id: string;
  
  // Stops
  stops: Array<{
    stop_name: string;
    stop_type: 'pickup' | 'dropoff' | 'both';
    address: string;
    estimated_time: string;
    stop_order: number;
    passenger_count: number;
  }>;
  
  // Students
  students: Array<{
    student_id: string;
    pickup_stop_id: string;
    dropoff_stop_id: string;
    pickup_time: string;
    dropoff_time: string;
    days_of_week: number[];
  }>;
  
  // Personal Assistants
  personal_assistants: Array<{
    personal_assistant_id: string;
    assignment_date: string;
    start_time: string;
    end_time: string;
    status: 'assigned' | 'confirmed';
  }>;
}

const CreateSchoolRouteWizard: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [routeData, setRouteData] = useState<RouteData>({
    route_name: '',
    school_name: '',
    grade_levels: '',
    contact_person: '',
    contact_phone: '',
    contact_email: '',
    notes: '',
    assigned_vehicle_id: '',
    assigned_driver_id: '',
    stops: [],
    students: [],
    personal_assistants: []
  });

  // Data hooks
  const { data: vehicles = [] } = useVehicles();
  const { data: students = [] } = useStudents();
  const { data: personalAssistants = [] } = usePersonalAssistants();
  
  // Mutation hooks
  const createRouteMutation = useCreateRoute();
  const createStopMutation = useCreateRouteStop();
  const createStudentMutation = useCreateRouteStudent();
  const createPAMutation = useCreateRoutePersonalAssistant();

  const steps = [
    { id: 1, title: 'Basic Info', icon: Circle },
    { id: 2, title: 'Vehicle & Driver', icon: Bus },
    { id: 3, title: 'Stops', icon: MapPin },
    { id: 4, title: 'Students', icon: Users },
    { id: 5, title: 'Personal Assistants', icon: UserPlus },
    { id: 6, title: 'Review & Create', icon: CheckCircle }
  ];

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreateRoute = async () => {
    try {
      // Create the route first
      const routePayload: any = {
        name: routeData.route_name || 'New School Route', // Ensure name is never empty
        route_type: 'school',
        school_name: routeData.school_name || '',
        grade_levels: routeData.grade_levels ? [routeData.grade_levels] : [], // Convert string to array
        contact_person: routeData.contact_person || '',
        contact_phone: routeData.contact_phone || '',
        contact_email: routeData.contact_email || '',
        notes: routeData.notes || '',
        status: 'active',
        stops: routeData.stops || [], // Ensure stops is always an array
        schedule: {}, // Ensure schedule is always an object
        pickup_times: [], // Default empty array for pickup times
        dropoff_times: [], // Default empty array for dropoff times
        days_of_week: [1, 2, 3, 4, 5] // Default to weekdays
      };

      // Only include vehicle and driver IDs if they're not empty
      if (routeData.assigned_vehicle_id && routeData.assigned_vehicle_id.trim() !== '') {
        routePayload.assigned_vehicle_id = routeData.assigned_vehicle_id;
      }
      if (routeData.assigned_driver_id && routeData.assigned_driver_id.trim() !== '') {
        routePayload.assigned_driver_id = routeData.assigned_driver_id;
      }

      const newRoute = await createRouteMutation.mutateAsync(routePayload);

      // Create stops
      for (const stop of routeData.stops) {
        await createStopMutation.mutateAsync({
          route_id: newRoute.id,
          ...stop
        });
      }

      // Create student assignments
      for (const student of routeData.students) {
        await createStudentMutation.mutateAsync({
          route_id: newRoute.id,
          ...student
        });
      }

      // Create PA assignments
      for (const pa of routeData.personal_assistants) {
        await createPAMutation.mutateAsync({
          route_id: newRoute.id,
          ...pa
        });
      }

      toast({
        title: "Success!",
        description: "School route created successfully with all components.",
      });
      
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create school route. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Route Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="route_name">Route Name *</Label>
                <Input
                  id="route_name"
                  value={routeData.route_name}
                  onChange={(e) => setRouteData({ ...routeData, route_name: e.target.value })}
                  placeholder="e.g., Central School Route 1"
                />
              </div>
              <div>
                <Label htmlFor="school_name">School Name *</Label>
                <Input
                  id="school_name"
                  value={routeData.school_name}
                  onChange={(e) => setRouteData({ ...routeData, school_name: e.target.value })}
                  placeholder="e.g., Central Elementary School"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="grade_levels">Grade Levels</Label>
              <Input
                id="grade_levels"
                value={routeData.grade_levels}
                onChange={(e) => setRouteData({ ...routeData, grade_levels: e.target.value })}
                placeholder="e.g., K-5, 6-8"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="contact_person">Contact Person</Label>
                <Input
                  id="contact_person"
                  value={routeData.contact_person}
                  onChange={(e) => setRouteData({ ...routeData, contact_person: e.target.value })}
                  placeholder="Contact name"
                />
              </div>
              <div>
                <Label htmlFor="contact_phone">Contact Phone</Label>
                <Input
                  id="contact_phone"
                  value={routeData.contact_phone}
                  onChange={(e) => setRouteData({ ...routeData, contact_phone: e.target.value })}
                  placeholder="Phone number"
                />
              </div>
              <div>
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={routeData.contact_email}
                  onChange={(e) => setRouteData({ ...routeData, contact_email: e.target.value })}
                  placeholder="Email address"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={routeData.notes}
                onChange={(e) => setRouteData({ ...routeData, notes: e.target.value })}
                placeholder="Additional notes about this route"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Vehicle & Driver Assignment</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vehicle">Select Vehicle</Label>
                <Select 
                  value={routeData.assigned_vehicle_id} 
                  onValueChange={(value) => setRouteData({ ...routeData, assigned_vehicle_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles
                      .filter(vehicle => vehicle.status === 'active')
                      .map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.registration_number} - {vehicle.make} {vehicle.model}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="driver">Select Driver</Label>
                <Select 
                  value={routeData.assigned_driver_id} 
                  onValueChange={(value) => setRouteData({ ...routeData, assigned_driver_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a driver" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Add driver options here */}
                    <SelectItem value="driver1">John Smith</SelectItem>
                    <SelectItem value="driver2">Jane Doe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Route Stops</h3>
              <Button onClick={() => {
                const newStop = {
                  stop_name: '',
                  stop_type: 'pickup' as const,
                  address: '',
                  estimated_time: '',
                  stop_order: routeData.stops.length + 1,
                  passenger_count: 0
                };
                setRouteData({ ...routeData, stops: [...routeData.stops, newStop] });
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Stop
              </Button>
            </div>
            
            <div className="space-y-3">
              {routeData.stops.map((stop, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Stop Name</Label>
                        <Input
                          value={stop.stop_name}
                          onChange={(e) => {
                            const newStops = [...routeData.stops];
                            newStops[index].stop_name = e.target.value;
                            setRouteData({ ...routeData, stops: newStops });
                          }}
                          placeholder="e.g., Central Park Pickup"
                        />
                      </div>
                      <div>
                        <Label>Stop Type</Label>
                        <Select 
                          value={stop.stop_type} 
                          onValueChange={(value: 'pickup' | 'dropoff' | 'both') => {
                            const newStops = [...routeData.stops];
                            newStops[index].stop_type = value;
                            setRouteData({ ...routeData, stops: newStops });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pickup">Pickup</SelectItem>
                            <SelectItem value="dropoff">Dropoff</SelectItem>
                            <SelectItem value="both">Both</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2">
                        <Label>Address</Label>
                        <Input
                          value={stop.address}
                          onChange={(e) => {
                            const newStops = [...routeData.stops];
                            newStops[index].address = e.target.value;
                            setRouteData({ ...routeData, stops: newStops });
                          }}
                          placeholder="Full address"
                        />
                      </div>
                      <div>
                        <Label>Estimated Time</Label>
                        <Input
                          type="time"
                          value={stop.estimated_time}
                          onChange={(e) => {
                            const newStops = [...routeData.stops];
                            newStops[index].estimated_time = e.target.value;
                            setRouteData({ ...routeData, stops: newStops });
                          }}
                        />
                      </div>
                      <div>
                        <Label>Passenger Count</Label>
                        <Input
                          type="number"
                          value={stop.passenger_count}
                          onChange={(e) => {
                            const newStops = [...routeData.stops];
                            newStops[index].passenger_count = parseInt(e.target.value) || 0;
                            setRouteData({ ...routeData, stops: newStops });
                          }}
                        />
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        const newStops = routeData.stops.filter((_, i) => i !== index);
                        setRouteData({ ...routeData, stops: newStops });
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove Stop
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Student Assignments</h3>
              <Button onClick={() => {
                const newStudent = {
                  student_id: '',
                  pickup_stop_id: '',
                  dropoff_stop_id: '',
                  pickup_time: '',
                  dropoff_time: '',
                  days_of_week: [1, 2, 3, 4, 5]
                };
                setRouteData({ ...routeData, students: [...routeData.students, newStudent] });
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Student
              </Button>
            </div>
            
            <div className="space-y-3">
              {routeData.students.map((student, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Select Student</Label>
                        <Select 
                          value={student.student_id} 
                          onValueChange={(value) => {
                            const newStudents = [...routeData.students];
                            newStudents[index].student_id = value;
                            setRouteData({ ...routeData, students: newStudents });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a student" />
                          </SelectTrigger>
                          <SelectContent>
                            {students
                              .filter(student => student.is_active)
                              .map((s) => (
                                <SelectItem key={s.id} value={s.id}>
                                  {s.first_name} {s.last_name} - Grade {s.grade_level}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Pickup Time</Label>
                        <Input
                          type="time"
                          value={student.pickup_time}
                          onChange={(e) => {
                            const newStudents = [...routeData.students];
                            newStudents[index].pickup_time = e.target.value;
                            setRouteData({ ...routeData, students: newStudents });
                          }}
                        />
                      </div>
                      <div>
                        <Label>Dropoff Time</Label>
                        <Input
                          type="time"
                          value={student.dropoff_time}
                          onChange={(e) => {
                            const newStudents = [...routeData.students];
                            newStudents[index].dropoff_time = e.target.value;
                            setRouteData({ ...routeData, students: newStudents });
                          }}
                        />
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        const newStudents = routeData.students.filter((_, i) => i !== index);
                        setRouteData({ ...routeData, students: newStudents });
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove Student
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Personal Assistant Assignments</h3>
              <Button onClick={() => {
                const newPA = {
                  personal_assistant_id: '',
                  assignment_date: '',
                  start_time: '',
                  end_time: '',
                  status: 'assigned' as const
                };
                setRouteData({ ...routeData, personal_assistants: [...routeData.personal_assistants, newPA] });
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Add PA
              </Button>
            </div>
            
            <div className="space-y-3">
              {routeData.personal_assistants.map((pa, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Select Personal Assistant</Label>
                        <Select 
                          value={pa.personal_assistant_id} 
                          onValueChange={(value) => {
                            const newPAs = [...routeData.personal_assistants];
                            newPAs[index].personal_assistant_id = value;
                            setRouteData({ ...routeData, personal_assistants: newPAs });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a PA" />
                          </SelectTrigger>
                          <SelectContent>
                            {personalAssistants
                              .filter(pa => pa.is_active)
                              .map((p) => (
                                <SelectItem key={p.id} value={p.id}>
                                  {p.first_name} {p.last_name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Assignment Date</Label>
                        <Input
                          type="date"
                          value={pa.assignment_date}
                          onChange={(e) => {
                            const newPAs = [...routeData.personal_assistants];
                            newPAs[index].assignment_date = e.target.value;
                            setRouteData({ ...routeData, personal_assistants: newPAs });
                          }}
                        />
                      </div>
                      <div>
                        <Label>Start Time</Label>
                        <Input
                          type="time"
                          value={pa.start_time}
                          onChange={(e) => {
                            const newPAs = [...routeData.personal_assistants];
                            newPAs[index].start_time = e.target.value;
                            setRouteData({ ...routeData, personal_assistants: newPAs });
                          }}
                        />
                      </div>
                      <div>
                        <Label>End Time</Label>
                        <Input
                          type="time"
                          value={pa.end_time}
                          onChange={(e) => {
                            const newPAs = [...routeData.personal_assistants];
                            newPAs[index].end_time = e.target.value;
                            setRouteData({ ...routeData, personal_assistants: newPAs });
                          }}
                        />
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        const newPAs = routeData.personal_assistants.filter((_, i) => i !== index);
                        setRouteData({ ...routeData, personal_assistants: newPAs });
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove PA
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Review & Create Route</h3>
            
            <Card>
              <CardHeader>
                <CardTitle>Route Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-medium">Route Name</Label>
                    <p>{routeData.route_name}</p>
                  </div>
                  <div>
                    <Label className="font-medium">School</Label>
                    <p>{routeData.school_name}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Grade Levels</Label>
                    <p>{routeData.grade_levels}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Contact</Label>
                    <p>{routeData.contact_person}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <MapPin className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                  <p className="font-semibold">{routeData.stops.length}</p>
                  <p className="text-sm text-gray-600">Stops</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <p className="font-semibold">{routeData.students.length}</p>
                  <p className="text-sm text-gray-600">Students</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <UserPlus className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                  <p className="font-semibold">{routeData.personal_assistants.length}</p>
                  <p className="text-sm text-gray-600">PAs</p>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateRoute}
                disabled={createRouteMutation.isPending}
              >
                {createRouteMutation.isPending ? 'Creating...' : 'Create School Route'}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
           <Dialog open={true} onOpenChange={onClose}>
         <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
           <DialogHeader>
             <DialogTitle>Create New School Route</DialogTitle>
             <DialogDescription>
               Follow the step-by-step process to create a complete school route with vehicle, driver, stops, students, and personal assistants.
             </DialogDescription>
           </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  isCompleted ? 'bg-green-500 text-white' :
                  isActive ? 'bg-blue-500 text-white' :
                  'bg-gray-200 text-gray-600'
                }`}>
                  {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  isActive ? 'text-blue-600' : 'text-gray-600'
                }`}>
                  {step.title}
                </span>
                {index < steps.length - 1 && (
                  <div className="w-8 h-px bg-gray-300 mx-2" />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="mb-6">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          {currentStep < steps.length ? (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSchoolRouteWizard;
