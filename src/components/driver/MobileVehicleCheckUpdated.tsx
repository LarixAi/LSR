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
  User,
  Wifi,
  Signal
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useCreateVehicleCheck } from '@/hooks/useVehicleChecks';
import { useVehicles } from '@/hooks/useVehicles';
import { supabase } from '@/integrations/supabase/client';

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

// Enhanced mobile questions with backend integration
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
    question_text: 'Are seatbelts functioning properly?',
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
  },
  {
    id: '9',
    question_text: 'Are there any fluid leaks?',
    question_type: 'yes_no',
    is_required: true,
    is_critical: true,
    order_index: 9,
    category: 'Mechanical'
  },
  {
    id: '10',
    question_text: 'Is the engine running smoothly?',
    question_type: 'yes_no',
    is_required: true,
    is_critical: true,
    order_index: 10,
    category: 'Mechanical'
  }
];

const MobileVehicleCheckUpdated: React.FC = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { data: vehicles, isLoading: vehiclesLoading } = useVehicles();
  const createVehicleCheck = useCreateVehicleCheck();

  // State management
  const [currentStep, setCurrentStep] = useState<'vehicle-selection' | 'questions' | 'review'>('vehicle-selection');
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [gpsLocation, setGpsLocation] = useState<GPSLocation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [offlineData, setOfflineData] = useState<any[]>([]);

  // Check connection status
  React.useEffect(() => {
    const checkConnection = () => {
      if (navigator.onLine) {
        setConnectionStatus('online');
      } else {
        setConnectionStatus('offline');
      }
    };

    checkConnection();
    window.addEventListener('online', checkConnection);
    window.addEventListener('offline', checkConnection);

    return () => {
      window.removeEventListener('online', checkConnection);
      window.removeEventListener('offline', checkConnection);
    };
  }, []);

  // Get GPS location
  const getGPSLocation = useCallback(async (): Promise<GPSLocation | null> => {
    if (!navigator.geolocation) {
      toast({
        title: "GPS not available",
        description: "Location services are not available on this device.",
        variant: "destructive"
      });
      return null;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        });
      });

      const location: GPSLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        timestamp: new Date().toISOString()
      };

      setGpsLocation(location);
      return location;
    } catch (error) {
      console.error('GPS error:', error);
      toast({
        title: "Location error",
        description: "Unable to get your location. Please check GPS settings.",
        variant: "destructive"
      });
      return null;
    }
  }, [toast]);

  // Enhanced submit with offline support
  const handleSubmit = async () => {
    if (!user || !profile || !selectedVehicle) {
      toast({
        title: "Error",
        description: "Missing required information. Please try again.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get GPS location
      const location = await getGPSLocation();

      // Prepare check data
      const checkData = {
        vehicle_id: selectedVehicle.id,
        driver_id: user.id,
        organization_id: profile.organization_id,
        check_date: new Date().toISOString(),
        location: location,
        answers: answers,
        notes: notes,
        status: 'completed',
        total_questions: mobileQuestions.length,
        passed_questions: Object.values(answers).filter(answer => answer === 'yes' || answer === true).length,
        failed_questions: Object.values(answers).filter(answer => answer === 'no' || answer === false).length,
        critical_failures: mobileQuestions
          .filter(q => q.is_critical && (answers[q.id] === 'no' || answers[q.id] === false))
          .length
      };

      // Check if we're online
      if (connectionStatus === 'online') {
        // Submit to backend
        const { data, error } = await supabase
          .from('vehicle_checks')
          .insert([checkData])
          .select()
          .single();

        if (error) {
          throw error;
        }

        toast({
          title: "Check submitted successfully",
          description: `Vehicle check completed for ${selectedVehicle.registration_number}`,
        });

        // Reset form
        setCurrentStep('vehicle-selection');
        setSelectedVehicle(null);
        setCurrentQuestionIndex(0);
        setAnswers({});
        setNotes({});
        setGpsLocation(null);
      } else {
        // Store offline
        const offlineCheck = {
          ...checkData,
          id: `offline_${Date.now()}`,
          created_at: new Date().toISOString(),
          sync_status: 'pending'
        };

        setOfflineData(prev => [...prev, offlineCheck]);
        
        // Store in localStorage
        const existingOffline = JSON.parse(localStorage.getItem('offlineVehicleChecks') || '[]');
        localStorage.setItem('offlineVehicleChecks', JSON.stringify([...existingOffline, offlineCheck]));

        toast({
          title: "Check saved offline",
          description: "Your check has been saved and will sync when connection is restored.",
        });

        // Reset form
        setCurrentStep('vehicle-selection');
        setSelectedVehicle(null);
        setCurrentQuestionIndex(0);
        setAnswers({});
        setNotes({});
        setGpsLocation(null);
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: "Submission failed",
        description: "There was an error submitting your vehicle check. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sync offline data when connection is restored
  React.useEffect(() => {
    if (connectionStatus === 'online' && offlineData.length > 0) {
      const syncOfflineData = async () => {
        try {
          for (const check of offlineData) {
            const { error } = await supabase
              .from('vehicle_checks')
              .insert([check]);

            if (!error) {
              // Remove from offline storage
              setOfflineData(prev => prev.filter(c => c.id !== check.id));
              const existingOffline = JSON.parse(localStorage.getItem('offlineVehicleChecks') || '[]');
              localStorage.setItem('offlineVehicleChecks', JSON.stringify(
                existingOffline.filter((c: any) => c.id !== check.id)
              ));
            }
          }

          if (offlineData.length > 0) {
            toast({
              title: "Data synced",
              description: `${offlineData.length} offline checks have been synced to the server.`,
            });
          }
        } catch (error) {
          console.error('Sync error:', error);
        }
      };

      syncOfflineData();
    }
  }, [connectionStatus, offlineData, toast]);

  // Load offline data on mount
  React.useEffect(() => {
    const existingOffline = JSON.parse(localStorage.getItem('offlineVehicleChecks') || '[]');
    setOfflineData(existingOffline);
  }, []);

  const currentQuestion = mobileQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / mobileQuestions.length) * 100;

  const handleNext = () => {
    if (currentQuestionIndex < mobileQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setCurrentStep('review');
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const renderVehicleSelection = () => (
    <div className="space-y-4">
      <div className="text-center">
        <Car className="w-16 h-16 mx-auto mb-4 text-primary" />
        <h2 className="text-xl font-semibold mb-2">Select Vehicle</h2>
        <p className="text-muted-foreground">Choose the vehicle you're checking today</p>
      </div>

      {vehiclesLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {vehicles?.map((vehicle) => (
            <Card
              key={vehicle.id}
              className={`cursor-pointer transition-all ${
                selectedVehicle?.id === vehicle.id
                  ? 'ring-2 ring-primary bg-primary/5'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => setSelectedVehicle(vehicle)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{vehicle.registration_number}</h3>
                    <p className="text-sm text-muted-foreground">{vehicle.make} {vehicle.model}</p>
                  </div>
                  {selectedVehicle?.id === vehicle.id && (
                    <CheckCircle className="w-5 h-5 text-primary" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderQuestion = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Badge variant="outline" className="mb-2">
          Question {currentQuestionIndex + 1} of {mobileQuestions.length}
        </Badge>
        <h2 className="text-lg font-semibold mb-2">{currentQuestion.question_text}</h2>
        {currentQuestion.is_critical && (
          <Badge variant="destructive" className="mb-2">
            Critical
          </Badge>
        )}
      </div>

      <div className="space-y-4">
        {currentQuestion.question_type === 'yes_no' && (
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={answers[currentQuestion.id] === 'yes' ? 'default' : 'outline'}
              className="h-16 text-lg"
              onClick={() => setAnswers(prev => ({ ...prev, [currentQuestion.id]: 'yes' }))}
            >
              <CheckCircle className="w-6 h-6 mr-2" />
              Yes
            </Button>
            <Button
              variant={answers[currentQuestion.id] === 'no' ? 'default' : 'outline'}
              className="h-16 text-lg"
              onClick={() => setAnswers(prev => ({ ...prev, [currentQuestion.id]: 'no' }))}
            >
              <XCircle className="w-6 h-6 mr-2" />
              No
            </Button>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="notes">Additional Notes (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="Add any additional observations..."
            value={notes[currentQuestion.id] || ''}
            onChange={(e) => setNotes(prev => ({ ...prev, [currentQuestion.id]: e.target.value }))}
            rows={3}
          />
        </div>
      </div>
    </div>
  );

  const renderReview = () => {
    const passedQuestions = Object.values(answers).filter(answer => answer === 'yes').length;
    const failedQuestions = Object.values(answers).filter(answer => answer === 'no').length;
    const criticalFailures = mobileQuestions
      .filter(q => q.is_critical && answers[q.id] === 'no')
      .length;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Review Your Check</h2>
          <p className="text-muted-foreground">Review your answers before submitting</p>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{passedQuestions}</div>
                <div className="text-sm text-muted-foreground">Passed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{failedQuestions}</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{criticalFailures}</div>
                <div className="text-sm text-muted-foreground">Critical</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {mobileQuestions.map((question, index) => (
            <Card key={question.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{question.question_text}</p>
                    {notes[question.id] && (
                      <p className="text-sm text-muted-foreground mt-1">{notes[question.id]}</p>
                    )}
                  </div>
                  <Badge variant={answers[question.id] === 'yes' ? 'default' : 'destructive'}>
                    {answers[question.id] === 'yes' ? 'Pass' : 'Fail'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Connection Status */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {connectionStatus === 'online' ? (
                  <Wifi className="w-4 h-4 text-green-600" />
                ) : (
                  <Signal className="w-4 h-4 text-orange-600" />
                )}
                <span className="text-sm">
                  {connectionStatus === 'online' ? 'Online - Will sync immediately' : 'Offline - Will sync when connected'}
                </span>
              </div>
              {offlineData.length > 0 && (
                <Badge variant="outline">
                  {offlineData.length} pending
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 space-y-4">
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

export default MobileVehicleCheckUpdated;
