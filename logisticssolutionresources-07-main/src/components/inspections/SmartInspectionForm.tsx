import React, { useState } from 'react';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useSubmitInspection } from '@/hooks/useVehicleInspections';
import { useVehicles } from '@/hooks/useVehicles';
import { CheckCircle, AlertTriangle, X, Car, Calendar, User } from 'lucide-react';
import type { InspectionSubmissionData } from '@/hooks/useVehicleInspections';

// Predefined inspection questions for smart inspection
const INSPECTION_QUESTIONS = [
  {
    category: 'Safety',
    questions: [
      { id: 'brakes', text: 'Are the brakes functioning properly?', critical: true },
      { id: 'lights', text: 'Are all lights working (headlights, taillights, indicators)?', critical: true },
      { id: 'mirrors', text: 'Are all mirrors clean and properly adjusted?', critical: false },
      { id: 'seatbelts', text: 'Are seatbelts in good condition?', critical: true },
    ]
  },
  {
    category: 'Exterior',
    questions: [
      { id: 'tires', text: 'Are tires properly inflated with adequate tread?', critical: true },
      { id: 'windows', text: 'Are windows clean and free of cracks?', critical: false },
      { id: 'bodywork', text: 'Is the vehicle body free from significant damage?', critical: false },
    ]
  },
  {
    category: 'Interior',
    questions: [
      { id: 'dashboard', text: 'Are all dashboard warning lights off?', critical: true },
      { id: 'steering', text: 'Is the steering responsive and aligned?', critical: true },
      { id: 'cleanliness', text: 'Is the interior clean and professional?', critical: false },
    ]
  }
];

interface SmartInspectionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

const SmartInspectionForm: React.FC<SmartInspectionFormProps> = ({
  open,
  onOpenChange,
  onComplete
}) => {
  const { toast } = useToast();
  const { data: vehicles = [] } = useVehicles();
  const submitInspection = useSubmitInspection();

  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [inspectionType, setInspectionType] = useState<'initial' | 'recheck' | 'breakdown'>('initial');
  const [responses, setResponses] = useState<Record<string, 'pass' | 'fail' | 'flag' | 'n/a'>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [generalNotes, setGeneralNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleResponseChange = (questionId: string, response: 'pass' | 'fail' | 'flag' | 'n/a') => {
    setResponses(prev => ({ ...prev, [questionId]: response }));
  };

  const handleNoteChange = (questionId: string, note: string) => {
    setNotes(prev => ({ ...prev, [questionId]: note }));
  };

  const getResponseColor = (response: string) => {
    switch (response) {
      case 'pass': return 'bg-green-100 text-green-800 border-green-300';
      case 'fail': return 'bg-red-100 text-red-800 border-red-300';
      case 'flag': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getResponseIcon = (response: string) => {
    switch (response) {
      case 'pass': return <CheckCircle className="w-4 h-4" />;
      case 'fail': return <X className="w-4 h-4" />;
      case 'flag': return <AlertTriangle className="w-4 h-4" />;
      default: return null;
    }
  };

  const calculateOverallStatus = () => {
    const allResponses = Object.values(responses);
    if (allResponses.includes('fail')) return 'failed';
    if (allResponses.includes('flag')) return 'flagged';
    if (allResponses.length > 0 && allResponses.every(r => r === 'pass' || r === 'n/a')) return 'passed';
    return 'pending';
  };

  const handleSubmit = async () => {
    if (!selectedVehicle) {
      toast({
        title: 'Vehicle Required',
        description: 'Please select a vehicle for the inspection.',
        variant: 'destructive'
      });
      return;
    }

    const unansweredQuestions = INSPECTION_QUESTIONS.flatMap(cat => cat.questions)
      .filter(q => !responses[q.id]);

    if (unansweredQuestions.length > 0) {
      toast({
        title: 'Incomplete Inspection',
        description: 'Please answer all inspection questions before submitting.',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const inspectionData: InspectionSubmissionData = {
        vehicle_id: selectedVehicle,
        inspection_type: inspectionType,
        notes: generalNotes || undefined,
        defects_found: Object.values(responses).includes('fail'),
        overall_status: calculateOverallStatus()
      };

      await submitInspection.mutateAsync(inspectionData);
      
      toast({
        title: 'Inspection Submitted',
        description: 'Smart inspection has been completed successfully.',
      });

      // Reset form
      setSelectedVehicle('');
      setResponses({});
      setNotes({});
      setGeneralNotes('');
      onOpenChange(false);
      onComplete?.();

    } catch (error: any) {
      toast({
        title: 'Submission Failed',
        description: error.message || 'Failed to submit inspection.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <ErrorBoundary>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        <Card className="border-0 shadow-none">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Smart Vehicle Inspection</CardTitle>
                <p className="text-muted-foreground">
                  Comprehensive digital inspection with automated scoring
                </p>
              </div>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Vehicle Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vehicle">Vehicle *</Label>
                <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        <div className="flex items-center gap-2">
                          <Car className="w-4 h-4" />
                          {vehicle.license_plate} - {vehicle.make} {vehicle.model}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="type">Inspection Type</Label>
                <Select value={inspectionType} onValueChange={(value: any) => setInspectionType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="initial">Initial Inspection</SelectItem>
                    <SelectItem value="recheck">Re-check Inspection</SelectItem>
                    <SelectItem value="breakdown">Breakdown Inspection</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Inspection Questions */}
            {INSPECTION_QUESTIONS.map((category) => (
              <Card key={category.category}>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">{category.category}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {category.questions.map((question) => (
                    <div key={question.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="font-medium">
                            {question.text}
                            {question.critical && (
                              <Badge variant="destructive" className="ml-2 text-xs">Critical</Badge>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2 mb-3">
                        {(['pass', 'fail', 'flag', 'n/a'] as const).map((response) => (
                          <Button
                            key={response}
                            variant={responses[question.id] === response ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => handleResponseChange(question.id, response)}
                            className={responses[question.id] === response ? getResponseColor(response) : ''}
                          >
                            {getResponseIcon(response)}
                            <span className="ml-1 capitalize">{response === 'n/a' ? 'N/A' : response}</span>
                          </Button>
                        ))}
                      </div>

                      {(responses[question.id] === 'fail' || responses[question.id] === 'flag') && (
                        <Textarea
                          placeholder="Add notes for this issue..."
                          value={notes[question.id] || ''}
                          onChange={(e) => handleNoteChange(question.id, e.target.value)}
                          className="mt-2"
                        />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}

            {/* General Notes */}
            <div>
              <Label htmlFor="notes">General Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes or observations..."
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
              />
            </div>

            {/* Summary */}
            {Object.keys(responses).length > 0 && (
              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-2">Inspection Summary</h4>
                  <div className="flex items-center gap-4">
                    <Badge className={getResponseColor(calculateOverallStatus())}>
                      {getResponseIcon(calculateOverallStatus())}
                      <span className="ml-1 capitalize">{calculateOverallStatus()}</span>
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {Object.values(responses).filter(r => r === 'pass').length} Passed •{' '}
                      {Object.values(responses).filter(r => r === 'fail').length} Failed •{' '}
                      {Object.values(responses).filter(r => r === 'flag').length} Flagged
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Inspection'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </ErrorBoundary>
  );
};

export default SmartInspectionForm;