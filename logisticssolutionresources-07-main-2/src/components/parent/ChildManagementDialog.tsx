import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Upload, User, AlertTriangle, FileText } from 'lucide-react';

interface ChildProfile {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  grade?: string;
  school?: string;
  pickup_location: string;
  dropoff_location?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  medical_conditions?: string;
  allergies?: string;
  special_instructions?: string;
  profile_image_url?: string;
}

interface RiskAssessment {
  id: string;
  assessment_type: string;
  risk_level: string;
  description: string;
  required_equipment?: string;
  document_url?: string;
}

const ChildManagementDialog = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selectedChild, setSelectedChild] = useState<ChildProfile | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [riskAssessmentFile, setRiskAssessmentFile] = useState<File | null>(null);

  const [formData, setFormData] = useState<Partial<ChildProfile>>({
    first_name: '',
    last_name: '',
    pickup_location: '',
  });

  const [riskAssessment, setRiskAssessment] = useState({
    assessment_type: '',
    risk_level: 'low',
    description: '',
    required_equipment: '',
  });

  // Mock data for children since child_profiles table doesn't exist
  const { data: children } = useQuery({
    queryKey: ['child-profiles', user?.id],
    queryFn: async () => {
      console.log('Fetching children for user:', user?.id);
      
      // Mock children data
      const mockChildren: ChildProfile[] = [
        {
          id: 'child-1',
          first_name: 'Emma',
          last_name: 'Johnson',
          date_of_birth: '2015-03-15',
          grade: '3rd Grade',
          school: 'Lincoln Elementary',
          pickup_location: '123 Main Street',
          dropoff_location: 'Lincoln Elementary School',
          emergency_contact_name: 'Jane Johnson',
          emergency_contact_phone: '555-0123',
          medical_conditions: 'None',
          allergies: 'Peanuts',
          special_instructions: 'Please ensure seatbelt is properly fastened',
          profile_image_url: undefined
        },
        {
          id: 'child-2',
          first_name: 'Noah',
          last_name: 'Johnson',
          date_of_birth: '2017-08-22',
          grade: '1st Grade',
          school: 'Lincoln Elementary',
          pickup_location: '123 Main Street',
          dropoff_location: 'Lincoln Elementary School',
          emergency_contact_name: 'Jane Johnson',
          emergency_contact_phone: '555-0123',
          medical_conditions: 'Asthma',
          allergies: 'None',
          special_instructions: 'Carries inhaler in backpack',
          profile_image_url: undefined
        }
      ];

      return mockChildren;
    },
    enabled: !!user?.id
  });

  // Mock data for risk assessments since risk_assessments table doesn't exist
  const { data: childRiskAssessments } = useQuery({
    queryKey: ['risk-assessments', selectedChild?.id],
    queryFn: async () => {
      if (!selectedChild?.id) return [];
      
      console.log('Fetching risk assessments for child:', selectedChild.id);
      
      // Mock risk assessments data
      const mockRiskAssessments: RiskAssessment[] = [
        {
          id: 'risk-1',
          assessment_type: 'medical',
          risk_level: 'medium',
          description: 'Child has asthma and may need inhaler during transport',
          required_equipment: 'Emergency inhaler accessible',
          document_url: undefined
        },
        {
          id: 'risk-2',
          assessment_type: 'behavioral',
          risk_level: 'low',
          description: 'Child may get car sick on longer trips',
          required_equipment: 'Motion sickness bags available',
          document_url: undefined
        }
      ];

      return selectedChild.id === 'child-2' ? mockRiskAssessments : [];
    },
    enabled: !!selectedChild?.id
  });

  const uploadFile = async (file: File, bucket: string, folder: string) => {
    // Mock file upload since storage buckets don't exist
    console.log('Mock uploading file:', file.name, 'to bucket:', bucket, 'folder:', folder);
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return a mock URL
    return `https://mock-storage.example.com/${bucket}/${folder}/${user?.id}/${Date.now()}_${file.name}`;
  };

  const saveChildMutation = useMutation({
    mutationFn: async (data: Partial<ChildProfile>) => {
      console.log('Saving child profile:', data);
      
      let profileImageUrl = data.profile_image_url;

      if (imageFile) {
        profileImageUrl = await uploadFile(imageFile, 'child-profiles', 'profile-images');
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const childData = {
        ...data,
        profile_image_url: profileImageUrl,
        parent_id: user?.id,
        first_name: data.first_name!,
        last_name: data.last_name!,
        pickup_location: data.pickup_location!,
        id: selectedChild?.id || `child-${Date.now()}`,
      };

      return childData as ChildProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['child-profiles'] });
      toast({
        title: "Success",
        description: `Child profile ${selectedChild ? 'updated' : 'created'} successfully.`,
      });
      resetForm();
      setOpen(false);
    },
    onError: (error) => {
      console.error('Error saving child profile:', error);
      toast({
        title: "Error",
        description: "Failed to save child profile. Please try again.",
        variant: "destructive",
      });
    }
  });

  const saveRiskAssessmentMutation = useMutation({
    mutationFn: async () => {
      if (!selectedChild || !riskAssessment.description) return;

      console.log('Saving risk assessment:', riskAssessment);

      let documentUrl;
      if (riskAssessmentFile) {
        documentUrl = await uploadFile(riskAssessmentFile, 'risk-assessments', 'documents');
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const assessmentData = {
        ...riskAssessment,
        id: `risk-${Date.now()}`,
        child_id: selectedChild.id,
        document_url: documentUrl,
        created_by: user?.id,
      };

      return assessmentData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['risk-assessments'] });
      toast({
        title: "Risk Assessment Saved",
        description: "Risk assessment has been saved successfully.",
      });
      setRiskAssessment({
        assessment_type: '',
        risk_level: 'low',
        description: '',
        required_equipment: '',
      });
      setRiskAssessmentFile(null);
    },
    onError: (error) => {
      console.error('Error saving risk assessment:', error);
      toast({
        title: "Error",
        description: "Failed to save risk assessment. Please try again.",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      pickup_location: '',
    });
    setSelectedChild(null);
    setImageFile(null);
    setRiskAssessmentFile(null);
  };

  const handleEditChild = (child: ChildProfile) => {
    setSelectedChild(child);
    setFormData(child);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-teal-600 hover:bg-teal-700">
          <Plus className="w-4 h-4 mr-2" />
          Manage Children
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Child Management</DialogTitle>
          <DialogDescription>
            Add or update your child's information, upload profile photos, and manage risk assessments.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Existing Children */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Your Children</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {children?.map((child) => (
                <Card key={child.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleEditChild(child)}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={child.profile_image_url} />
                        <AvatarFallback>
                          <User className="h-6 w-6" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{child.first_name} {child.last_name}</h4>
                        <p className="text-sm text-gray-500">{child.pickup_location}</p>
                        {child.grade && <Badge variant="outline">{child.grade}</Badge>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" className="w-full" onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Add New Child
              </Button>
            </div>
          </div>

          {/* Child Form */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {selectedChild ? 'Edit Child' : 'Add New Child'}
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name || ''}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name || ''}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input
                id="date_of_birth"
                type="date"
                value={formData.date_of_birth || ''}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="grade">Grade</Label>
                <Input
                  id="grade"
                  value={formData.grade || ''}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="school">School</Label>
                <Input
                  id="school"
                  value={formData.school || ''}
                  onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="pickup_location">Pickup Location *</Label>
              <Input
                id="pickup_location"
                value={formData.pickup_location || ''}
                onChange={(e) => setFormData({ ...formData, pickup_location: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="profile_image">Profile Photo</Label>
              <Input
                id="profile_image"
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
              />
            </div>

            <div>
              <Label htmlFor="medical_conditions">Medical Conditions</Label>
              <Textarea
                id="medical_conditions"
                value={formData.medical_conditions || ''}
                onChange={(e) => setFormData({ ...formData, medical_conditions: e.target.value })}
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="allergies">Allergies</Label>
              <Textarea
                id="allergies"
                value={formData.allergies || ''}
                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                rows={2}
              />
            </div>

            <Button 
              onClick={() => saveChildMutation.mutate(formData)}
              disabled={!formData.first_name || !formData.last_name || !formData.pickup_location || saveChildMutation.isPending}
              className="w-full"
            >
              {saveChildMutation.isPending ? 'Saving...' : selectedChild ? 'Update Child' : 'Add Child'}
            </Button>
          </div>
        </div>

        {/* Risk Assessment Section */}
        {selectedChild && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
              Risk Assessment for {selectedChild.first_name}
            </h3>

            {/* Existing Risk Assessments */}
            {childRiskAssessments && childRiskAssessments.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium mb-2">Current Risk Assessments</h4>
                <div className="space-y-2">
                  {childRiskAssessments.map((assessment) => (
                    <Card key={assessment.id} className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Badge variant={assessment.risk_level === 'high' ? 'destructive' : assessment.risk_level === 'medium' ? 'default' : 'secondary'}>
                            {assessment.risk_level.toUpperCase()} RISK
                          </Badge>
                          <p className="font-medium">{assessment.assessment_type}</p>
                          <p className="text-sm text-gray-600">{assessment.description}</p>
                          {assessment.required_equipment && (
                            <p className="text-sm font-medium text-blue-600">Required: {assessment.required_equipment}</p>
                          )}
                        </div>
                        {assessment.document_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={assessment.document_url} target="_blank" rel="noopener noreferrer">
                              <FileText className="w-4 h-4 mr-1" />
                              View Doc
                            </a>
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Add New Risk Assessment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="assessment_type">Assessment Type</Label>
                <Select 
                  value={riskAssessment.assessment_type} 
                  onValueChange={(value) => setRiskAssessment({ ...riskAssessment, assessment_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mobility">Mobility</SelectItem>
                    <SelectItem value="behavioral">Behavioral</SelectItem>
                    <SelectItem value="medical">Medical</SelectItem>
                    <SelectItem value="safety">Safety</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="risk_level">Risk Level</Label>
                <Select 
                  value={riskAssessment.risk_level} 
                  onValueChange={(value) => setRiskAssessment({ ...riskAssessment, risk_level: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="required_equipment">Required Equipment</Label>
                <Input
                  id="required_equipment"
                  value={riskAssessment.required_equipment}
                  onChange={(e) => setRiskAssessment({ ...riskAssessment, required_equipment: e.target.value })}
                  placeholder="e.g., car seat, harness, wheelchair access"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={riskAssessment.description}
                  onChange={(e) => setRiskAssessment({ ...riskAssessment, description: e.target.value })}
                  rows={3}
                  placeholder="Describe the assessment details..."
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="risk_document">Assessment Document</Label>
                <Input
                  id="risk_document"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setRiskAssessmentFile(e.target.files?.[0] || null)}
                  className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                />
              </div>

              <div className="md:col-span-2">
                <Button 
                  onClick={() => saveRiskAssessmentMutation.mutate()}
                  disabled={!riskAssessment.description || !riskAssessment.assessment_type || saveRiskAssessmentMutation.isPending}
                  variant="outline"
                  className="w-full"
                >
                  {saveRiskAssessmentMutation.isPending ? 'Saving...' : 'Add Risk Assessment'}
                </Button>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChildManagementDialog;
