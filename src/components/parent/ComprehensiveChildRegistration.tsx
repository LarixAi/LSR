import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Plus, 
  Upload, 
  User, 
  AlertTriangle, 
  FileText, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  Clock,
  Shield,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  School,
  Heart,
  Car,
  Users,
  FileCheck
} from 'lucide-react';

interface ChildRegistrationData {
  // Basic Information
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  nationality: string;
  student_id: string;
  
  // School Information
  school_name: string;
  school_address: string;
  grade_level: string;
  class_name: string;
  school_start_date: string;
  
  // Transport Information
  pickup_location: string;
  dropoff_location: string;
  alternative_pickup_locations: string[];
  transport_days: string[];
  transport_type: string;
  morning_pickup_time: string;
  afternoon_dropoff_time: string;
  special_schedule_notes: string;
  holiday_transport_needed: boolean;
  
  // Medical Information
  allergies: string[];
  medical_conditions: string[];
  medications: string[];
  emergency_procedures: string;
  medical_alert_info: string;
  
  // Special Needs
  mobility_requirements: string;
  communication_needs: string;
  behavioral_considerations: string;
  required_equipment: string[];
  
  // Legal & Compliance
  transport_consent: boolean;
  medical_consent: boolean;
  photo_consent: boolean;
  data_protection_consent: boolean;
  
  // Emergency Contacts
  emergency_contacts: Array<{
    contact_name: string;
    relationship: string;
    phone: string;
    email: string;
    address: string;
    contact_type: string;
    is_primary: boolean;
    can_authorize_treatment: boolean;
  }>;
  
  // Financial
  payment_method: string;
  billing_address: string;
  discount_eligible: boolean;
  payment_schedule: string;
  
  // Communication
  notification_preferences: {
    sms: boolean;
    email: boolean;
    app: boolean;
    emergency_alerts: boolean;
  };
  language_preference: string;
}

interface ComprehensiveChildRegistrationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChildAdded?: () => void;
}

