import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  AlertTriangle, 
  FileText, 
  Plus, 
  Edit, 
  Trash2,
  Shield,
  Heart,
  Brain,
  Globe
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  useChildProfiles, 
  useRiskAssessments, 
  useCreateChildProfile, 
  useUpdateChildProfile,
  useCreateRiskAssessment,
  calculateAge,
  type ChildProfile,
  type RiskAssessment
} from '@/hooks/useChildManagement';
import { useToast } from '@/hooks/use-toast';

const ChildManagementDialog = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [selectedChild, setSelectedChild] = useState<ChildProfile | null>(null);
  const [isAddChildDialogOpen, setIsAddChildDialogOpen] = useState(false);
  const [isAddRiskAssessmentDialogOpen, setIsAddRiskAssessmentDialogOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<ChildProfile | null>(null);
  const [isEditChildDialogOpen, setIsEditChildDialogOpen] = useState(false);

  // Form states
  const [childFormData, setChildFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    grade: '',
    school: '',
    pickup_location: '',
    dropoff_location: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    medical_conditions: '',
    allergies: '',
    special_instructions: ''
  });

  const [riskAssessmentFormData, setRiskAssessmentFormData] = useState({
    assessment_type: '',
    risk_level: 'low',
    description: '',
    required_equipment: '',
  });

  // Fetch real data from backend
  const { data: children = [], isLoading: childrenLoading, refetch: refetchChildren } = useChildProfiles();
  const { data: riskAssessments = [], isLoading: riskAssessmentsLoading, refetch: refetchRiskAssessments } = useRiskAssessments(selectedChild?.id);

  // Mutations
  const createChildMutation = useCreateChildProfile();
  const updateChildMutation = useUpdateChildProfile();
  const createRiskAssessmentMutation = useCreateRiskAssessment();

  const handleChildInputChange = (field: string, value: string) => {
    setChildFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRiskAssessmentInputChange = (field: string, value: string) => {
    setRiskAssessmentFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateChild = async () => {
    try {
      await createChildMutation.mutateAsync({
        ...childFormData,
        is_active: true
      });
      
      toast({
        title: "Child added successfully",
        description: `${childFormData.first_name} ${childFormData.last_name} has been added to your family.`,
      });
      
      setChildFormData({
        first_name: '',
        last_name: '',
        date_of_birth: '',
        grade: '',
        school: '',
        pickup_location: '',
        dropoff_location: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        medical_conditions: '',
        allergies: '',
        special_instructions: ''
      });
      setIsAddChildDialogOpen(false);
      refetchChildren();
    } catch (error) {
      toast({
        title: "Failed to add child",
        description: "There was an error adding your child. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUpdateChild = async () => {
    if (!editingChild) return;
    
    try {
      await updateChildMutation.mutateAsync({
        id: editingChild.id,
        ...childFormData
      });
      
      toast({
        title: "Child updated successfully",
        description: `${childFormData.first_name} ${childFormData.last_name}'s information has been updated.`,
      });
      
      setIsEditChildDialogOpen(false);
      setEditingChild(null);
      refetchChildren();
    } catch (error) {
      toast({
        title: "Failed to update child",
        description: "There was an error updating your child's information. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCreateRiskAssessment = async () => {
    if (!selectedChild) return;
    
    try {
      await createRiskAssessmentMutation.mutateAsync({
        child_id: selectedChild.id,
        assessment_type: riskAssessmentFormData.assessment_type as any,
        risk_level: riskAssessmentFormData.risk_level as any,
        description: riskAssessmentFormData.description,
        required_equipment: riskAssessmentFormData.required_equipment,
        is_active: true,
        assessment_date: new Date().toISOString().split('T')[0]
      });
      
      toast({
        title: "Risk assessment added successfully",
        description: "The risk assessment has been added to your child's profile.",
      });
      
      setRiskAssessmentFormData({
        assessment_type: '',
        risk_level: 'low',
        description: '',
        required_equipment: '',
      });
      setIsAddRiskAssessmentDialogOpen(false);
      refetchRiskAssessments();
    } catch (error) {
      toast({
        title: "Failed to add risk assessment",
        description: "There was an error adding the risk assessment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const openEditChildDialog = (child: ChildProfile) => {
    setEditingChild(child);
    setChildFormData({
      first_name: child.first_name,
      last_name: child.last_name,
      date_of_birth: child.date_of_birth,
      grade: child.grade || '',
      school: child.school || '',
      pickup_location: child.pickup_location || '',
      dropoff_location: child.dropoff_location || '',
      emergency_contact_name: child.emergency_contact_name || '',
      emergency_contact_phone: child.emergency_contact_phone || '',
      medical_conditions: child.medical_conditions || '',
      allergies: child.allergies || '',
      special_instructions: child.special_instructions || ''
    });
    setIsEditChildDialogOpen(true);
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAssessmentTypeIcon = (type: string) => {
    switch (type) {
      case 'medical': return <Heart className="w-4 h-4" />;
      case 'behavioral': return <Brain className="w-4 h-4" />;
      case 'physical': return <User className="w-4 h-4" />;
      case 'environmental': return <Globe className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Children List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>My Children</span>
            </CardTitle>
            <Dialog open={isAddChildDialogOpen} onOpenChange={setIsAddChildDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Child
                </Button>
              </DialogTrigger>
              <DialogContent className={isMobile ? 'w-[95vw] max-w-none mx-2' : ''}>
                <DialogHeader>
                  <DialogTitle>Add New Child</DialogTitle>
                  <DialogDescription>
                    Add a new child to your family profile
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={childFormData.first_name}
                        onChange={(e) => handleChildInputChange('first_name', e.target.value)}
                        placeholder="Enter first name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={childFormData.last_name}
                        onChange={(e) => handleChildInputChange('last_name', e.target.value)}
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={childFormData.date_of_birth}
                      onChange={(e) => handleChildInputChange('date_of_birth', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="grade">Grade</Label>
                      <Input
                        id="grade"
                        value={childFormData.grade}
                        onChange={(e) => handleChildInputChange('grade', e.target.value)}
                        placeholder="e.g., 3rd Grade"
                      />
                    </div>
                    <div>
                      <Label htmlFor="school">School</Label>
                      <Input
                        id="school"
                        value={childFormData.school}
                        onChange={(e) => handleChildInputChange('school', e.target.value)}
                        placeholder="Enter school name"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="pickupLocation">Pickup Location</Label>
                    <Input
                      id="pickupLocation"
                      value={childFormData.pickup_location}
                      onChange={(e) => handleChildInputChange('pickup_location', e.target.value)}
                      placeholder="Enter pickup address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dropoffLocation">Dropoff Location</Label>
                    <Input
                      id="dropoffLocation"
                      value={childFormData.dropoff_location}
                      onChange={(e) => handleChildInputChange('dropoff_location', e.target.value)}
                      placeholder="Enter dropoff address"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
                      <Input
                        id="emergencyContactName"
                        value={childFormData.emergency_contact_name}
                        onChange={(e) => handleChildInputChange('emergency_contact_name', e.target.value)}
                        placeholder="Emergency contact name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
                      <Input
                        id="emergencyContactPhone"
                        value={childFormData.emergency_contact_phone}
                        onChange={(e) => handleChildInputChange('emergency_contact_phone', e.target.value)}
                        placeholder="Emergency contact phone"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="medicalConditions">Medical Conditions</Label>
                    <Textarea
                      id="medicalConditions"
                      value={childFormData.medical_conditions}
                      onChange={(e) => handleChildInputChange('medical_conditions', e.target.value)}
                      placeholder="Any medical conditions or special needs"
                    />
                  </div>
                  <div>
                    <Label htmlFor="allergies">Allergies</Label>
                    <Textarea
                      id="allergies"
                      value={childFormData.allergies}
                      onChange={(e) => handleChildInputChange('allergies', e.target.value)}
                      placeholder="Any allergies or dietary restrictions"
                    />
                  </div>
                  <div>
                    <Label htmlFor="specialInstructions">Special Instructions</Label>
                    <Textarea
                      id="specialInstructions"
                      value={childFormData.special_instructions}
                      onChange={(e) => handleChildInputChange('special_instructions', e.target.value)}
                      placeholder="Any special instructions for transport"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddChildDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateChild}
                    disabled={!childFormData.first_name || !childFormData.last_name || !childFormData.date_of_birth || createChildMutation.isPending}
                  >
                    {createChildMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Adding...
                      </>
                    ) : (
                      'Add Child'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {childrenLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : children.length === 0 ? (
            <div className="text-center py-8">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-muted-foreground">No children added yet</p>
              <p className="text-sm text-muted-foreground mt-1">Add your children to manage their transport information</p>
            </div>
          ) : (
            <div className="space-y-4">
              {children.map((child) => {
                const age = calculateAge(child.date_of_birth);
                return (
                  <div 
                    key={child.id} 
                    className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                      selectedChild?.id === child.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedChild(child)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold">{child.first_name} {child.last_name}</h3>
                          <Badge variant="outline">{age} years old</Badge>
                          {child.grade && <Badge variant="secondary">{child.grade}</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{child.school || 'School not set'}</p>
                        {(child.medical_conditions && child.medical_conditions !== 'None') || 
                         (child.allergies && child.allergies !== 'None') ? (
                          <div className="flex items-center space-x-2 mt-2">
                            <AlertTriangle className="w-4 h-4 text-orange-500" />
                            <span className="text-sm text-orange-600">Medical alerts</span>
                          </div>
                        ) : null}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditChildDialog(child);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Risk Assessments */}
      {selectedChild && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Risk Assessments - {selectedChild.first_name}</span>
              </CardTitle>
              <Dialog open={isAddRiskAssessmentDialogOpen} onOpenChange={setIsAddRiskAssessmentDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Assessment
                  </Button>
                </DialogTrigger>
                <DialogContent className={isMobile ? 'w-[95vw] max-w-none mx-2' : ''}>
                  <DialogHeader>
                    <DialogTitle>Add Risk Assessment</DialogTitle>
                    <DialogDescription>
                      Add a new risk assessment for {selectedChild.first_name}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="assessmentType">Assessment Type</Label>
                      <Select value={riskAssessmentFormData.assessment_type} onValueChange={(value) => handleRiskAssessmentInputChange('assessment_type', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select assessment type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="medical">Medical</SelectItem>
                          <SelectItem value="behavioral">Behavioral</SelectItem>
                          <SelectItem value="physical">Physical</SelectItem>
                          <SelectItem value="environmental">Environmental</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="riskLevel">Risk Level</Label>
                      <Select value={riskAssessmentFormData.risk_level} onValueChange={(value) => handleRiskAssessmentInputChange('risk_level', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={riskAssessmentFormData.description}
                        onChange={(e) => handleRiskAssessmentInputChange('description', e.target.value)}
                        placeholder="Describe the risk assessment"
                      />
                    </div>
                    <div>
                      <Label htmlFor="requiredEquipment">Required Equipment</Label>
                      <Textarea
                        id="requiredEquipment"
                        value={riskAssessmentFormData.required_equipment}
                        onChange={(e) => handleRiskAssessmentInputChange('required_equipment', e.target.value)}
                        placeholder="Any required equipment or accommodations"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddRiskAssessmentDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreateRiskAssessment}
                      disabled={!riskAssessmentFormData.assessment_type || !riskAssessmentFormData.description || createRiskAssessmentMutation.isPending}
                    >
                      {createRiskAssessmentMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Adding...
                        </>
                      ) : (
                        'Add Assessment'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {riskAssessmentsLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : riskAssessments.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground">No risk assessments yet</p>
                <p className="text-sm text-muted-foreground mt-1">Add risk assessments to ensure safe transport</p>
              </div>
            ) : (
              <div className="space-y-4">
                {riskAssessments.map((assessment) => (
                  <div key={assessment.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {getAssessmentTypeIcon(assessment.assessment_type)}
                          <span className="font-medium capitalize">{assessment.assessment_type}</span>
                          <Badge className={getRiskLevelColor(assessment.risk_level)}>
                            {assessment.risk_level}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{assessment.description}</p>
                        {assessment.required_equipment && (
                          <p className="text-sm text-muted-foreground">
                            <strong>Required:</strong> {assessment.required_equipment}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Child Dialog */}
      <Dialog open={isEditChildDialogOpen} onOpenChange={setIsEditChildDialogOpen}>
        <DialogContent className={isMobile ? 'w-[95vw] max-w-none mx-2' : ''}>
          <DialogHeader>
            <DialogTitle>Edit Child Information</DialogTitle>
            <DialogDescription>
              Update {editingChild?.first_name}'s information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editFirstName">First Name</Label>
                <Input
                  id="editFirstName"
                  value={childFormData.first_name}
                  onChange={(e) => handleChildInputChange('first_name', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="editLastName">Last Name</Label>
                <Input
                  id="editLastName"
                  value={childFormData.last_name}
                  onChange={(e) => handleChildInputChange('last_name', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="editDateOfBirth">Date of Birth</Label>
              <Input
                id="editDateOfBirth"
                type="date"
                value={childFormData.date_of_birth}
                onChange={(e) => handleChildInputChange('date_of_birth', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editGrade">Grade</Label>
                <Input
                  id="editGrade"
                  value={childFormData.grade}
                  onChange={(e) => handleChildInputChange('grade', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="editSchool">School</Label>
                <Input
                  id="editSchool"
                  value={childFormData.school}
                  onChange={(e) => handleChildInputChange('school', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="editMedicalConditions">Medical Conditions</Label>
              <Textarea
                id="editMedicalConditions"
                value={childFormData.medical_conditions}
                onChange={(e) => handleChildInputChange('medical_conditions', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="editAllergies">Allergies</Label>
              <Textarea
                id="editAllergies"
                value={childFormData.allergies}
                onChange={(e) => handleChildInputChange('allergies', e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditChildDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateChild}
              disabled={!childFormData.first_name || !childFormData.last_name || updateChildMutation.isPending}
            >
              {updateChildMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                'Update Child'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChildManagementDialog;
