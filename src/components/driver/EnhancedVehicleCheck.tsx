/**
 * Enhanced Vehicle Check Component
 * 
 * Comprehensive vehicle inspection system with 56 organized questions covering:
 * 
 * 🔹 Front of Vehicle (Questions 1-8)
 * - Fuel/Oil/Fluid leaks, windscreen, wipers, headlights, indicators, horn, mirrors, registration plate
 * 
 * 🔹 Nearside/Passenger Side (Questions 9-13)  
 * - Tyres, wheel nuts, mudguards, bodywork, reflectors
 * 
 * 🔹 Rear of Vehicle (Questions 14-20)
 * - Rear lights, brake lights, indicators, number plate light, registration plate, reflectors, tail lift, under-run protection, doors/tailgate
 * 
 * 🔹 Offside/Driver's Side (Questions 21-24)
 * - Tyres & wheels, exhaust system, side marker lamps, fuel filler cap
 * 
 * 🔹 Inside Cab (Questions 25-33)
 * - Driver's seat & belts, steering wheel, brakes, dashboard warnings, tachograph, odometer, handbrake, heating/ventilation, saloon lighting
 * 
 * 🔹 Safety Equipment (Questions 34-42)
 * - Fire extinguisher, first aid kit, passenger doors, emergency exits, wheelchair access, seat belts, accessibility signage, cameras, fresnel lens
 * 
 * 🔹 Load & Trailer (Questions 43-47)
 * - Load security, height limits, trailer brake lines, coupling, landing legs
 * 
 * 🔹 General Equipment (Questions 48-52)
 * - AdBlue level, warning triangles, emergency contacts, fire suppression, vehicle cleanliness
 * 
 * 🔹 Final Check (Questions 53-54)
 * - Nil defects confirmation, defect reporting
 * 
 * 🔹 Documentation & Driver (Questions 55-56)
 * - Current mileage, driver fitness
 * 
 * Features:
 * - GPS tracking during inspection
 * - Photo capture of registration plate
 * - Unique reference numbers
 * - Digital signature capture
 * - Category-based organization
 * - Critical vs non-critical question marking
 * - Comprehensive reporting
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  Download,
  FileText,
  Clock,
  User,
  Navigation,
  RotateCcw,
  Info
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useCreateVehicleCheck } from '@/hooks/useVehicleChecks';
import { uploadFileToStorage } from '@/utils/fileUpload';
import { useVehicles } from '@/hooks/useVehicles';
import { useVehicleCheckQuestions, type VehicleCheckQuestion } from '@/hooks/useVehicleCheckQuestions';

// This component now uses admin-controlled questions from the database
// instead of hardcoded questions. The hook handles fallback to default
// questions if no admin questions are available.

// VehicleCheckQuestion interface is now imported from the hook

interface GPSLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
}

interface VehicleCheckSession {
  id: string;
  reference_number: string;
  vehicle_id: string;
  vehicle_number: string;
  license_plate: string;
  driver_id: string;
  driver_name: string;
  template_id: string;
  template_name: string;
  start_time: string;
  end_time?: string;
  status: 'in_progress' | 'completed' | 'failed';
  mileage: number;
  registration_photo_url?: string;
  gps_track: GPSLocation[];
  answers: Record<string, any>;
  signature_url?: string;
  notes: string;
}

const EnhancedVehicleCheck: React.FC = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const createVehicleCheck = useCreateVehicleCheck();
  const { data: vehicles = [], isLoading: vehiclesLoading } = useVehicles();
  // Use admin-controlled questions from the database (with fallback to defaults)
  const { data: questions = [], isLoading: questionsLoading } = useVehicleCheckQuestions();
  const [currentStep, setCurrentStep] = useState<'vehicle-selection' | 'registration-photo' | 'mileage' | 'questions' | 'signature' | 'review'>('vehicle-selection');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [registrationPhoto, setRegistrationPhoto] = useState<string>('');
  const [mileage, setMileage] = useState<string>('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [gpsTrack, setGpsTrack] = useState<GPSLocation[]>([]);
  const [isGpsTracking, setIsGpsTracking] = useState(false);
  const [signature, setSignature] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [checkSession, setCheckSession] = useState<VehicleCheckSession | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [currentQuestionInfo, setCurrentQuestionInfo] = useState<string>('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);

  // Use real vehicles from database
  const availableVehicles = vehicles.filter(v => v.is_active !== false); // Consider undefined/null as active

  // Helper functions for category display
  const getCategoryDisplayName = (category: string): string => {
    const categoryNames: Record<string, string> = {
      'exterior': '🔹 Exterior Check',
      'interior': '🔹 Interior Check', 
      'safety': '🔹 Safety Equipment',
      'lights': '🔹 Lights & Indicators',
      'tires': '🔹 Tyres & Wheels',
      'brakes': '🔹 Braking System',
      'fuel': '🔹 Fuel & AdBlue',
      'engine': '🔹 Engine & Exhaust',
      'general': '🔹 General Equipment',
      'documentation': '🔹 Documentation',
      'driver': '🔹 Driver Check'
    };
    return categoryNames[category] || category;
  };

  const getCategoryDescription = (category: string): string => {
    const categoryDescriptions: Record<string, string> = {
      'exterior': 'Checking vehicle exterior, body condition, and registration plates',
      'interior': 'Checking cab interior, controls, and dashboard systems',
      'safety': 'Checking safety equipment, emergency exits, and accessibility features',
      'lights': 'Checking all lighting systems including headlights, indicators, and brake lights',
      'tires': 'Checking tyre condition, tread depth, pressure, and wheel security',
      'brakes': 'Checking braking system operation and handbrake function',
      'fuel': 'Checking fuel system, AdBlue levels, and related components',
      'engine': 'Checking engine bay, exhaust system, and mechanical components',
      'general': 'Checking general equipment, cleanliness, and emergency devices',
      'documentation': 'Recording mileage and documentation checks',
      'driver': 'Driver fitness and readiness assessment'
    };
    return categoryDescriptions[category] || 'Vehicle inspection category';
  };

  // Helper function to get question guidance (now uses database guidance field)
  const getQuestionGuidance = (questionId: string): string => {
    // First try to get guidance from the question object
    const question = questions.find(q => q.id === questionId);
    if (question?.guidance) {
      return question.guidance;
    }
    
    // Fallback to hardcoded guidance for legacy questions
    const guidanceMap: Record<string, string> = {
      // Front of Vehicle
      '1': 'Check for any visible leaks under the vehicle. Look for oil, fuel, coolant, or other fluid stains on the ground. Pay attention to the engine area, transmission, and fuel tank.',
      '2': 'Inspect the windscreen for cracks, chips, or damage. Ensure it\'s clean and provides clear visibility. Check for any delamination or distortion.',
      '3': 'Test the wipers by turning them on. Check that they clear the windscreen effectively. Test the washer fluid spray and ensure it reaches the windscreen.',
      '4': 'Turn on the headlights and check both main beam and dipped beam. Ensure lenses are clean and not cracked. Check that both lights are working.',
      '5': 'Test all front indicators including side repeaters. Ensure they flash at the correct rate and are visible from all angles.',
      '6': 'Test the horn by pressing it. Ensure it produces a clear, audible sound that can be heard from outside the vehicle.',
      '7': 'Check all mirrors are securely fitted and properly adjusted. Ensure they\'re not cracked or damaged. Test that they provide adequate rearward visibility.',
      '8': 'Verify the front registration plate is present, clean, and securely attached. Check that all numbers and letters are clearly visible and not obscured.',

      // Nearside (Passenger Side)
      '9': 'Inspect all tyres on the passenger side. Check tread depth (minimum 1.6mm), look for cuts, bulges, or damage. Check tyre pressure and ensure valve caps are present.',
      '10': 'Check all wheel nuts are present and properly tightened. Look for any signs of rust, cracks, or missing nuts. Ensure wheel covers are secure.',
      '11': 'Inspect mudguards and spray suppression devices. Ensure they\'re properly fitted and not damaged. Check they\'re positioned correctly to prevent spray.',
      '12': 'Check bodywork for any damage, sharp edges, or corrosion. Look for dents, scratches, or areas that could cause injury or further damage.',
      '13': 'Inspect all reflectors on the passenger side. Ensure they\'re clean, secure, and properly positioned. Check they\'re not cracked or damaged.',

      // Rear of Vehicle
      '14': 'Test all rear lights including brake lights, indicators, and tail lights. Ensure they\'re working correctly and visible from behind the vehicle.',
      '15': 'Check the number plate light is working and illuminates the registration plate clearly. Ensure it\'s not cracked or damaged.',
      '16': 'Inspect the rear registration plate. Ensure it\'s clean, secure, and all numbers/letters are clearly visible.',
      '17': 'Check rear reflectors are clean, secure, and properly positioned. Ensure they\'re not damaged or missing.',
      '18': 'If fitted, test the tail lift operation. Check it raises and lowers smoothly, and locks securely in both positions.',
      '19': 'Inspect under-run protection bars if fitted. Ensure they\'re securely attached and not damaged or bent.',
      '20': 'Test rear doors or tailgate operation. Check hinges, locks, and latches work correctly. Ensure doors close and seal properly.',

      // Offside (Driver's Side)
      '21': 'Inspect all tyres on the driver\'s side. Check tread depth, condition, pressure, and look for any damage or wear.',
      '22': 'Check the exhaust system is secure and not leaking. Look for excessive smoke or unusual noises. Ensure the exhaust pipe is not damaged.',
      '23': 'Test side marker lamps are working correctly. Ensure they\'re visible and not damaged.',
      '24': 'Check the fuel filler cap is secure and not leaking. Ensure the cap fits properly and the seal is intact.',

      // Inside Cab
      '25': 'Check the driver\'s seat is secure and properly adjusted. Test seat belts buckle and unbuckle correctly. Ensure belts retract properly.',
      '26': 'Check steering wheel for excessive play or looseness. Ensure it turns smoothly and returns to center properly.',
      '27': 'Test brake pedal feel and travel. Check for any brake warning lights. Ensure brakes feel firm and responsive.',
      '28': 'Check all dashboard warning lights are functioning. Ensure no warning lights remain illuminated when they shouldn\'t be.',
      '29': 'Verify tachograph is working and calibrated. Check paper roll is available and properly fitted. Ensure time is set correctly.',
      '30': 'Check odometer is functioning and recording mileage correctly. Test speed limiter if fitted.',
      '31': 'Test handbrake/parking brake operation. Ensure it holds the vehicle securely on a slope.',
      '32': 'Test heating and ventilation systems. Ensure air flows correctly and temperature controls work.',
      '33': 'Check saloon lighting and flooring are safe and secure. Look for any loose or damaged floor panels.',

      // Safety Equipment
      '34': 'Verify fire extinguisher is present, secure, and in date. Check it\'s easily accessible and properly mounted.',
      '35': 'Check first aid kit is present, stocked, and in date. Ensure it\'s easily accessible and properly stored.',
      '36': 'Test all passenger doors open and close properly. Check emergency exits are clearly marked and functional.',
      '37': 'If fitted, check emergency hammers are present and secure. Ensure they\'re easily accessible in an emergency.',
      '38': 'If fitted, test wheelchair ramp/lift operation. Ensure it works smoothly and safely.',
      '39': 'Check all passenger seat belts are working correctly. Ensure they buckle and retract properly.',
      '40': 'Verify accessibility signage is fitted and visible. Check it meets required standards.',
      '41': 'If fitted, check camera systems are working and clean. Ensure displays are clear and functional.',
      '42': 'If fitted, check fresnel lens is properly positioned and visible. Ensure it provides adequate blind spot coverage.',

      // Load & Trailer
      '43': 'Check load is properly secured with appropriate restraints. Ensure curtains or straps are tight and secure.',
      '44': 'Verify load height is within legal limits. Check it doesn\'t exceed maximum permitted height.',
      '45': 'If towing, check trailer brake lines are secure and not leaking. Test brake operation.',
      '46': 'If towing, check trailer coupling is secure and clip is in place. Ensure electrical connections are safe.',
      '47': 'If towing, check trailer landing legs are up and secure. Ensure they\'re not dragging or loose.',

      // General Equipment
      '48': 'Check AdBlue level if fitted. Ensure cap is secure and system is functioning.',
      '49': 'Verify warning triangles or other warning devices are on board and accessible.',
      '50': 'Check emergency contact numbers are carried in the cab and easily accessible.',
      '51': 'If fitted, test fire suppression system operation. Ensure it\'s properly maintained.',
      '52': 'Check cab is clean and free from loose items that could cause hazards during operation.',

      // Final Check
      '53': 'Confirm no defects were found during the inspection. If defects were found, ensure they\'re properly documented.',
      '54': 'Verify all defects have been reported to the transport manager immediately. Ensure proper reporting procedures were followed.',

      // Documentation & Driver
      '55': 'Record the current mileage reading from the vehicle odometer. Ensure it\'s accurate and legible.',
      '56': 'Confirm you are fit to drive. Check you\'re not tired, under the influence, or suffering from any condition that could affect driving ability.'
    };
    return guidanceMap[questionId] || 'Please inspect this item thoroughly and ensure it meets safety standards.';
  };

  // Generate sequential reference number
  useEffect(() => {
    const generateSequentialReferenceNumber = () => {
      const companyPrefix = 'DF'; // This should come from organization settings
      const currentDate = new Date();
      const year = currentDate.getFullYear().toString().slice(-2);
      const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
      const day = currentDate.getDate().toString().padStart(2, '0');
      
      // Get sequential number from localStorage or start from 1
      const storageKey = `vehicle_check_counter_${year}${month}${day}`;
      const currentCounter = parseInt(localStorage.getItem(storageKey) || '0') + 1;
      localStorage.setItem(storageKey, currentCounter.toString());
      
      // Format: DF + YYMMDD + 4-digit sequential number
      const sequentialNumber = currentCounter.toString().padStart(4, '0');
      
      return `${companyPrefix}${year}${month}${day}${sequentialNumber}`;
    };
    
    setReferenceNumber(generateSequentialReferenceNumber());
  }, []);

  // Handle video ready event and cleanup
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const handleCanPlay = () => {
        console.log('Video is ready to play');
      };
      
      const handleError = (error: Event) => {
        console.error('Video error:', error);
        setIsCameraActive(false);
      };
      
      video.addEventListener('canplay', handleCanPlay);
      video.addEventListener('error', handleError);
      
      return () => {
        video.removeEventListener('canplay', handleCanPlay);
        video.removeEventListener('error', handleError);
        
        // Cleanup camera stream on unmount
        if (video.srcObject) {
          const stream = video.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
        }
      };
    }
  }, []);

  // GPS Tracking
  useEffect(() => {
    let watchId: number | null = null;
    
    if (isGpsTracking && navigator.geolocation) {
      try {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            const newLocation: GPSLocation = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: new Date().toISOString()
            };
            setGpsTrack(prev => [...prev, newLocation]);
          },
          (error) => {
            console.error('GPS Error:', error);
            // Don't show error toast for GPS issues, just log them
            console.log('GPS tracking failed, continuing without GPS');
          },
          {
            enableHighAccuracy: false, // Changed to false to avoid timeouts
            timeout: 5000,
            maximumAge: 60000
          }
        );
      } catch (error) {
        console.error('GPS initialization error:', error);
      }
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [isGpsTracking]);

  const startGpsTracking = () => {
    setIsGpsTracking(true);
    console.log('GPS tracking started');
  };

  const stopGpsTracking = () => {
    setIsGpsTracking(false);
    console.log('GPS tracking stopped');
  };

  // Camera functionality
  const startCamera = async () => {
    setIsStartingCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraActive(true);
        console.log('Camera started successfully');
      }
    } catch (error) {
      console.error('Camera error:', error);
      setIsCameraActive(false);
      
      // Show specific error messages based on the error type
      let errorMessage = "Please allow camera access to continue with the vehicle check.";
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = "Camera access was denied. Please allow camera permissions in your browser settings.";
        } else if (error.name === 'NotFoundError') {
          errorMessage = "No camera found on this device.";
        } else if (error.name === 'NotSupportedError') {
          errorMessage = "Camera is not supported on this device or browser.";
        }
      }
      
      toast({
        title: "Camera Access",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsStartingCamera(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current && isCameraActive) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        // Check if video is ready
        if (video.videoWidth === 0 || video.videoHeight === 0) {
          toast({
            title: "Camera Not Ready",
            description: "Please wait for the camera to initialize before capturing.",
            variant: "destructive"
          });
          return;
        }
        
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw the video frame to canvas
        context.drawImage(video, 0, 0);
        
        // Convert to data URL
        const photoData = canvas.toDataURL('image/jpeg', 0.8);
        setRegistrationPhoto(photoData);
        
        // Stop camera stream
        const stream = video.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        
        setIsCameraActive(false);
        
        toast({
          title: "Photo Captured",
          description: "Registration plate photo has been captured successfully.",
        });
      }
    } else {
      toast({
        title: "Camera Not Available",
        description: "Please start the camera first before capturing a photo.",
        variant: "destructive"
      });
    }
  };

  // Signature functionality
  const startSignature = () => {
    console.log('Starting signature capture');
    if (signatureCanvasRef.current) {
      const canvas = signatureCanvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        // Clear canvas
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        // Set drawing style
        context.strokeStyle = '#000';
        context.lineWidth = 3;
        context.lineCap = 'round';
        context.lineJoin = 'round';
        
        let isDrawing = false;
        let lastX = 0;
        let lastY = 0;
        
        const getCoordinates = (e: MouseEvent | TouchEvent) => {
          const rect = canvas.getBoundingClientRect();
          const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
          const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
          return {
            x: clientX - rect.left,
            y: clientY - rect.top
          };
        };
        
        const startDrawing = (e: MouseEvent | TouchEvent) => {
          e.preventDefault();
          isDrawing = true;
          const coords = getCoordinates(e);
          lastX = coords.x;
          lastY = coords.y;
        };
        
        const draw = (e: MouseEvent | TouchEvent) => {
          e.preventDefault();
          if (!isDrawing) return;
          
          const coords = getCoordinates(e);
          context.beginPath();
          context.moveTo(lastX, lastY);
          context.lineTo(coords.x, coords.y);
          context.stroke();
          
          lastX = coords.x;
          lastY = coords.y;
        };
        
        const stopDrawing = () => {
          isDrawing = false;
          const signatureData = canvas.toDataURL('image/png');
          setSignature(signatureData);
          console.log('Signature captured');
        };
        
        // Remove existing listeners
        canvas.removeEventListener('mousedown', startDrawing);
        canvas.removeEventListener('mousemove', draw);
        canvas.removeEventListener('mouseup', stopDrawing);
        canvas.removeEventListener('mouseleave', stopDrawing);
        canvas.removeEventListener('touchstart', startDrawing);
        canvas.removeEventListener('touchmove', draw);
        canvas.removeEventListener('touchend', stopDrawing);
        
        // Add new listeners
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseleave', stopDrawing);
        canvas.addEventListener('touchstart', startDrawing, { passive: false });
        canvas.addEventListener('touchmove', draw, { passive: false });
        canvas.addEventListener('touchend', stopDrawing);
        
        console.log('Signature listeners added');
      }
    }
  };

  const clearSignature = () => {
    if (signatureCanvasRef.current) {
      const canvas = signatureCanvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        setSignature('');
      }
    }
  };

  const handleAnswer = (questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    console.log('=== STEP PROGRESSION DEBUG ===');
    console.log('Current step:', currentStep);
    console.log('Question index:', currentQuestionIndex);
    console.log('Selected vehicle:', selectedVehicle);
    console.log('Registration photo:', registrationPhoto ? 'Present' : 'Missing');
    console.log('Mileage:', mileage);
    console.log('Signature:', signature ? 'Present' : 'Missing');
    console.log('==============================');
    
    if (currentStep === 'vehicle-selection') {
      if (selectedVehicle) {
        setCurrentStep('registration-photo');
        console.log('Moving to registration-photo');
      } else {
        toast({
          title: "Vehicle Required",
          description: "Please select a vehicle to continue.",
          variant: "destructive"
        });
      }
    } else if (currentStep === 'registration-photo') {
      if (registrationPhoto) {
        setCurrentStep('mileage');
        console.log('Moving to mileage');
      } else {
        toast({
          title: "Photo Required",
          description: "Please capture a photo of the registration plate.",
          variant: "destructive"
        });
      }
    } else if (currentStep === 'mileage') {
      if (mileage && mileage.trim() !== '') {
        setCurrentStep('questions');
        startGpsTracking();
        console.log('Moving to questions, GPS tracking started');
      } else {
        toast({
          title: "Mileage Required",
          description: "Please enter the current mileage.",
          variant: "destructive"
        });
      }
    } else if (currentStep === 'questions') {
      console.log('=== QUESTION PROGRESSION DEBUG ===');
      console.log('Current question index:', currentQuestionIndex);
             console.log('Total questions:', questions.length);
       console.log('Should move to next question:', currentQuestionIndex < questions.length - 1);
      console.log('=====================================');
      
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => {
          console.log('Moving from question', prev, 'to', prev + 1);
          return prev + 1;
        });
        console.log('Moving to next question:', currentQuestionIndex + 1);
      } else {
        console.log('Reached last question, moving to signature step');
        stopGpsTracking();
        setCurrentStep('signature');
        // Delay signature initialization to ensure step change completes
        setTimeout(() => {
          startSignature();
        }, 100);
        console.log('Moving to signature');
      }
    } else if (currentStep === 'signature') {
      if (signature) {
        setCurrentStep('review');
        console.log('Moving to review');
      } else {
        toast({
          title: "Signature Required",
          description: "Please provide your signature to continue.",
          variant: "destructive"
        });
      }
    }
  };

  const handlePrevious = () => {
    console.log('Going back from step:', currentStep);
    
    if (currentStep === 'registration-photo') {
      setCurrentStep('vehicle-selection');
    } else if (currentStep === 'mileage') {
      setCurrentStep('registration-photo');
    } else if (currentStep === 'questions') {
      if (currentQuestionIndex > 0) {
        setCurrentQuestionIndex(prev => prev - 1);
      } else {
        setCurrentStep('mileage');
      }
    } else if (currentStep === 'signature') {
      setCurrentStep('questions');
      setCurrentQuestionIndex(questions.length - 1);
    } else if (currentStep === 'review') {
      setCurrentStep('signature');
    }
  };

  const handleSubmit = async () => {
    if (!profile?.organization_id || !profile?.id) {
      toast({
        title: "Authentication Error",
        description: "Please log in again to continue.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Submitting vehicle check...');
      
      // Upload registration photo to storage
      let registrationPhotoUrl = '';
      if (registrationPhoto) {
        const photoBlob = await fetch(registrationPhoto).then(r => r.blob());
        const photoFile = new File([photoBlob], 'registration-photo.jpg', { type: 'image/jpeg' });
        
        const photoUploadResult = await uploadFileToStorage(
          photoFile,
          'vehicle-photos',
          'registration-photos',
          profile.organization_id,
          profile.id
        );
        
        if (photoUploadResult.success) {
          registrationPhotoUrl = photoUploadResult.fileUrl || '';
        } else {
          console.warn('Failed to upload registration photo:', photoUploadResult.error);
        }
      }

      // Upload signature to storage
      let signatureUrl = '';
      if (signature) {
        const signatureBlob = await fetch(signature).then(r => r.blob());
        const signatureFile = new File([signatureBlob], 'signature.png', { type: 'image/png' });
        
        const signatureUploadResult = await uploadFileToStorage(
          signatureFile,
          'vehicle-photos',
          'signatures',
          profile.organization_id,
          profile.id
        );
        
        if (signatureUploadResult.success) {
          signatureUrl = signatureUploadResult.fileUrl || '';
        } else {
          console.warn('Failed to upload signature:', signatureUploadResult.error);
        }
      }

      // Calculate overall score based on answers
      const totalQuestions = questions.length;
      const answeredQuestions = Object.keys(answers).length;
      const score = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;

      // Determine pass/fail status
      const criticalQuestions = questions.filter(q => q.is_critical);
      const criticalFailures = criticalQuestions.filter(q => answers[q.id] === false).length;
      const passFail = criticalFailures === 0;

      // Create vehicle check data for database
      const vehicleCheckData = {
        organization_id: profile.organization_id,
        vehicle_id: selectedVehicle,
        driver_id: profile.id,
        check_type: 'daily',
        status: 'completed',
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        odometer_reading: parseInt(mileage) || 0,
        overall_condition: passFail ? 'good' : 'poor',
        defects_found: criticalFailures,
        critical_issues: criticalFailures,
        score: score,
        pass_fail: passFail,
        compliance_status: passFail ? 'compliant' : 'non_compliant',
        notes: notes,
        attachments: JSON.stringify({
          registration_photo_url: registrationPhotoUrl,
          signature_url: signatureUrl,
          gps_track: gpsTrack,
          answers: answers,
          reference_number: referenceNumber
        }),
        metadata: JSON.stringify({
          reference_number: referenceNumber,
          gps_points_count: gpsTrack.length,
          questions_answered: answeredQuestions,
          total_questions: totalQuestions
        })
      };

      // Save to database using the hook
      const result = await createVehicleCheck.mutateAsync(vehicleCheckData as any);
      
      // Create session for UI display
      const session: VehicleCheckSession = {
        id: result.id,
        reference_number: referenceNumber,
        vehicle_id: selectedVehicle,
        vehicle_number: availableVehicles.find(v => v.id === selectedVehicle)?.vehicle_number || '',
        license_plate: availableVehicles.find(v => v.id === selectedVehicle)?.license_plate || '',
        driver_id: profile.id,
                        driver_name: profile?.first_name && profile?.last_name ? `${profile.first_name} ${profile.last_name}` : profile?.email || '',
        template_id: '1',
        template_name: 'Standard Vehicle Check',
        start_time: new Date().toISOString(),
        end_time: new Date().toISOString(),
        status: 'completed',
        mileage: parseInt(mileage) || 0,
        registration_photo_url: registrationPhotoUrl,
        gps_track: gpsTrack,
        answers: answers,
        signature_url: signatureUrl,
        notes: notes
      };

      setCheckSession(session);
      
      console.log('Vehicle check submitted successfully:', result);
    } catch (error) {
      console.error('Error submitting vehicle check:', error);
      toast({
        title: "Error",
        description: "Failed to complete vehicle check. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetCheck = () => {
    setCurrentStep('vehicle-selection');
    setSelectedVehicle('');
    setRegistrationPhoto('');
    setMileage('');
    setCurrentQuestionIndex(0);
    setAnswers({});
    setGpsTrack([]);
    setIsGpsTracking(false);
    setSignature('');
    setNotes('');
    setCheckSession(null);
    setIsSubmitting(false);
    
    // Stop any active camera stream
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    
    console.log('Vehicle check reset');
  };

  const getStepProgress = () => {
    const steps = ['vehicle-selection', 'registration-photo', 'mileage', 'questions', 'signature', 'review'];
    const currentIndex = steps.indexOf(currentStep);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  const getCurrentQuestion = () => {
    const question = questions[currentQuestionIndex];
    console.log('=== QUESTION DEBUG ===');
    console.log('Current question index:', currentQuestionIndex);
    console.log('Total questions:', questions.length);
    console.log('Current question:', question);
    console.log('Question ID:', question?.id);
    console.log('Question text:', question?.question);
    console.log('========================');
    return question;
  };

  const handleInfoClick = (questionId: string) => {
    setCurrentQuestionInfo(getQuestionGuidance(questionId));
    setInfoModalOpen(true);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'vehicle-selection':
        return (
          <Card className="w-full shadow-sm border-0 mobile-card">
            <CardHeader className="pb-4">
                          <CardTitle className="text-lg sm:text-xl">Select Vehicle</CardTitle>
            <CardDescription className="text-sm sm:text-base">
                Choose the vehicle you will be checking today
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="space-y-3">
                <Label htmlFor="vehicle" className="text-base font-medium">Vehicle</Label>
                <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                  <SelectTrigger className="h-14 sm:h-12 text-base mobile-touch-target">
                    <SelectValue placeholder="Choose your vehicle" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {vehiclesLoading ? (
                      <SelectItem value="loading" disabled>
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                          <span>Loading vehicles...</span>
                        </div>
                      </SelectItem>
                    ) : availableVehicles.length === 0 ? (
                      <SelectItem value="no-vehicles" disabled>
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="w-4 h-4 text-orange-500" />
                          <span>No vehicles available</span>
                        </div>
                      </SelectItem>
                    ) : (
                      availableVehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id} className="text-base mobile-touch-target">
                          <div className="flex flex-col">
                            <span className="font-medium">{vehicle.vehicle_number}</span>
                            <span className="text-sm text-muted-foreground">{vehicle.license_plate}</span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4 sm:p-6 border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2 sm:mb-3 text-base sm:text-lg">Reference Number</h3>
                <p className="text-blue-700 font-mono text-lg sm:text-xl lg:text-2xl font-bold mb-2 break-all">{referenceNumber}</p>
                <p className="text-blue-600 text-xs sm:text-sm">
                  This unique reference will appear on all documents
                </p>
              </div>
            </CardContent>
          </Card>
        );

      case 'registration-photo':
        return (
          <Card className="w-full shadow-sm border-0 mobile-card">
            <CardHeader className="pb-4">
                          <CardTitle className="text-lg sm:text-xl">Vehicle Registration Photo</CardTitle>
            <CardDescription className="text-sm sm:text-base">
                Take a clear photo of the vehicle registration plate
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              {!registrationPhoto ? (
                <div className="space-y-6">
                  <div className="relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-48 sm:h-64 lg:h-80 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 object-cover"
                    />
                    <canvas ref={canvasRef} className="hidden" />
                    
                    {/* Vehicle Outline Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="relative w-64 h-32">
                        {/* Vehicle body outline */}
                        <div className="absolute inset-0 border-2 border-white border-dashed rounded-lg bg-black bg-opacity-20"></div>
                        
                        {/* Registration plate area */}
                        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-8 border-2 border-yellow-400 bg-yellow-400 bg-opacity-20 rounded flex items-center justify-center">
                          <span className="text-yellow-400 text-xs font-bold">REG PLATE</span>
                        </div>
                        
                        {/* Positioning guide */}
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-white text-sm font-medium bg-black bg-opacity-50 px-3 py-1 rounded">
                          Position vehicle here
                        </div>
                      </div>
                    </div>
                    
                    {/* Camera instructions */}
                    <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-70 text-white p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Camera className="w-4 h-4" />
                        <span className="font-medium text-sm sm:text-base">Camera Instructions</span>
                      </div>
                      <ul className="text-xs sm:text-sm space-y-1">
                        <li>• Position the vehicle within the white outline</li>
                        <li>• Ensure the registration plate is clearly visible in the yellow area</li>
                        <li>• Hold the camera steady and well-lit</li>
                        <li>• Make sure the plate text is readable</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      onClick={startCamera} 
                      variant="outline" 
                      disabled={isStartingCamera}
                      className="flex-1 h-12 text-base mobile-button"
                    >
                      {isStartingCamera ? (
                        <>
                          <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                          Starting...
                        </>
                      ) : (
                        <>
                          <Camera className="w-5 h-5 mr-2" />
                          Start Camera
                        </>
                      )}
                    </Button>
                    <Button 
                      onClick={capturePhoto} 
                      disabled={!isCameraActive} 
                      className="flex-1 h-12 text-base mobile-button"
                    >
                      <Camera className="w-5 h-5 mr-2" />
                      Capture Photo
                    </Button>
                  </div>
                  

                  
                  {/* Camera status */}
                  {isCameraActive && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-green-800 font-medium">Camera Active</span>
                      </div>
                      <p className="text-green-700 text-sm mt-1">
                        Camera is ready. Position the vehicle and tap "Capture Photo".
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="relative">
                    <img 
                      src={registrationPhoto} 
                      alt="Registration Plate" 
                      className="w-full h-80 object-cover rounded-lg border-2 border-gray-200"
                    />
                    
                    {/* Photo captured overlay */}
                    <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      ✓ Photo Captured
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
                    <Button onClick={() => {
                      setRegistrationPhoto('');
                      setIsCameraActive(false);
                    }} variant="outline" className="flex-1 h-14 sm:h-12 text-base font-medium">
                      <Camera className="w-5 h-5 mr-2" />
                      Retake Photo
                    </Button>
                    <Button 
                      onClick={() => setCurrentStep('mileage')} 
                      variant="default" 
                      className="flex-1 h-14 sm:h-12 text-base font-medium"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Photo OK
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 'mileage':
        return (
          <Card className="w-full shadow-sm border-0 mobile-card">
            <CardHeader className="pb-4">
                          <CardTitle className="text-lg sm:text-xl">Current Mileage</CardTitle>
            <CardDescription className="text-sm sm:text-base">
                Enter the current mileage reading from the vehicle
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="space-y-3">
                <Label htmlFor="mileage" className="text-base font-medium">Mileage (miles)</Label>
                <Input
                  id="mileage"
                  type="number"
                  value={mileage}
                  onChange={(e) => setMileage(e.target.value)}
                  placeholder="Enter current mileage"
                  className="h-14 sm:h-12 text-base mobile-touch-target"
                  inputMode="numeric"
                />
              </div>
              
              {/* Mileage Guidance */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-start space-x-2">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2">
                    <h4 className="font-medium text-blue-900 text-sm">How to find the mileage:</h4>
                    <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
                      <li>• Look at the odometer on the dashboard</li>
                      <li>• It's usually displayed prominently near the speedometer</li>
                      <li>• Enter the total miles shown (not trip miles)</li>
                      <li>• If unsure, check the vehicle's service book</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 'questions':
        const question = getCurrentQuestion();
        return (
          <Card className="w-full shadow-sm border-0 mobile-card">
            <CardHeader className="pb-3 sm:pb-4">
                          <CardTitle className="text-lg sm:text-xl">Vehicle Check Questions</CardTitle>
            <CardDescription className="text-sm sm:text-base">
                Question {currentQuestionIndex + 1} of {questions.length}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="space-y-3 sm:space-y-4">
                {/* Category Header */}
                <div className="bg-blue-50 rounded-lg p-2 sm:p-3 border border-blue-200">
                  <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
                      <Badge variant="outline" className="text-xs sm:text-sm font-semibold bg-blue-100 text-blue-800 border-blue-300 w-fit">
                        {getCategoryDisplayName(question.category)}
                  </Badge>
                  {question.is_critical && (
                        <Badge variant="destructive" className="text-xs sm:text-sm w-fit">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Critical
                    </Badge>
                  )}
                    </div>
                    <div className="text-xs sm:text-sm text-blue-600 font-medium">
                      Step {currentQuestionIndex + 1} of {questions.length}
                    </div>
                  </div>
                  <div className="mt-2 text-xs sm:text-sm text-blue-700 leading-relaxed">
                    {getCategoryDescription(question.category)}
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <h3 className="text-lg sm:text-xl font-semibold leading-relaxed text-foreground flex-1">{question.question}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleInfoClick(question.id)}
                    className={`flex-shrink-0 p-2 h-auto rounded-full transition-colors duration-200 ${
                      question.is_critical 
                        ? 'text-red-600 hover:text-red-800 hover:bg-red-50' 
                        : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
                    }`}
                    title="Get inspection guidance"
                  >
                    <Info className={`w-5 h-5 ${question.is_critical ? 'animate-pulse' : ''}`} />
                  </Button>
                </div>
                
                {/* Inspection Flow Indicator */}
                {question.category === 'exterior' && (
                  <div className="bg-blue-50 rounded-lg p-2 sm:p-3 border border-blue-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Car className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Inspection Flow</span>
                    </div>
                    <div className="text-xs text-blue-700 space-y-2">
                      <div className="flex items-start space-x-2">
                        <span className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                        <span className="leading-relaxed">Front of Vehicle (Left to Right)</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                        <span className="leading-relaxed">Nearside (Passenger Side)</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                        <span className="leading-relaxed">Rear of Vehicle</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</span>
                        <span className="leading-relaxed">Offside (Driver's Side)</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">5</span>
                        <span className="leading-relaxed">Inside Cab & Safety Equipment</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {question.question_type === 'yes_no' && (
                  <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
                    <Button
                      variant={answers[question.id] === true ? "default" : "outline"}
                      onClick={() => handleAnswer(question.id, true)}
                      className="flex-1 h-14 sm:h-12 text-base font-medium mobile-button"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Yes
                    </Button>
                    <Button
                      variant={answers[question.id] === false ? "default" : "outline"}
                      onClick={() => handleAnswer(question.id, false)}
                      className="flex-1 h-14 sm:h-12 text-base font-medium mobile-button"
                    >
                      <XCircle className="w-5 h-5 mr-2" />
                      No
                    </Button>
                  </div>
                )}
                
                {question.question_type === 'number' && (
                  <Input
                    type="number"
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswer(question.id, e.target.value)}
                    placeholder="Enter value"
                    className="h-14 sm:h-12 text-base mobile-touch-target"
                    inputMode="numeric"
                  />
                )}
                
                {question.question_type === 'text' && (
                  <Textarea
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswer(question.id, e.target.value)}
                    placeholder="Enter your answer"
                    rows={3}
                    className="text-base resize-none mobile-touch-target"
                  />
                )}
              </div>
              
              {isGpsTracking && (
                <div className="bg-green-50 rounded-lg p-2 sm:p-3 border border-green-200">
                  <div className="flex items-center space-x-2">
                    <Navigation className="w-4 h-4 text-green-600" />
                    <span className="text-green-800 font-medium text-sm sm:text-base">GPS Tracking Active</span>
                  </div>
                  <p className="text-green-700 text-xs sm:text-sm mt-1">
                    Location is being tracked: {gpsTrack.length} points recorded
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 'signature':
        return (
          <Card className="w-full shadow-sm border-0 mobile-card">
            <CardHeader className="pb-4">
                          <CardTitle className="text-lg sm:text-xl">Driver Signature</CardTitle>
            <CardDescription className="text-sm sm:text-base">
                Sign to confirm the vehicle check is complete and accurate
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="space-y-3">
                <Label className="text-base font-medium">Signature</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 sm:p-4">
                  <canvas
                    ref={signatureCanvasRef}
                    width={400}
                    height={200}
                    className="w-full h-40 sm:h-48 lg:h-56 border rounded-lg cursor-crosshair bg-white touch-none mobile-touch-target"
                    style={{ border: '1px solid #e5e7eb' }}
                  />
                </div>
                <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
                  <Button onClick={clearSignature} variant="outline" size="sm" className="text-sm w-fit mobile-button">
                    Clear Signature
                  </Button>
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    Tap and drag to sign, or use your finger on mobile
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <Label htmlFor="notes" className="text-base font-medium">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional observations or notes..."
                  rows={3}
                  className="text-base resize-none"
                />
              </div>
              
              {/* Submit Button */}
              <div className="pt-4 border-t">
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting || !signature} 
                  className="w-full h-12 text-base"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Complete Vehicle Check
                    </>
                  )}
                </Button>
                {!signature && (
                  <p className="text-sm text-muted-foreground mt-2 text-center">
                    Please provide your signature to complete the check
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        );

      case 'review':
        return (
          <Card className="w-full shadow-sm border-0 mobile-card">
            <CardHeader className="pb-4">
                          <CardTitle className="text-lg sm:text-xl">Review Vehicle Check</CardTitle>
            <CardDescription className="text-sm sm:text-base">
                Review all information before submitting
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6">
              <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-base font-medium">Reference Number</Label>
                  <p className="font-mono text-lg font-bold">{referenceNumber}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-base font-medium">Vehicle</Label>
                  <p className="text-base">{availableVehicles.find(v => v.id === selectedVehicle)?.vehicle_number} - {availableVehicles.find(v => v.id === selectedVehicle)?.license_plate}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-base font-medium">Mileage</Label>
                  <p className="text-base">{mileage} miles</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-base font-medium">GPS Points</Label>
                  <p className="text-base">{gpsTrack.length} locations tracked</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <Label className="text-base font-medium">Registration Photo</Label>
                {registrationPhoto && (
                  <div className="border rounded-lg p-2">
                    <img 
                      src={registrationPhoto} 
                      alt="Registration Plate" 
                      className="w-48 h-36 object-cover rounded border"
                    />
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <Label className="text-base font-medium">Answers Summary</Label>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {questions.map((question) => (
                    <div key={question.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                      <span className="text-sm flex-1 mr-4">{question.question}</span>
                      <Badge variant={answers[question.id] ? "default" : "secondary"} className="text-xs">
                        {answers[question.id] ? "Answered" : "Not Answered"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
              
              {signature && (
                <div className="space-y-3">
                  <Label className="text-base font-medium">Signature</Label>
                  <div className="border rounded-lg p-2">
                    <img 
                      src={signature} 
                      alt="Driver Signature" 
                      className="w-48 h-24 object-contain border rounded"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-screen bg-background relative">
      {/* Scrollable Content Area */}
      <div className="h-full overflow-y-auto pb-20 sm:pb-16">
        <div className="space-y-3 p-3 sm:space-y-4 sm:p-4 lg:space-y-6 lg:p-6 max-w-4xl mx-auto">
      {/* Header */}
          <div className="bg-card rounded-lg p-3 sm:p-4 shadow-sm border border-border mobile-card">
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex-1">
                <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold tracking-tight text-foreground">Enhanced Vehicle Check</h1>
                <p className="text-muted-foreground text-xs sm:text-sm lg:text-base mt-1">
            Complete vehicle inspection with GPS tracking and photo capture
          </p>
        </div>
              <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
                <Badge variant="outline" className="text-xs w-fit">
            <Clock className="w-3 h-3 mr-1" />
            {new Date().toLocaleTimeString()}
          </Badge>
                <Badge variant="outline" className="text-xs w-fit">
            <User className="w-3 h-3 mr-1" />
                  {profile?.first_name && profile?.last_name ? `${profile.first_name} ${profile.last_name}` : profile?.email}
          </Badge>
              </div>
        </div>
      </div>

      {/* Progress Bar */}
          <div className="bg-card rounded-lg p-3 sm:p-4 shadow-sm border border-border space-y-3 mobile-card">
            <div className="flex items-center justify-between text-xs sm:text-sm">
                              <span className="font-medium text-foreground">Progress</span>
              <span className="text-muted-foreground font-semibold">{Math.round(getStepProgress())}%</span>
        </div>
            <Progress value={getStepProgress()} className="w-full h-2 sm:h-3" />
            
            {/* Step Indicator */}
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-2">
                  <span className="font-medium text-foreground text-xs sm:text-sm">Current Step:</span>
                  <Badge variant="outline" className="text-xs w-fit">
                    {currentStep === 'vehicle-selection' && 'Vehicle Selection'}
                    {currentStep === 'registration-photo' && 'Registration Photo'}
                    {currentStep === 'mileage' && 'Mileage Entry'}
                    {currentStep === 'questions' && 'Vehicle Inspection'}
                    {currentStep === 'signature' && 'Driver Signature'}
                    {currentStep === 'review' && 'Review & Submit'}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground font-medium">
                  {currentStep === 'questions' && `Question ${currentQuestionIndex + 1} of ${questions.length}`}
                  {currentStep !== 'questions' && 'Step Complete'}
                </div>
              </div>
              {currentStep === 'questions' && (
                <div className="mt-2 text-xs text-blue-700 leading-relaxed">
                  {getCategoryDescription(getCurrentQuestion()?.category || '')}
                </div>
              )}
            </div>
      </div>

      {/* Step Content */}
          <div>
        {renderStepContent()}
          </div>

      {/* Navigation Bar - Now part of scrollable content, positioned at bottom */}
              <div className="bg-card rounded-lg p-3 sm:p-4 shadow-sm border border-border mobile-card">
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 'vehicle-selection'}
              className="flex-1 sm:flex-none h-12 text-sm sm:text-base mobile-button"
          >
              <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">Back</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={resetCheck}
              className="flex-1 sm:flex-none h-12 text-sm sm:text-base mobile-button"
          >
              <RotateCcw className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Reset</span>
              <span className="sm:hidden">Reset</span>
          </Button>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          {currentStep === 'review' ? (
              <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full sm:w-auto h-12 text-sm sm:text-base mobile-button">
                <Save className="w-4 h-4 mr-1 sm:mr-2" />
              {isSubmitting ? 'Submitting...' : 'Complete Check'}
            </Button>
          ) : currentStep === 'signature' ? (
            <div className="w-full sm:w-auto">
              {/* Submit button is now inside the signature step */}
            </div>
          ) : (
              <Button onClick={handleNext} className="w-full sm:w-auto h-12 text-sm sm:text-base mobile-button">
                <ArrowRight className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Next</span>
                <span className="sm:hidden">Next</span>
            </Button>
          )}
          </div>
        </div>
      </div>
        </div>
      </div>

      {/* Information Modal */}
      <Dialog open={infoModalOpen} onOpenChange={setInfoModalOpen}>
        <DialogContent className="w-[95vw] max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl max-h-[85vh] overflow-y-auto mobile-card">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-base sm:text-lg">
              <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              <span>Inspection Guidance</span>
              {getCurrentQuestion()?.is_critical && (
                <Badge variant="destructive" className="ml-2 text-xs">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Critical
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              Detailed instructions for this inspection item
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 sm:space-y-4">
            <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">What to Check:</h4>
              <p className="text-blue-800 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                {currentQuestionInfo}
              </p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-3 sm:p-4 border border-yellow-200">
              <h4 className="font-semibold text-yellow-900 mb-2 text-sm sm:text-base">💡 Tips:</h4>
              <ul className="text-yellow-800 space-y-1 text-xs sm:text-sm">
                <li>• Take your time to inspect thoroughly</li>
                <li>• If in doubt, mark as "No" and report the issue</li>
                <li>• Use a flashlight if needed for better visibility</li>
                <li>• Check from multiple angles when possible</li>
                <li>• Don't skip any items - each is important for safety</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      {checkSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <span>Vehicle Check Completed!</span>
              </CardTitle>
              <CardDescription>
                Your vehicle check has been successfully submitted
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">Reference Number</h3>
                <p className="font-mono text-lg text-green-700">{checkSession.reference_number}</p>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Vehicle</Label>
                  <p>{checkSession.vehicle_number} - {checkSession.license_plate}</p>
                </div>
                <div>
                  <Label>Mileage</Label>
                  <p>{checkSession.mileage} miles</p>
                </div>
                <div>
                  <Label>GPS Points</Label>
                  <p>{checkSession.gps_track.length} locations</p>
                </div>
                <div>
                  <Label>Questions Answered</Label>
                  <p>{Object.keys(checkSession.answers).length} of {questions.length}</p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Download Report
                </Button>
                <Button variant="outline" className="flex-1">
                  <FileText className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EnhancedVehicleCheck;