const ComprehensiveChildRegistration: React.FC<ComprehensiveChildRegistrationProps> = ({
  open,
  onOpenChange,
  onChildAdded
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ChildRegistrationData>({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    nationality: 'British',
    student_id: '',
    school_name: '',
    school_address: '',
    grade_level: '',
    class_name: '',
    school_start_date: '',
    pickup_location: '',
    dropoff_location: '',
    alternative_pickup_locations: [],
    transport_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    transport_type: 'both',
    morning_pickup_time: '',
    afternoon_dropoff_time: '',
    special_schedule_notes: '',
    holiday_transport_needed: false,
    allergies: [],
    medical_conditions: [],
    medications: [],
    emergency_procedures: '',
    medical_alert_info: '',
    mobility_requirements: '',
    communication_needs: '',
    behavioral_considerations: '',
    required_equipment: [],
    transport_consent: false,
    medical_consent: false,
    photo_consent: false,
    data_protection_consent: false,
    emergency_contacts: [],
    payment_method: '',
    billing_address: '',
    discount_eligible: false,
    payment_schedule: '',
    notification_preferences: {
      sms: true,
      email: true,
      app: true,
      emergency_alerts: true
    },
    language_preference: 'english'
  });

  // Fetch schools for dropdown
  const { data: schools = [] } = useQuery({
    queryKey: ['schools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  const totalSteps = 6;
  const progress = (currentStep / totalSteps) * 100;

  const steps = [
    { id: 1, name: 'Basic Information', icon: User },
    { id: 2, name: 'Transport Details', icon: Car },
    { id: 3, name: 'Medical Information', icon: Heart },
    { id: 4, name: 'Emergency Contacts', icon: Phone },
    { id: 5, name: 'Legal & Consent', icon: Shield },
    { id: 6, name: 'Review & Submit', icon: CheckCircle }
  ];

  const createChildMutation = useMutation({
    mutationFn: async (data: ChildRegistrationData) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Create child profile
      const { data: child, error: childError } = await supabase
        .from('child_profiles')
        .insert({
          parent_id: user.id,
          ...data,
          emergency_contacts: undefined // Remove from child_profiles
        })
        .select()
        .single();

      if (childError) throw childError;

      // Create emergency contacts
      if (data.emergency_contacts.length > 0) {
        const emergencyContactsData = data.emergency_contacts.map(contact => ({
          child_id: child.id,
          ...contact
        }));

        const { error: contactsError } = await supabase
          .from('emergency_contacts')
          .insert(emergencyContactsData);

        if (contactsError) throw contactsError;
      }

      return child;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parent-children'] });
      toast({
        title: "Child Registration Successful",
        description: "Your child has been registered for transport services.",
      });
      onOpenChange(false);
      onChildAdded?.();
      resetForm();
    },
    onError: (error) => {
      console.error('Error creating child:', error);
      toast({
        title: "Registration Failed",
        description: "There was an error registering your child. Please try again.",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      date_of_birth: '',
      gender: '',
      nationality: 'British',
      student_id: '',
      school_name: '',
      school_address: '',
      grade_level: '',
      class_name: '',
      school_start_date: '',
      pickup_location: '',
      dropoff_location: '',
      alternative_pickup_locations: [],
      transport_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      transport_type: 'both',
      morning_pickup_time: '',
      afternoon_dropoff_time: '',
      special_schedule_notes: '',
      holiday_transport_needed: false,
      allergies: [],
      medical_conditions: [],
      medications: [],
      emergency_procedures: '',
      medical_alert_info: '',
      mobility_requirements: '',
      communication_needs: '',
      behavioral_considerations: '',
      required_equipment: [],
      transport_consent: false,
      medical_consent: false,
      photo_consent: false,
      data_protection_consent: false,
      emergency_contacts: [],
      payment_method: '',
      billing_address: '',
      discount_eligible: false,
      payment_schedule: '',
      notification_preferences: {
        sms: true,
        email: true,
        app: true,
        emergency_alerts: true
      },
      language_preference: 'english'
    });
    setCurrentStep(1);
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    createChildMutation.mutate(formData);
  };

  const updateFormData = (field: keyof ChildRegistrationData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateEmergencyContact = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      emergency_contacts: prev.emergency_contacts.map((contact, i) =>
        i === index ? { ...contact, [field]: value } : contact
      )
    }));
  };

  const addEmergencyContact = () => {
    setFormData(prev => ({
      ...prev,
      emergency_contacts: [...prev.emergency_contacts, {
        contact_name: '',
        relationship: '',
        phone: '',
        email: '',
        address: '',
        contact_type: 'general',
        is_primary: false,
        can_authorize_treatment: false
      }]
    }));
  };

  const removeEmergencyContact = (index: number) => {
    setFormData(prev => ({
      ...prev,
      emergency_contacts: prev.emergency_contacts.filter((_, i) => i !== index)
    }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => updateFormData('first_name', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => updateFormData('last_name', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date_of_birth">Date of Birth *</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => updateFormData('date_of_birth', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select value={formData.gender} onValueChange={(value) => updateFormData('gender', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nationality">Nationality</Label>
                <Input
                  id="nationality"
                  value={formData.nationality}
                  onChange={(e) => updateFormData('nationality', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="student_id">Student ID</Label>
                <Input
                  id="student_id"
                  value={formData.student_id}
                  onChange={(e) => updateFormData('student_id', e.target.value)}
                  placeholder="School student ID"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="school_name">School *</Label>
              <Select value={formData.school_name} onValueChange={(value) => updateFormData('school_name', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select school" />
                </SelectTrigger>
                <SelectContent>
                  {schools.map((school) => (
                    <SelectItem key={school.id} value={school.name}>
                      {school.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="grade_level">Grade/Year Level *</Label>
                <Input
                  id="grade_level"
                  value={formData.grade_level}
                  onChange={(e) => updateFormData('grade_level', e.target.value)}
                  placeholder="e.g., Year 3, Grade 5"
                  required
                />
              </div>
              <div>
                <Label htmlFor="class_name">Class</Label>
                <Input
                  id="class_name"
                  value={formData.class_name}
                  onChange={(e) => updateFormData('class_name', e.target.value)}
                  placeholder="e.g., Class 3A"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pickup_location">Pickup Location *</Label>
                <Input
                  id="pickup_location"
                  value={formData.pickup_location}
                  onChange={(e) => updateFormData('pickup_location', e.target.value)}
                  placeholder="Full address"
                  required
                />
              </div>
              <div>
                <Label htmlFor="dropoff_location">Dropoff Location *</Label>
                <Input
                  id="dropoff_location"
                  value={formData.dropoff_location}
                  onChange={(e) => updateFormData('dropoff_location', e.target.value)}
                  placeholder="School address"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="transport_type">Transport Type *</Label>
              <Select value={formData.transport_type} onValueChange={(value) => updateFormData('transport_type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select transport type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning_only">Morning Only</SelectItem>
                  <SelectItem value="afternoon_only">Afternoon Only</SelectItem>
                  <SelectItem value="both">Both Morning & Afternoon</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="morning_pickup_time">Morning Pickup Time</Label>
                <Input
                  id="morning_pickup_time"
                  type="time"
                  value={formData.morning_pickup_time}
                  onChange={(e) => updateFormData('morning_pickup_time', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="afternoon_dropoff_time">Afternoon Dropoff Time</Label>
                <Input
                  id="afternoon_dropoff_time"
                  type="time"
                  value={formData.afternoon_dropoff_time}
                  onChange={(e) => updateFormData('afternoon_dropoff_time', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="special_schedule_notes">Special Schedule Notes</Label>
              <Textarea
                id="special_schedule_notes"
                value={formData.special_schedule_notes}
                onChange={(e) => updateFormData('special_schedule_notes', e.target.value)}
                placeholder="Any special scheduling requirements"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="holiday_transport"
                checked={formData.holiday_transport_needed}
                onCheckedChange={(checked) => updateFormData('holiday_transport_needed', checked)}
              />
              <Label htmlFor="holiday_transport">Holiday transport needed</Label>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="allergies">Allergies</Label>
              <Textarea
                id="allergies"
                value={formData.allergies.join(', ')}
                onChange={(e) => updateFormData('allergies', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                placeholder="List any allergies (separate with commas)"
              />
            </div>

            <div>
              <Label htmlFor="medical_conditions">Medical Conditions</Label>
              <Textarea
                id="medical_conditions"
                value={formData.medical_conditions.join(', ')}
                onChange={(e) => updateFormData('medical_conditions', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                placeholder="List any medical conditions (separate with commas)"
              />
            </div>

            <div>
              <Label htmlFor="medications">Medications</Label>
              <Textarea
                id="medications"
                value={formData.medications.join(', ')}
                onChange={(e) => updateFormData('medications', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                placeholder="List any medications (separate with commas)"
              />
            </div>

            <div>
              <Label htmlFor="emergency_procedures">Emergency Procedures</Label>
              <Textarea
                id="emergency_procedures"
                value={formData.emergency_procedures}
                onChange={(e) => updateFormData('emergency_procedures', e.target.value)}
                placeholder="Emergency procedures for medical conditions"
              />
            </div>

            <div>
              <Label htmlFor="medical_alert_info">Medical Alert Information</Label>
              <Textarea
                id="medical_alert_info"
                value={formData.medical_alert_info}
                onChange={(e) => updateFormData('medical_alert_info', e.target.value)}
                placeholder="Any medical alert information"
              />
            </div>

            <div>
              <Label htmlFor="mobility_requirements">Mobility Requirements</Label>
              <Textarea
                id="mobility_requirements"
                value={formData.mobility_requirements}
                onChange={(e) => updateFormData('mobility_requirements', e.target.value)}
                placeholder="Any mobility requirements or assistance needed"
              />
            </div>

            <div>
              <Label htmlFor="communication_needs">Communication Needs</Label>
              <Textarea
                id="communication_needs"
                value={formData.communication_needs}
                onChange={(e) => updateFormData('communication_needs', e.target.value)}
                placeholder="Any communication needs or preferences"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Emergency Contacts</h3>
              <Button type="button" variant="outline" size="sm" onClick={addEmergencyContact}>
                <Plus className="w-4 h-4 mr-2" />
                Add Contact
              </Button>
            </div>

            {formData.emergency_contacts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Phone className="w-12 h-12 mx-auto mb-4" />
                <p>No emergency contacts added yet.</p>
                <p className="text-sm">Click "Add Contact" to add emergency contacts.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.emergency_contacts.map((contact, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Contact {index + 1}</CardTitle>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEmergencyContact(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Contact Name *</Label>
                          <Input
                            value={contact.contact_name}
                            onChange={(e) => updateEmergencyContact(index, 'contact_name', e.target.value)}
                            placeholder="Full name"
                          />
                        </div>
                        <div>
                          <Label>Relationship *</Label>
                          <Input
                            value={contact.relationship}
                            onChange={(e) => updateEmergencyContact(index, 'relationship', e.target.value)}
                            placeholder="e.g., Mother, Father, Grandparent"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Phone Number *</Label>
                          <Input
                            value={contact.phone}
                            onChange={(e) => updateEmergencyContact(index, 'phone', e.target.value)}
                            placeholder="Phone number"
                          />
                        </div>
                        <div>
                          <Label>Email</Label>
                          <Input
                            type="email"
                            value={contact.email}
                            onChange={(e) => updateEmergencyContact(index, 'email', e.target.value)}
                            placeholder="Email address"
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Address</Label>
                        <Textarea
                          value={contact.address}
                          onChange={(e) => updateEmergencyContact(index, 'address', e.target.value)}
                          placeholder="Full address"
                          rows={2}
                        />
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={contact.is_primary}
                            onCheckedChange={(checked) => updateEmergencyContact(index, 'is_primary', checked)}
                          />
                          <Label>Primary Contact</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={contact.can_authorize_treatment}
                            onCheckedChange={(checked) => updateEmergencyContact(index, 'can_authorize_treatment', checked)}
                          />
                          <Label>Can Authorize Medical Treatment</Label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Consent Forms</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="transport_consent"
                    checked={formData.transport_consent}
                    onCheckedChange={(checked) => updateFormData('transport_consent', checked)}
                  />
                  <Label htmlFor="transport_consent">I consent to my child using the transport service</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="medical_consent"
                    checked={formData.medical_consent}
                    onCheckedChange={(checked) => updateFormData('medical_consent', checked)}
                  />
                  <Label htmlFor="medical_consent">I consent to emergency medical treatment if required</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="photo_consent"
                    checked={formData.photo_consent}
                    onCheckedChange={(checked) => updateFormData('photo_consent', checked)}
                  />
                  <Label htmlFor="photo_consent">I consent to photos/videos being taken for safety purposes</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="data_protection_consent"
                    checked={formData.data_protection_consent}
                    onCheckedChange={(checked) => updateFormData('data_protection_consent', checked)}
                  />
                  <Label htmlFor="data_protection_consent">I consent to my data being processed in accordance with GDPR</Label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Communication Preferences</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sms_notifications"
                    checked={formData.notification_preferences.sms}
                    onCheckedChange={(checked) => updateFormData('notification_preferences', {
                      ...formData.notification_preferences,
                      sms: checked
                    })}
                  />
                  <Label htmlFor="sms_notifications">SMS Notifications</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="email_notifications"
                    checked={formData.notification_preferences.email}
                    onCheckedChange={(checked) => updateFormData('notification_preferences', {
                      ...formData.notification_preferences,
                      email: checked
                    })}
                  />
                  <Label htmlFor="email_notifications">Email Notifications</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="app_notifications"
                    checked={formData.notification_preferences.app}
                    onCheckedChange={(checked) => updateFormData('notification_preferences', {
                      ...formData.notification_preferences,
                      app: checked
                    })}
                  />
                  <Label htmlFor="app_notifications">App Notifications</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="emergency_alerts"
                    checked={formData.notification_preferences.emergency_alerts}
                    onCheckedChange={(checked) => updateFormData('notification_preferences', {
                      ...formData.notification_preferences,
                      emergency_alerts: checked
                    })}
                  />
                  <Label htmlFor="emergency_alerts">Emergency Alerts</Label>
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Review Registration Details</h3>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>Name:</strong> {formData.first_name} {formData.last_name}</div>
                    <div><strong>Date of Birth:</strong> {formData.date_of_birth}</div>
                    <div><strong>Gender:</strong> {formData.gender}</div>
                    <div><strong>Nationality:</strong> {formData.nationality}</div>
                    <div><strong>School:</strong> {formData.school_name}</div>
                    <div><strong>Grade:</strong> {formData.grade_level}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Transport Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>Pickup:</strong> {formData.pickup_location}</div>
                    <div><strong>Dropoff:</strong> {formData.dropoff_location}</div>
                    <div><strong>Type:</strong> {formData.transport_type}</div>
                    <div><strong>Morning Time:</strong> {formData.morning_pickup_time}</div>
                    <div><strong>Afternoon Time:</strong> {formData.afternoon_dropoff_time}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Emergency Contacts</CardTitle>
                </CardHeader>
                <CardContent>
                  {formData.emergency_contacts.length === 0 ? (
                    <p className="text-gray-500">No emergency contacts added</p>
                  ) : (
                    <div className="space-y-2">
                      {formData.emergency_contacts.map((contact, index) => (
                        <div key={index} className="text-sm">
                          <strong>{contact.contact_name}</strong> ({contact.relationship}) - {contact.phone}
                          {contact.is_primary && <Badge className="ml-2">Primary</Badge>}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Consent Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className={`w-4 h-4 ${formData.transport_consent ? 'text-green-500' : 'text-gray-300'}`} />
                      <span>Transport Consent</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className={`w-4 h-4 ${formData.medical_consent ? 'text-green-500' : 'text-gray-300'}`} />
                      <span>Medical Consent</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className={`w-4 h-4 ${formData.photo_consent ? 'text-green-500' : 'text-gray-300'}`} />
                      <span>Photo Consent</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className={`w-4 h-4 ${formData.data_protection_consent ? 'text-green-500' : 'text-gray-300'}`} />
                      <span>Data Protection Consent</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Register Child for Transport</DialogTitle>
          <DialogDescription>
            Complete the registration process for your child's transport service.
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="w-full" />
          
          {/* Step Indicators */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex flex-col items-center space-y-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isCompleted ? 'bg-green-500 text-white' :
                    isActive ? 'bg-blue-500 text-white' :
                    'bg-gray-200 text-gray-500'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <span className={`text-xs text-center ${
                    isActive ? 'text-blue-600 font-medium' : 'text-gray-500'
                  }`}>
                    {step.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="py-6">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex items-center space-x-2">
            {currentStep < totalSteps ? (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={createChildMutation.isPending}
              >
                {createChildMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Complete Registration
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ComprehensiveChildRegistration;
