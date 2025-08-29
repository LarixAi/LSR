
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { IncidentFormData } from '@/types/incident';
import IncidentBasicFields from './IncidentBasicFields';
import IncidentLocationSection from './IncidentLocationSection';
import IncidentPeopleSection from './IncidentPeopleSection';
import IncidentAttachmentsSection from './IncidentAttachmentsSection';
import LocationPicker from './LocationPicker';
import TransportationIncidentForm from './forms/TransportationIncidentForm';
import SchoolIncidentForm from './forms/SchoolIncidentForm';
import WeddingIncidentForm from './forms/WeddingIncidentForm';
import AirportIncidentForm from './forms/AirportIncidentForm';
import PrivateJobIncidentForm from './forms/PrivateJobIncidentForm';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';

interface IncidentFormProps {
  incidentType: string;
  onSubmit: (data: IncidentFormData) => void;
  onCancel: () => void;
}

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  severity: z.enum(['low', 'medium', 'high']),
  status: z.enum(['open', 'closed']).optional(),
  date: z.string().optional(),
  time: z.string().optional(),
  locationAddress: z.string().optional(),
  peopleInvolved: z.array(z.string()).optional(),
  vehicleInfo: z.string().optional(),
  weatherConditions: z.string().optional(),
  reportedBy: z.string().optional(),
  contactInfo: z.string().optional(),
  emergencyServices: z.boolean().optional(),
  policeReportNumber: z.string().optional(),
  insuranceClaim: z.boolean().optional(),
  estimatedDamages: z.string().optional(),
  followUpRequired: z.boolean().optional(),
  // Type-specific fields
  incidentType: z.string().optional(),
  vehicleRoute: z.string().optional(),
  injuriesDamage: z.string().optional(),
  actionsTaken: z.string().optional(),
  personName: z.string().optional(),
  classRole: z.string().optional(),
  schoolLocation: z.string().optional(),
  personInvolved: z.string().optional(),
  venueLocation: z.string().optional(),
  flightVehicle: z.string().optional(),
  airportLocation: z.string().optional(),
  clientStaffThirdParty: z.string().optional(),
  jobLocation: z.string().optional(),
});

const IncidentForm: React.FC<IncidentFormProps> = ({
  incidentType,
  onSubmit,
  onCancel,
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [peopleInvolved, setPeopleInvolved] = useState<string[]>(['']);
  const [witnesses, setWitnesses] = useState<string[]>(['']);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      severity: "low",
      status: "open",
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      locationAddress: "",
      peopleInvolved: [],
      vehicleInfo: "",
      weatherConditions: "",
      reportedBy: "",
      contactInfo: "",
      emergencyServices: false,
      policeReportNumber: "",
      insuranceClaim: false,
      estimatedDamages: "",
      followUpRequired: false,
    },
  });

  const selectedDate = form.watch('date') || '';
  const selectedTime = form.watch('time') || '';

  const handleSubmit = async (values: any) => {
    setIsSubmitting(true);

    try {
      const formData: IncidentFormData = {
        type: incidentType as any,
        title: values.title,
        description: values.description,
        severity: values.severity,
        status: values.status || 'open',
        date: values.date ? new Date(values.date) : undefined,
        time: values.time,
        location: selectedLocation ? {
          lat: selectedLocation.lat,
          lng: selectedLocation.lng,
          address: values.locationAddress || ''
        } : undefined,
        peopleInvolved: peopleInvolved.filter(person => person.trim() !== ''),
        witnesses: witnesses.filter(witness => witness.trim() !== ''),
        vehicleInfo: values.vehicleInfo,
        weatherConditions: values.weatherConditions,
        reportedBy: values.reportedBy,
        contactInfo: values.contactInfo,
        emergencyServices: values.emergencyServices || false,
        policeReportNumber: values.policeReportNumber,
        insuranceClaim: values.insuranceClaim || false,
        estimatedDamages: values.estimatedDamages,
        followUpRequired: values.followUpRequired || false,
        attachments: attachments,
        // Include type-specific fields
        ...values
      };

      await onSubmit(formData);

      toast({
        title: "Incident Reported",
        description: "Your incident report has been submitted successfully.",
      });
    } catch (error) {
      console.error('Error submitting incident:', error);
      toast({
        title: "Error",
        description: "Failed to submit incident report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderTypeSpecificForm = () => {
    switch (incidentType) {
      case 'transportation':
        return (
          <TransportationIncidentForm 
            form={form} 
            selectedDate={selectedDate}
            selectedTime={selectedTime}
          />
        );
      case 'school':
        return (
          <SchoolIncidentForm 
            form={form} 
            selectedDate={selectedDate}
            selectedTime={selectedTime}
          />
        );
      case 'wedding':
        return (
          <WeddingIncidentForm 
            form={form} 
            selectedDate={selectedDate}
            selectedTime={selectedTime}
          />
        );
      case 'airport':
        return (
          <AirportIncidentForm 
            form={form} 
            selectedDate={selectedDate}
            selectedTime={selectedTime}
          />
        );
      case 'privateJob':
        return (
          <PrivateJobIncidentForm 
            form={form} 
            selectedDate={selectedDate}
            selectedTime={selectedTime}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Report {incidentType.charAt(0).toUpperCase() + incidentType.slice(1)} Incident</CardTitle>
        <CardDescription>
          Please provide detailed information about the incident
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <IncidentBasicFields form={form} />
            
            {renderTypeSpecificForm()}
            
            <IncidentLocationSection
              selectedLocation={selectedLocation}
              onLocationPickerOpen={() => setIsLocationPickerOpen(true)}
            />

            <IncidentPeopleSection
              peopleInvolved={peopleInvolved}
              setPeopleInvolved={setPeopleInvolved}
              witnesses={witnesses}
              setWitnesses={setWitnesses}
            />

            <IncidentAttachmentsSection
              attachments={attachments}
              setAttachments={setAttachments}
            />

            <div className="flex justify-end space-x-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </Button>
            </div>
          </form>
        </Form>

        {isLocationPickerOpen && (
          <LocationPicker
            open={isLocationPickerOpen}
            onOpenChange={setIsLocationPickerOpen}
            onLocationSelect={(location) => {
              setSelectedLocation(location);
              setIsLocationPickerOpen(false);
            }}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default IncidentForm;
