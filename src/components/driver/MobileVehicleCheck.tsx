import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Camera, 
  MapPin, 
  Car, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Save,
  Info,
  Clock,
  User
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useCreateVehicleCheck } from '@/hooks/useVehicleChecks';
import { useVehicles } from '@/hooks/useVehicles';

interface VehicleCheckQuestion {
  id: string;
  question_text: string;
  question_type: 'yes_no' | 'multiple_choice' | 'text' | 'number';
  is_required: boolean;
  is_critical: boolean;
  order_index: number;
  category: string;
  options?: string[];
}

interface GPSLocation {
  latitude: number;
  longitude: number;
  timestamp: string;
}

// Simplified questions for mobile
const mobileQuestions: VehicleCheckQuestion[] = [
  {
    id: '1',
    question_text: 'Are all lights working properly?',
    question_type: 'yes_no',
    is_required: true,
    is_critical: true,
    order_index: 1,
    category: 'Safety'
  },
  {
    id: '2',
    question_text: 'Are tires in good condition with adequate tread?',
    question_type: 'yes_no',
    is_required: true,
    is_critical: true,
    order_index: 2,
    category: 'Safety'
  },
  {
    id: '3',
    question_text: 'Are brakes functioning correctly?',
    question_type: 'yes_no',
    is_required: true,
    is_critical: true,
    order_index: 3,
    category: 'Safety'
  },
  {
    id: '4',
    question_text: 'Is the steering wheel responsive?',
    question_type: 'yes_no',
    is_required: true,
    is_critical: true,
    order_index: 4,
    category: 'Safety'
  },
  {
    id: '5',
    question_text: 'Are mirrors properly adjusted and clean?',
    question_type: 'yes_no',
    is_required: true,
    is_critical: false,
    order_index: 5,
    category: 'Safety'
  },
  {
    id: '6',
    question_text: 'Is the windshield clean and free of cracks?',
    question_type: 'yes_no',
    is_required: true,
    is_critical: false,
    order_index: 6,
    category: 'Safety'
  },
  {
    id: '7',
    question_text: 'Are seatbelts working properly?',
    question_type: 'yes_no',
    is_required: true,
    is_critical: true,
    order_index: 7,
    category: 'Safety'
  },
  {
    id: '8',
    question_text: 'Is the horn working?',
    question_type: 'yes_no',
    is_required: true,
    is_critical: false,
    order_index: 8,
    category: 'Safety'
  }
];

