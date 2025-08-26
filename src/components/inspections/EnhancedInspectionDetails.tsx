import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  MapPin, 
  Clock, 
  User, 
  Car,
  Wrench,
  AlertCircle,
  FileText,
  Camera,
  Navigation,
  Thermometer,
  Gauge,
  Fuel,
  CircleDot,
  Lightbulb,
  Shield,
  Bell,
  Send,
  Eye,
  Download
} from 'lucide-react';
import { VehicleInspection } from '@/hooks/useEnhancedVehicleInspections';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface InspectionQuestion {
  id: string;
  question: string;
  category: string;
  answer: 'pass' | 'fail' | 'na';
  notes?: string;
  photo_url?: string;
  timestamp: string;
}

interface GPSData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: string;
  address?: string;
}

interface VehicleData {
  id: string;
  vehicle_number: string;
  make: string;
  model: string;
  license_plate: string;
  year?: number;
  vin?: string;
  fuel_type?: string;
  transmission?: string;
  color?: string;
  mileage?: string;
}

interface DriverData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  license_number?: string;
}

interface EnhancedInspectionDetailsProps {
  inspection: VehicleInspection;
  onClose: () => void;
}

const EnhancedInspectionDetails: React.FC<EnhancedInspectionDetailsProps> = ({ 
  inspection, 
  onClose 
}) => {
  const { profile } = useAuth();
  const { selectedOrganizationId } = useOrganization();
  const queryClient = useQueryClient();
  
  const [questions, setQuestions] = useState<InspectionQuestion[]>([]);
  const [gpsData, setGpsData] = useState<GPSData | null>(null);
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);
  const [driverData, setDriverData] = useState<DriverData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);

  // Fetch detailed inspection data
  useEffect(() => {
    const fetchInspectionDetails = async () => {
      try {
        // Fetch inspection questions from walkaround_data
        if (inspection.walkaround_data) {
          const walkaroundData = inspection.walkaround_data;
          if (walkaroundData.questions) {
            setQuestions(walkaroundData.questions);
          }
        }

        // Fetch GPS data from location_data
        if (inspection.location_data) {
          const locationData = inspection.location_data;
          setGpsData({
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            accuracy: locationData.accuracy || 0,
            timestamp: locationData.timestamp || inspection.start_time,
            address: locationData.address
          });
        }

        // Fetch vehicle details
        if (inspection.vehicle_id) {
          const { data: vehicle } = await supabase
            .from('vehicles')
            .select('*')
            .eq('id', inspection.vehicle_id)
            .single();
          
          if (vehicle) {
            setVehicleData(vehicle);
          }
        }

        // Fetch driver details
        if (inspection.driver_id) {
          const { data: driver } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', inspection.driver_id)
            .single();
          
          if (driver) {
            setDriverData(driver);
          }
        }

      } catch (error) {
        console.error('Error fetching inspection details:', error);
        toast.error('Failed to load inspection details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInspectionDetails();
  }, [inspection]);

  // Alert admin and mechanics about failed inspection
  const alertFailedInspection = useMutation({
    mutationFn: async () => {
      if (!selectedOrganizationId) throw new Error('No organization selected');

      // Create notification for failed inspection
      const notificationData = {
        title: `🚨 Failed Vehicle Inspection Alert`,
        body: `Vehicle ${vehicleData?.vehicle_number} (${vehicleData?.license_plate}) failed inspection on ${format(new Date(inspection.inspection_date), 'MMM dd, yyyy')}. Driver: ${driverData?.first_name} ${driverData?.last_name}. Inspection type: ${inspection.inspection_category.replace('_', ' ')}.`,
        type: 'error',
        priority: 'high',
        category: 'safety',
        channels: ['in_app', 'email'],
        metadata: {
          inspection_id: inspection.id,
          vehicle_id: inspection.vehicle_id,
          driver_id: inspection.driver_id,
          failed_questions: questions.filter(q => q.answer === 'fail').length,
          total_questions: questions.length
        },
        organization_id: selectedOrganizationId,
        sender_id: profile?.id,
        sender_name: `${profile?.first_name} ${profile?.last_name}`,
        sender_role: profile?.role || 'user',
        recipient_role: 'admin' // Send to admin role
      };

      const { error } = await supabase
        .from('notification_messages')
        .insert(notificationData);

      if (error) throw error;

      return true;
    },
    onSuccess: () => {
      toast.success('Alert sent to admin and mechanics');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      toast.error(`Failed to send alert: ${error.message}`);
    }
  });

  const getQuestionIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'engine':
        return <Gauge className="w-4 h-4" />;
      case 'tires':
        return <CircleDot className="w-4 h-4" />;
      case 'lights':
        return <Lightbulb className="w-4 h-4" />;
      case 'brakes':
        return <Shield className="w-4 h-4" />;
      case 'fuel':
        return <Fuel className="w-4 h-4" />;
      case 'temperature':
        return <Thermometer className="w-4 h-4" />;
      case 'navigation':
        return <Navigation className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getAnswerBadge = (answer: string) => {
    switch (answer) {
      case 'pass':
        return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Pass</Badge>;
      case 'fail':
        return <Badge className="bg-red-100 text-red-800 border-red-200"><XCircle className="w-3 h-3 mr-1" />Fail</Badge>;
      case 'na':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">N/A</Badge>;
      default:
        return <Badge variant="secondary">{answer}</Badge>;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'engine':
        return 'text-orange-600 bg-orange-50';
      case 'tires':
        return 'text-blue-600 bg-blue-50';
      case 'lights':
        return 'text-yellow-600 bg-yellow-50';
      case 'brakes':
        return 'text-red-600 bg-red-50';
      case 'fuel':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const failedQuestions = questions.filter(q => q.answer === 'fail');
  const passedQuestions = questions.filter(q => q.answer === 'pass');
  const naQuestions = questions.filter(q => q.answer === 'na');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading inspection details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Status */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inspection Details</h2>
          <p className="text-gray-600 mt-1">
            {vehicleData?.vehicle_number} - {vehicleData?.make} {vehicleData?.model}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {inspection.overall_status === 'failed' && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => alertFailedInspection.mutate()}
              disabled={alertFailedInspection.isPending}
            >
              <Bell className="w-4 h-4 mr-2" />
              {alertFailedInspection.isPending ? 'Sending...' : 'Alert Admin & Mechanics'}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      {/* Status Alert for Failed Inspections */}
      {inspection.overall_status === 'failed' && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-900">Failed Inspection Alert</h3>
                <p className="text-red-700 text-sm">
                  This vehicle failed {failedQuestions.length} out of {questions.length} inspection checks. 
                  Immediate attention required by admin and mechanics.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
              Passed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{passedQuestions.length}</div>
            <p className="text-xs text-gray-600">Checks passed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <XCircle className="w-4 h-4 text-red-600 mr-2" />
              Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{failedQuestions.length}</div>
            <p className="text-xs text-gray-600">Checks failed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Clock className="w-4 h-4 text-gray-600 mr-2" />
              Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inspection.start_time && inspection.end_time ? 
                Math.round((new Date(inspection.end_time).getTime() - new Date(inspection.start_time).getTime()) / 60000) : 
                'N/A'
              }
            </div>
            <p className="text-xs text-gray-600">Minutes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <MapPin className="w-4 h-4 text-blue-600 mr-2" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {gpsData ? `${gpsData.latitude.toFixed(4)}, ${gpsData.longitude.toFixed(4)}` : 'N/A'}
            </div>
            <p className="text-xs text-gray-600">GPS Coordinates</p>
          </CardContent>
        </Card>
      </div>

      {/* Vehicle and Driver Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Car className="w-5 h-5 mr-2" />
              Vehicle Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Vehicle Number:</span>
                <p className="text-gray-600">{vehicleData?.vehicle_number}</p>
              </div>
              <div>
                <span className="font-medium">License Plate:</span>
                <p className="text-gray-600">{vehicleData?.license_plate}</p>
              </div>
              <div>
                <span className="font-medium">Make/Model:</span>
                <p className="text-gray-600">{vehicleData?.make} {vehicleData?.model}</p>
              </div>
              <div>
                <span className="font-medium">Year:</span>
                <p className="text-gray-600">{vehicleData?.year || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium">VIN:</span>
                <p className="text-gray-600">{vehicleData?.vin || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium">Fuel Type:</span>
                <p className="text-gray-600">{vehicleData?.fuel_type || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Driver Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Name:</span>
                <p className="text-gray-600">{driverData?.first_name} {driverData?.last_name}</p>
              </div>
              <div>
                <span className="font-medium">Email:</span>
                <p className="text-gray-600">{driverData?.email}</p>
              </div>
              <div>
                <span className="font-medium">Phone:</span>
                <p className="text-gray-600">{driverData?.phone || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium">License:</span>
                <p className="text-gray-600">{driverData?.license_number || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* GPS Location and Map */}
      {gpsData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Inspection Location
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMap(!showMap)}
              >
                {showMap ? 'Hide Map' : 'Show Map'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Latitude:</span>
                  <p className="text-gray-600">{gpsData.latitude.toFixed(6)}</p>
                </div>
                <div>
                  <span className="font-medium">Longitude:</span>
                  <p className="text-gray-600">{gpsData.longitude.toFixed(6)}</p>
                </div>
                <div>
                  <span className="font-medium">Accuracy:</span>
                  <p className="text-gray-600">{gpsData.accuracy}m</p>
                </div>
              </div>
              
              {gpsData.address && (
                <div>
                  <span className="font-medium">Address:</span>
                  <p className="text-gray-600">{gpsData.address}</p>
                </div>
              )}

              {showMap && (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <iframe
                    width="100%"
                    height="300"
                    frameBorder="0"
                    style={{ border: 0 }}
                    src={`https://www.google.com/maps/embed/v1/view?key=YOUR_GOOGLE_MAPS_API_KEY&center=${gpsData.latitude},${gpsData.longitude}&zoom=15`}
                    allowFullScreen
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inspection Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Inspection Questions & Results
            </div>
            <Badge variant={inspection.overall_status === 'failed' ? 'destructive' : 'default'}>
              {inspection.overall_status.toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {questions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No detailed inspection questions available</p>
            ) : (
              questions.map((question, index) => (
                <div key={question.id || index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3">
                      {getQuestionIcon(question.category)}
                      <div className="flex-1">
                        <h4 className="font-medium">{question.question}</h4>
                        <Badge className={`mt-1 ${getCategoryColor(question.category)}`}>
                          {question.category}
                        </Badge>
                      </div>
                    </div>
                    {getAnswerBadge(question.answer)}
                  </div>
                  
                  {question.notes && (
                    <div className="mt-3 p-3 bg-gray-50 rounded">
                      <p className="text-sm text-gray-700">{question.notes}</p>
                    </div>
                  )}
                  
                  {question.photo_url && (
                    <div className="mt-3">
                      <Button variant="outline" size="sm">
                        <Camera className="w-4 h-4 mr-2" />
                        View Photo
                      </Button>
                    </div>
                  )}
                  
                  <div className="mt-3 text-xs text-gray-500">
                    Timestamp: {format(new Date(question.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Defects Summary */}
      {inspection.defects_found && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center text-red-900">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Defects Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inspection.defects_details?.description && (
                <p className="text-red-800">{inspection.defects_details.description}</p>
              )}
              
              {inspection.defects_details?.items && (
                <ul className="list-disc list-inside space-y-1 text-red-800">
                  {inspection.defects_details.items.map((item: string, index: number) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              )}
              
              <div className="flex space-x-2">
                <Button variant="destructive" size="sm">
                  <Wrench className="w-4 h-4 mr-2" />
                  Create Work Order
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inspection Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Inspection Metadata
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Inspection Date:</span>
              <p className="text-gray-600">{format(new Date(inspection.inspection_date), 'MMM dd, yyyy')}</p>
            </div>
            <div>
              <span className="font-medium">Start Time:</span>
              <p className="text-gray-600">{format(new Date(inspection.start_time), 'HH:mm:ss')}</p>
            </div>
            <div>
              <span className="font-medium">End Time:</span>
              <p className="text-gray-600">{inspection.end_time ? format(new Date(inspection.end_time), 'HH:mm:ss') : 'N/A'}</p>
            </div>
            <div>
              <span className="font-medium">Inspection Type:</span>
              <p className="text-gray-600">{inspection.inspection_category.replace('_', ' ')}</p>
            </div>
            <div>
              <span className="font-medium">Created:</span>
              <p className="text-gray-600">{format(new Date(inspection.created_at), 'MMM dd, yyyy HH:mm:ss')}</p>
            </div>
            <div>
              <span className="font-medium">Last Updated:</span>
              <p className="text-gray-600">{format(new Date(inspection.updated_at), 'MMM dd, yyyy HH:mm:ss')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedInspectionDetails;
