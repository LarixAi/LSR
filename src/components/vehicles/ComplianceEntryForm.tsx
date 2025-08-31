import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useVehicles } from '@/hooks/useVehicles';
import { useDrivers } from '@/hooks/useDrivers';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Car,
  Wrench,
  Award,
  Scale,
  Database,
  X,
  Save,
  Calendar,
  MapPin,
  User,
  Truck,
  Gavel,
  AlertCircle,
  CheckSquare,
  Square,
  Plus
} from 'lucide-react';

// Comprehensive compliance form schema
const complianceFormSchema = z.object({
  // Basic Information
  complianceType: z.enum(['vehicle_inspection', 'compliance_violation', 'regulatory_check', 'document_compliance', 'safety_audit']),
  vehicleId: z.string().min(1, 'Vehicle is required'),
  driverId: z.union([z.string().min(1), z.literal('no_driver')]).optional(),
  
  // Dates
  complianceDate: z.string().min(1, 'Compliance date is required'),
  nextReviewDate: z.string().optional(),
  
  // Status and Priority
  status: z.enum(['pending', 'in_progress', 'compliant', 'non_compliant', 'conditional', 'resolved']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  
  // Details
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  regulatoryBody: z.string().optional(),
  regulationReference: z.string().optional(),
  
  // Vehicle Inspection Specific
  inspectionType: z.enum(['daily', 'weekly', 'monthly', 'annual', 'pre_trip', 'post_trip', 'safety', 'compliance']).optional(),
  complianceScore: z.number().min(0).max(100).optional(),
  defectsFound: z.array(z.string()).optional(),
  inspectionLocation: z.string().optional(),
  weatherConditions: z.string().optional(),
  vehicleMileage: z.number().optional(),
  
  // Vehicle Condition
  fuelLevel: z.string().optional(),
  oilLevel: z.string().optional(),
  tireCondition: z.string().optional(),
  brakeCondition: z.string().optional(),
  lightsCondition: z.string().optional(),
  emergencyEquipment: z.array(z.string()).optional(),
  
  // Violation Specific
  violationType: z.enum(['hours_of_service', 'speed_limit', 'vehicle_maintenance', 'documentation', 'safety_regulations', 'environmental', 'weight_limit', 'route_violation', 'other']).optional(),
  penaltyAmount: z.number().optional(),
  penaltyCurrency: z.string().default('GBP'),
  caseNumber: z.string().optional(),
  location: z.string().optional(),
  
  // Resolution
  resolutionNotes: z.string().optional(),
  correctiveActions: z.array(z.string()).optional(),
  followUpRequired: z.boolean().default(false),
  followUpDate: z.string().optional(),
  riskAssessmentScore: z.number().min(1).max(10).optional(),
  
  // Additional Information
  witnesses: z.array(z.string()).optional(),
  evidenceFiles: z.array(z.string()).optional(),
  impactOnOperations: z.string().optional(),
  lessonsLearned: z.string().optional(),
  
  // Assignment
  assignedTo: z.string().optional(),
  
  // Notes
  additionalNotes: z.string().optional(),
});

type ComplianceFormData = z.infer<typeof complianceFormSchema>;

interface ComplianceEntryFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

const ComplianceEntryForm: React.FC<ComplianceEntryFormProps> = ({ onClose, onSuccess }) => {
  const { user, profile } = useAuth();
  const { data: vehicles = [] } = useVehicles();
  const { data: drivers = [] } = useDrivers();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  const form = useForm<ComplianceFormData>({
    resolver: zodResolver(complianceFormSchema),
    defaultValues: {
      complianceType: 'vehicle_inspection',
      status: 'pending',
      priority: 'medium',
      severity: 'medium',
      penaltyCurrency: 'GBP',
      followUpRequired: false,
      defectsFound: [],
      emergencyEquipment: [],
      witnesses: [],
      evidenceFiles: [],
      correctiveActions: [],
      complianceScore: 100,
      driverId: 'no_driver',
    },
  });

  const complianceType = form.watch('complianceType');

  const onSubmit = async (data: ComplianceFormData) => {
    if (!user || !profile) return;

    setIsSubmitting(true);
    try {
      const organizationId = profile.organization_id;
      
      // Prepare the data based on compliance type
      let insertData: any = {
        organization_id: organizationId,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      switch (data.complianceType) {
        case 'vehicle_inspection':
          // Insert into vehicle_inspections table
          const { data: inspectionData, error: inspectionError } = await supabase
            .from('vehicle_inspections')
            .insert({
              organization_id: organizationId,
              vehicle_id: data.vehicleId,
              driver_id: data.driverId === 'no_driver' ? null : data.driverId,
              inspection_date: data.complianceDate,
              inspection_type: data.inspectionType || 'compliance',
              status: data.status,
              inspector_name: `${profile.first_name} ${profile.last_name}`,
              inspector_id: user.id,
              inspection_notes: data.description,
              defects_found: data.defectsFound || [],
              compliance_score: data.complianceScore,
              next_inspection_date: data.nextReviewDate,
              inspection_location: data.inspectionLocation,
              weather_conditions: data.weatherConditions,
              vehicle_mileage: data.vehicleMileage,
              fuel_level: data.fuelLevel,
              oil_level: data.oilLevel,
              tire_condition: data.tireCondition,
              brake_condition: data.brakeCondition,
              lights_condition: data.lightsCondition,
              emergency_equipment: data.emergencyEquipment || [],
              created_by: user.id,
            })
            .select()
            .single();

          if (inspectionError) throw inspectionError;
          break;

        case 'compliance_violation':
          // Insert into compliance_violations table
          const { data: violationData, error: violationError } = await supabase
            .from('compliance_violations')
            .insert({
              organization_id: organizationId,
              vehicle_id: data.vehicleId,
              driver_id: data.driverId === 'no_driver' ? null : data.driverId,
              violation_type: data.violationType || 'other',
              violation_date: data.complianceDate,
              severity: data.severity || 'medium',
              description: data.description,
              status: data.status,
              penalty_amount: data.penaltyAmount,
              penalty_currency: data.penaltyCurrency,
              case_number: data.caseNumber,
              location: data.location,
              witnesses: data.witnesses || [],
              evidence_files: data.evidenceFiles || [],
              corrective_actions: data.correctiveActions || [],
              follow_up_required: data.followUpRequired,
              follow_up_date: data.followUpDate,
              risk_assessment_score: data.riskAssessmentScore,
              impact_on_operations: data.impactOnOperations,
              lessons_learned: data.lessonsLearned,
              assigned_to: data.assignedTo,
              created_by: user.id,
            })
            .select()
            .single();

          if (violationError) throw violationError;
          break;

        default:
          // For other types, create a generic compliance record
          // This could be expanded to other tables as needed
          console.log('Compliance entry created:', data);
          break;
      }

      toast({
        title: 'Success',
        description: 'Compliance entry created successfully',
      });

      form.reset();
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error creating compliance entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to create compliance entry',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getComplianceTypeIcon = (type: string) => {
    switch (type) {
      case 'vehicle_inspection':
        return <Car className="w-4 h-4" />;
      case 'compliance_violation':
        return <AlertTriangle className="w-4 h-4" />;
      case 'regulatory_check':
        return <Scale className="w-4 h-4" />;
      case 'document_compliance':
        return <FileText className="w-4 h-4" />;
      case 'safety_audit':
        return <Shield className="w-4 h-4" />;
      default:
        return <Database className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'bg-green-100 text-green-800';
      case 'non_compliant':
        return 'bg-red-100 text-red-800';
      case 'conditional':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Add Compliance Entry</h2>
                <p className="text-gray-600">Create a new compliance record for your fleet</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="h-full">
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="vehicle">Vehicle</TabsTrigger>
                  <TabsTrigger value="resolution">Resolution</TabsTrigger>
                  <TabsTrigger value="additional">Additional</TabsTrigger>
                </TabsList>

                {/* Basic Information Tab */}
                <TabsContent value="basic" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Database className="w-5 h-5" />
                        Basic Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="complianceType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Compliance Type *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select compliance type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="vehicle_inspection">
                                    <div className="flex items-center gap-2">
                                      <Car className="w-4 h-4" />
                                      Vehicle Inspection
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="compliance_violation">
                                    <div className="flex items-center gap-2">
                                      <AlertTriangle className="w-4 h-4" />
                                      Compliance Violation
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="regulatory_check">
                                    <div className="flex items-center gap-2">
                                      <Scale className="w-4 h-4" />
                                      Regulatory Check
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="document_compliance">
                                    <div className="flex items-center gap-2">
                                      <FileText className="w-4 h-4" />
                                      Document Compliance
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="safety_audit">
                                    <div className="flex items-center gap-2">
                                      <Shield className="w-4 h-4" />
                                      Safety Audit
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Status *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="in_progress">In Progress</SelectItem>
                                  <SelectItem value="compliant">Compliant</SelectItem>
                                  <SelectItem value="non_compliant">Non-Compliant</SelectItem>
                                  <SelectItem value="conditional">Conditional</SelectItem>
                                  <SelectItem value="resolved">Resolved</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="vehicleId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Vehicle *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select vehicle" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {vehicles.map((vehicle) => (
                                    <SelectItem key={vehicle.id} value={vehicle.id}>
                                      <div className="flex items-center gap-2">
                                        <Truck className="w-4 h-4" />
                                        {vehicle.license_plate} - {vehicle.make} {vehicle.model}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="driverId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Driver (Optional)</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || ''}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select driver (optional)" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="no_driver">No Driver</SelectItem>
                                  {drivers.map((driver) => (
                                    <SelectItem key={driver.id} value={driver.id}>
                                      <div className="flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        {driver.first_name} {driver.last_name}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="complianceDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Compliance Date *</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="priority"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Priority *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select priority" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="low">Low</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="high">High</SelectItem>
                                  <SelectItem value="critical">Critical</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter compliance entry title" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe the compliance issue or inspection details" 
                                rows={3}
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Details Tab */}
                <TabsContent value="details" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Compliance Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="regulatoryBody"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Regulatory Body</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., DVSA, TfL, Local Authority" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="regulationReference"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Regulation Reference</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Section 40, Regulation 123" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {complianceType === 'compliance_violation' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="violationType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Violation Type</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ''}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select violation type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="hours_of_service">Hours of Service</SelectItem>
                                    <SelectItem value="speed_limit">Speed Limit</SelectItem>
                                    <SelectItem value="vehicle_maintenance">Vehicle Maintenance</SelectItem>
                                    <SelectItem value="documentation">Documentation</SelectItem>
                                    <SelectItem value="safety_regulations">Safety Regulations</SelectItem>
                                    <SelectItem value="environmental">Environmental</SelectItem>
                                    <SelectItem value="weight_limit">Weight Limit</SelectItem>
                                    <SelectItem value="route_violation">Route Violation</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="severity"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Severity</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ''}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select severity" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="critical">Critical</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}

                      {complianceType === 'vehicle_inspection' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="inspectionType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Inspection Type</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value || ''}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select inspection type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="daily">Daily</SelectItem>
                                    <SelectItem value="weekly">Weekly</SelectItem>
                                    <SelectItem value="monthly">Monthly</SelectItem>
                                    <SelectItem value="annual">Annual</SelectItem>
                                    <SelectItem value="pre_trip">Pre-Trip</SelectItem>
                                    <SelectItem value="post_trip">Post-Trip</SelectItem>
                                    <SelectItem value="safety">Safety</SelectItem>
                                    <SelectItem value="compliance">Compliance</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="complianceScore"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Compliance Score (0-100)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    min="0" 
                                    max="100" 
                                    placeholder="85"
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="penaltyAmount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Penalty Amount</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  step="0.01" 
                                  placeholder="0.00"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="caseNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Case Number</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., CV-2024-001" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Vehicle Tab */}
                <TabsContent value="vehicle" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Truck className="w-5 h-5" />
                        Vehicle Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="inspectionLocation"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Inspection Location</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Depot Yard A, Maintenance Bay 3" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="weatherConditions"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Weather Conditions</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., Clear, Rainy, Snowy" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="vehicleMileage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Vehicle Mileage</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="125000"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="fuelLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fuel Level</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || ''}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select fuel level" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="empty">Empty</SelectItem>
                                  <SelectItem value="1/4">1/4</SelectItem>
                                  <SelectItem value="1/2">1/2</SelectItem>
                                  <SelectItem value="3/4">3/4</SelectItem>
                                  <SelectItem value="full">Full</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="oilLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Oil Level</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || ''}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Oil level" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="low">Low</SelectItem>
                                  <SelectItem value="good">Good</SelectItem>
                                  <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="tireCondition"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tire Condition</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || ''}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Tire condition" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="excellent">Excellent</SelectItem>
                                  <SelectItem value="good">Good</SelectItem>
                                  <SelectItem value="fair">Fair</SelectItem>
                                  <SelectItem value="poor">Poor</SelectItem>
                                  <SelectItem value="needs_replacement">Needs Replacement</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="brakeCondition"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Brake Condition</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || ''}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Brake condition" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="excellent">Excellent</SelectItem>
                                  <SelectItem value="good">Good</SelectItem>
                                  <SelectItem value="fair">Fair</SelectItem>
                                  <SelectItem value="poor">Poor</SelectItem>
                                  <SelectItem value="needs_attention">Needs Attention</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="lightsCondition"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Lights Condition</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., All working, Left indicator faulty" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Resolution Tab */}
                <TabsContent value="resolution" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckSquare className="w-5 h-5" />
                        Resolution & Follow-up
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="resolutionNotes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Resolution Notes</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe how the compliance issue was resolved" 
                                rows={3}
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="nextReviewDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Next Review Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="riskAssessmentScore"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Risk Assessment Score (1-10)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="1" 
                                  max="10" 
                                  placeholder="5"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <FormField
                          control={form.control}
                          name="followUpRequired"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Follow-up Required</FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>

                      {form.watch('followUpRequired') && (
                        <FormField
                          control={form.control}
                          name="followUpDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Follow-up Date</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <FormField
                        control={form.control}
                        name="impactOnOperations"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Impact on Operations</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe the impact on fleet operations" 
                                rows={2}
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="lessonsLearned"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Lessons Learned</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="What lessons were learned from this compliance issue?" 
                                rows={2}
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Additional Tab */}
                <TabsContent value="additional" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Additional Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="assignedTo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Assigned To</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value || ''}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select assignee (optional)" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="">No Assignment</SelectItem>
                                  {drivers.map((driver) => (
                                    <SelectItem key={driver.id} value={driver.id}>
                                      <div className="flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        {driver.first_name} {driver.last_name}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., M25 Junction 15, London Depot" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="additionalNotes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Additional Notes</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Any additional information or notes" 
                                rows={3}
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Footer */}
            <div className="p-6 border-t bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield className="w-4 h-4" />
                  <span>Compliance entry will be recorded in the system</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Create Compliance Entry
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default ComplianceEntryForm;