const MobileVehicleCheck: React.FC = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const createVehicleCheck = useCreateVehicleCheck();
  const { data: vehicles = [], isLoading: vehiclesLoading } = useVehicles();
  
  const [currentStep, setCurrentStep] = useState<'vehicle-selection' | 'questions' | 'review'>('vehicle-selection');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [currentQuestionInfo, setCurrentQuestionInfo] = useState<string>('');

  // Use real vehicles from database
  const availableVehicles = vehicles.filter(v => v.is_active !== false); // Consider undefined/null as active

  const handleAnswerChange = useCallback((questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  }, []);

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < mobileQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setCurrentStep('review');
    }
  }, [currentQuestionIndex]);

  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else {
      setCurrentStep('vehicle-selection');
    }
  }, [currentQuestionIndex]);

  const handleSubmit = async () => {
    if (!selectedVehicle) {
      toast({
        title: "Error",
        description: "Please select a vehicle",
        variant: "destructive"
      });
      return;
    }

    const requiredQuestions = mobileQuestions.filter(q => q.is_required);
    const answeredRequired = requiredQuestions.every(q => answers[q.id] !== undefined);

    if (!answeredRequired) {
      toast({
        title: "Error",
        description: "Please answer all required questions",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const checkData = {
        vehicle_id: selectedVehicle,
        driver_id: profile?.id,
        check_type: 'daily',
        status: 'completed',
        answers: answers,
        notes: notes,
        created_at: new Date().toISOString()
      };

      await createVehicleCheck.mutateAsync(checkData);

      toast({
        title: "Success",
        description: "Vehicle check completed successfully",
      });

      // Reset form
      setCurrentStep('vehicle-selection');
      setSelectedVehicle('');
      setCurrentQuestionIndex(0);
      setAnswers({});
      setNotes('');

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit vehicle check",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQuestion = mobileQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / mobileQuestions.length) * 100;

  const renderQuestion = () => {
    if (!currentQuestion) return null;

    return (
      <Card className="mobile-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Question {currentQuestionIndex + 1} of {mobileQuestions.length}
            </CardTitle>
                         <Dialog open={infoModalOpen} onOpenChange={setInfoModalOpen}>
               <DialogTrigger asChild>
                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={() => {
                     setCurrentQuestionInfo(`Guidance for: ${currentQuestion.question_text}`);
                     setInfoModalOpen(true);
                   }}
                 >
                   <Info className="w-4 h-4" />
                 </Button>
               </DialogTrigger>
               <DialogContent>
                 <DialogHeader>
                   <DialogTitle>Guidance</DialogTitle>
                   <DialogDescription>
                     {currentQuestionInfo}
                   </DialogDescription>
                 </DialogHeader>
               </DialogContent>
             </Dialog>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={currentQuestion.is_critical ? "destructive" : "secondary"}>
              {currentQuestion.is_critical ? "Critical" : "Standard"}
            </Badge>
            <Badge variant="outline">{currentQuestion.category}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-base font-medium">
              {currentQuestion.question_text}
              {currentQuestion.is_required && <span className="text-red-500 ml-1">*</span>}
            </Label>
          </div>

          {currentQuestion.question_type === 'yes_no' && (
            <div className="flex space-x-4">
              <Button
                variant={answers[currentQuestion.id] === true ? "default" : "outline"}
                className="flex-1 mobile-button"
                onClick={() => handleAnswerChange(currentQuestion.id, true)}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Yes
              </Button>
              <Button
                variant={answers[currentQuestion.id] === false ? "default" : "outline"}
                className="flex-1 mobile-button"
                onClick={() => handleAnswerChange(currentQuestion.id, false)}
              >
                <XCircle className="w-4 h-4 mr-2" />
                No
              </Button>
            </div>
          )}

          {currentQuestion.question_type === 'text' && (
            <Textarea
              placeholder="Enter your response..."
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
              className="min-h-[100px]"
            />
          )}

          {currentQuestion.question_type === 'number' && (
            <Input
              type="number"
              placeholder="Enter number..."
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
            />
          )}
        </CardContent>
      </Card>
    );
  };

  const renderVehicleSelection = () => (
    <Card className="mobile-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Car className="w-5 h-5" />
          <span>Select Vehicle</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {vehiclesLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading vehicles...</p>
          </div>
        ) : availableVehicles.length === 0 ? (
          <div className="text-center py-8">
            <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No vehicles available</p>
          </div>
        ) : (
          <div className="space-y-2">
            {availableVehicles.map((vehicle) => (
              <Button
                key={vehicle.id}
                variant={selectedVehicle === vehicle.id ? "default" : "outline"}
                className="w-full justify-start mobile-button"
                onClick={() => setSelectedVehicle(vehicle.id)}
              >
                <Car className="w-4 h-4 mr-3" />
                <div className="text-left">
                  <div className="font-medium">{vehicle.license_plate}</div>
                  <div className="text-sm text-muted-foreground">{vehicle.vehicle_number}</div>
                </div>
              </Button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderReview = () => (
    <div className="space-y-4">
      <Card className="mobile-card">
        <CardHeader>
          <CardTitle>Review Your Check</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Additional Notes (Optional)</Label>
            <Textarea
              placeholder="Add any additional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-2"
            />
          </div>

          <div className="space-y-2">
            <Label>Summary</Label>
            <div className="space-y-1">
              {mobileQuestions.map((question) => (
                <div key={question.id} className="flex justify-between text-sm">
                  <span className="truncate">{question.question_text}</span>
                  <Badge variant={answers[question.id] ? "default" : "destructive"}>
                    {answers[question.id] ? "Yes" : "No"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (currentStep === 'questions') {
              setCurrentStep('vehicle-selection');
              setCurrentQuestionIndex(0);
            } else if (currentStep === 'review') {
              setCurrentStep('questions');
            }
          }}
          disabled={currentStep === 'vehicle-selection'}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">Vehicle Check</h1>
          <p className="text-sm text-muted-foreground">
            Daily safety inspection
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      {currentStep === 'questions' && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {/* Content */}
      {currentStep === 'vehicle-selection' && renderVehicleSelection()}
      {currentStep === 'questions' && renderQuestion()}
      {currentStep === 'review' && renderReview()}

      {/* Navigation */}
      <div className="flex space-x-4 pt-4">
        {currentStep === 'vehicle-selection' && (
          <Button
            className="flex-1 mobile-button"
            onClick={() => setCurrentStep('questions')}
            disabled={!selectedVehicle}
          >
            Start Check
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}

        {currentStep === 'questions' && (
          <>
            <Button
              variant="outline"
              className="flex-1 mobile-button"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            <Button
              className="flex-1 mobile-button"
              onClick={handleNext}
              disabled={!answers[currentQuestion.id]}
            >
              {currentQuestionIndex === mobileQuestions.length - 1 ? 'Review' : 'Next'}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </>
        )}

        {currentStep === 'review' && (
          <Button
            className="flex-1 mobile-button"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Submit Check
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default MobileVehicleCheck;
