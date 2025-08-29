import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Car, 
  Calendar, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  User,
  FileText,
  Smartphone,
  AlertCircle,
  Map,
  Satellite,
  Gauge,
  Fuel,
  Droplets,
  Wrench,
  Shield,
  Eye,
  Lightbulb,
  Volume2,
  Settings,
  Circle,
  Zap,
  Activity
} from 'lucide-react';
import { format } from 'date-fns';

interface InspectionItem {
  id: string;
  name: string;
  status: 'pass' | 'fail' | 'note';
  category?: string;
  note?: string;
  issueId?: string;
  value?: string;
}

interface WalkAroundCheck {
  id: string;
  vehicleId: string;
  vehicleNumber: string;
  vehicleName: string;
  vehicleYear: string;
  vehicleMake: string;
  vehicleModel: string;
  inspectionForm: string;
  startedAt: string;
  submittedAt: string;
  duration: string;
  submissionSource: string;
  submittedBy: {
    id: string;
    name: string;
    initials: string;
    avatar?: string;
  };
  location: {
    address: string;
    latitude: number;
    longitude: number;
    warning?: string;
  };
  odometerReading: number;
  fuelLevel: string;
  oilLife: number;
  inspectionItems: InspectionItem[];
  vehicleCondition: 'excellent' | 'good' | 'fair' | 'poor';
  driverSignature: string;
  notes: string;
}

const WalkAroundCheckDetail: React.FC = () => {
  const { checkId } = useParams<{ checkId: string }>();
  const navigate = useNavigate();
  const [check, setCheck] = useState<WalkAroundCheck | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockCheck: WalkAroundCheck = {
      id: checkId || '1',
      vehicleId: 'v1',
      vehicleNumber: '1100',
      vehicleName: '2018 Toyota Prius',
      vehicleYear: '2018',
      vehicleMake: 'Toyota',
      vehicleModel: 'Prius',
      inspectionForm: 'Daily Pre-Trip Inspection',
      startedAt: '2025-08-21T15:20:00Z',
      submittedAt: '2025-08-21T15:37:00Z',
      duration: '17m',
      submissionSource: 'Fleetio Go',
      submittedBy: {
        id: 'driver-1',
        name: 'kenny laing',
        initials: 'KL',
        avatar: undefined
      },
      location: {
        address: 'Chicago, IL',
        latitude: 41.8781,
        longitude: -87.6298,
        warning: '3 of the inspection items were completed more than 100 meters away from the center of the inspection location.'
      },
      odometerReading: 20690,
      fuelLevel: 'Full',
      oilLife: 50,
      inspectionItems: [
        // Front of Vehicle (Questions 1-8)
        { id: '1', name: 'Fuel, oil, or fluid leaks under vehicle', status: 'pass', category: 'exterior' },
        { id: '2', name: 'Windscreen clean and free from cracks/damage', status: 'pass', category: 'exterior' },
        { id: '3', name: 'Windscreen wipers and washers working', status: 'fail', category: 'exterior', issueId: '6', note: 'Wipers need replacement' },
        { id: '4', name: 'Headlights (main/dip) working and lenses clean', status: 'pass', category: 'lights' },
        { id: '5', name: 'Front indicators including side repeaters working', status: 'pass', category: 'lights' },
        { id: '6', name: 'Horn working clearly', status: 'pass', category: 'general' },
        { id: '7', name: 'Mirrors fitted, secure, adjusted, and not cracked', status: 'pass', category: 'exterior' },
        { id: '8', name: 'Front registration plate present, clean, and secure', status: 'pass', category: 'exterior' },
        
        // Nearside/Passenger Side (Questions 9-13)
        { id: '9', name: 'Tyres in good condition with adequate tread depth', status: 'pass', category: 'tires' },
        { id: '10', name: 'Wheel nuts secure with no cracks or missing nuts', status: 'pass', category: 'tires' },
        { id: '11', name: 'Mudguards and spray suppression devices fitted', status: 'pass', category: 'exterior' },
        { id: '12', name: 'Bodywork free from damage, sharp edges, or corrosion', status: 'pass', category: 'exterior' },
        { id: '13', name: 'All reflectors on nearside clean, secure, and positioned', status: 'pass', category: 'lights' },
        
        // Rear of Vehicle (Questions 14-20)
        { id: '14', name: 'All rear lights (brake, tail, indicators) working', status: 'pass', category: 'lights' },
        { id: '15', name: 'Number plate light working and illuminating plate', status: 'pass', category: 'lights' },
        { id: '16', name: 'Rear registration plate clean, secure, and visible', status: 'pass', category: 'exterior' },
        { id: '17', name: 'Rear reflectors clean, secure, and positioned', status: 'pass', category: 'lights' },
        { id: '18', name: 'Tail lift operates smoothly and locks securely', status: 'pass', category: 'general' },
        { id: '19', name: 'Under-run protection bars securely attached', status: 'pass', category: 'exterior' },
        { id: '20', name: 'Rear doors/tailgate operate correctly', status: 'pass', category: 'general' },
        
        // Offside/Driver\'s Side (Questions 21-24)
        { id: '21', name: 'Driver\'s side tyres in good condition', status: 'pass', category: 'tires' },
        { id: '22', name: 'Exhaust system secure and not leaking', status: 'pass', category: 'engine' },
        { id: '23', name: 'Side marker lamps working correctly', status: 'pass', category: 'lights' },
        { id: '24', name: 'Fuel filler cap secure and not leaking', status: 'pass', category: 'fuel' },
        
        // Inside Cab (Questions 25-33)
        { id: '25', name: 'Driver\'s seat and seat belts secure and functioning', status: 'pass', category: 'interior' },
        { id: '26', name: 'Steering wheel secure with no excessive play', status: 'pass', category: 'interior' },
        { id: '27', name: 'Brakes working with firm pedal feel', status: 'pass', category: 'brakes' },
        { id: '28', name: 'All dashboard warning lights functioning', status: 'pass', category: 'interior' },
        { id: '29', name: 'Tachograph working and properly calibrated', status: 'pass', category: 'interior' },
        { id: '30', name: 'Odometer functioning and speed limiter working', status: 'pass', category: 'interior', value: '20690' },
        { id: '31', name: 'Handbrake/parking brake holds vehicle securely', status: 'pass', category: 'brakes' },
        { id: '32', name: 'Heating and ventilation systems working', status: 'pass', category: 'interior' },
        { id: '33', name: 'Saloon lighting and flooring safe and secure', status: 'pass', category: 'interior' },
        
        // Safety Equipment (Questions 34-42)
        { id: '34', name: 'Fire extinguisher present, secure, and in date', status: 'pass', category: 'safety' },
        { id: '35', name: 'First aid kit present, stocked, and in date', status: 'pass', category: 'safety' },
        { id: '36', name: 'All passenger doors open/close properly', status: 'pass', category: 'safety' },
        { id: '37', name: 'Emergency hammers present and accessible', status: 'pass', category: 'safety' },
        { id: '38', name: 'Wheelchair ramp/lift operates smoothly', status: 'pass', category: 'safety' },
        { id: '39', name: 'All passenger seat belts working correctly', status: 'pass', category: 'safety' },
        { id: '40', name: 'Accessibility signage fitted and visible', status: 'pass', category: 'safety' },
        { id: '41', name: 'Camera systems working with clear displays', status: 'pass', category: 'general' },
        { id: '42', name: 'Fresnel lens properly positioned and visible', status: 'pass', category: 'general' },
        
        // Load & Trailer (Questions 43-47)
        { id: '43', name: 'Load properly secured with restraints', status: 'pass', category: 'general' },
        { id: '44', name: 'Load height within legal limits', status: 'pass', category: 'general' },
        { id: '45', name: 'Trailer brake lines secure and not leaking', status: 'pass', category: 'brakes' },
        { id: '46', name: 'Trailer coupling secure with electrical connections', status: 'pass', category: 'general' },
        { id: '47', name: 'Trailer landing legs up and secure', status: 'pass', category: 'general' },
        
        // General Equipment (Questions 48-52)
        { id: '48', name: 'AdBlue level adequate and system functioning', status: 'pass', category: 'fuel' },
        { id: '49', name: 'Warning triangles or warning devices accessible', status: 'pass', category: 'safety' },
        { id: '50', name: 'Emergency contact numbers carried and accessible', status: 'pass', category: 'documentation' },
        { id: '51', name: 'Fire suppression system operating correctly', status: 'pass', category: 'safety' },
        { id: '52', name: 'Cab clean and free from loose hazardous items', status: 'pass', category: 'general' },
        
        // Final Check (Questions 53-54)
        { id: '53', name: 'All defects properly documented and reported', status: 'pass', category: 'documentation' },
        { id: '54', name: 'Defects reported to transport manager immediately', status: 'pass', category: 'documentation' },
        
        // Documentation & Driver (Questions 55-56)
        { id: '55', name: 'Current mileage reading', status: 'pass', category: 'documentation', value: '20690' },
        { id: '56', name: 'Driver fit to drive and not under influence', status: 'pass', category: 'driver' }
      ],
      vehicleCondition: 'excellent',
      driverSignature: 'ok',
      notes: 'This must be checked if there are no defects.'
    };

    setTimeout(() => {
      setCheck(mockCheck);
      setLoading(false);
    }, 500);
  }, [checkId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'fail':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'note':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pass':
        return 'Pass';
      case 'fail':
        return 'Fail';
      case 'note':
        return 'Note';
      default:
        return status;
    }
  };

  const getItemIcon = (item: InspectionItem) => {
    // Use category-based icons for better organization
    const categoryIconMap: { [key: string]: React.ReactNode } = {
      'exterior': <Car className="w-4 h-4" />,
      'interior': <Settings className="w-4 h-4" />,
      'engine': <Gauge className="w-4 h-4" />,
      'tires': <Circle className="w-4 h-4" />,
      'lights': <Lightbulb className="w-4 h-4" />,
      'brakes': <Shield className="w-4 h-4" />,
      'fuel': <Fuel className="w-4 h-4" />,
      'safety': <AlertTriangle className="w-4 h-4" />,
      'documentation': <FileText className="w-4 h-4" />,
      'driver': <User className="w-4 h-4" />,
      'general': <Settings className="w-4 h-4" />
    };
    
    // Return category-based icon if available, otherwise fallback to name-based
    if (item.category && categoryIconMap[item.category]) {
      return categoryIconMap[item.category];
    }
    
    // Fallback to name-based icons for specific items
    const nameIconMap: { [key: string]: React.ReactNode } = {
      'Horn': <Volume2 className="w-4 h-4" />,
      'Mirrors': <Eye className="w-4 h-4" />,
      'Windscreen': <Activity className="w-4 h-4" />,
      'Tyres': <Circle className="w-4 h-4" />,
      'Tachograph': <Clock className="w-4 h-4" />,
      'Odometer': <Gauge className="w-4 h-4" />,
      'Fire extinguisher': <Zap className="w-4 h-4" />,
      'First aid kit': <Activity className="w-4 h-4" />,
      'Emergency': <AlertTriangle className="w-4 h-4" />,
      'Registration plate': <FileText className="w-4 h-4" />,
      'Mileage': <Gauge className="w-4 h-4" />
    };
    
    // Check if any name keywords match
    for (const [keyword, icon] of Object.entries(nameIconMap)) {
      if (item.name.toLowerCase().includes(keyword.toLowerCase())) {
        return icon;
      }
    }
    
    return <Settings className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading inspection details...</p>
        </div>
      </div>
    );
  }

  if (error || !check) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Inspection</h2>
          <p className="text-gray-600 mb-4">{error || 'Inspection not found'}</p>
          <Button onClick={() => navigate('/vehicles')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Vehicles
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/vehicles')} className="p-0">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Inspection Details</h1>
              <p className="text-sm text-gray-600">Walk-around check submitted by {check.submittedBy.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">#{check.id}</Badge>
            <Button variant="outline" size="sm">
              <FileText className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Inspection Details and Map */}
          <div className="space-y-6">
            {/* Inspection Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Inspection Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Vehicle Info */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Car className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">
                      {check.vehicleNumber} [{check.vehicleYear} {check.vehicleMake} {check.vehicleModel}]
                    </div>
                    <div className="text-sm text-gray-600">{check.inspectionForm}</div>
                  </div>
                  <Badge variant="secondary">Sample</Badge>
                </div>

                {/* Timestamps */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>Started</span>
                    </div>
                    <div className="font-medium">
                      {format(new Date(check.startedAt), 'EEE, MMM d, yyyy h:mma')}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Submitted</span>
                    </div>
                    <div className="font-medium">
                      {format(new Date(check.submittedAt), 'EEE, MMM d, yyyy h:mma')}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Duration and Source */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600">Duration</div>
                    <div className="font-medium">{check.duration}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Submission Source</div>
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4" />
                      <span className="font-medium">{check.submissionSource}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Submitted By */}
                <div>
                  <div className="text-sm text-gray-600 mb-2">Submitted By</div>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={check.submittedBy.avatar} />
                      <AvatarFallback className="text-xs">
                        {check.submittedBy.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{check.submittedBy.name}</span>
                  </div>
                </div>

                {/* Warning Message */}
                {check.location.warning && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-yellow-800">{check.location.warning}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Map Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Map className="w-5 h-5" />
                  Map
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Map Tabs */}
                  <div className="flex border-b border-gray-200">
                    <button className="px-4 py-2 border-b-2 border-blue-500 text-blue-600 font-medium">
                      Map
                    </button>
                    <button className="px-4 py-2 text-gray-600 hover:text-gray-900">
                      Satellite
                    </button>
                  </div>

                  {/* Map Placeholder */}
                  <div className="h-64 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <Map className="w-12 h-12 mx-auto mb-2" />
                      <p>Interactive Map</p>
                      <p className="text-sm">Location: {check.location.address}</p>
                      <p className="text-xs">Lat: {check.location.latitude}, Lng: {check.location.longitude}</p>
                    </div>
                  </div>

                  {/* Map Markers Info */}
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Inspection Location</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span>Item Locations</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Inspection Items */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Inspection Items
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Odometer and Fuel */}
                <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-600">Odometer:</span>
                    <span className="font-medium">{check.odometerReading.toLocaleString()} mi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Fuel className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-600">Fuel Level:</span>
                    <span className="font-medium">{check.fuelLevel}</span>
                  </div>
                </div>

                {/* Inspection Items List */}
                <div className="space-y-2">
                  {check.inspectionItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3 flex-1">
                        {getItemIcon(item)}
                        <span className="text-sm">{item.name}</span>
                        {item.value && (
                          <span className="text-xs text-gray-500">({item.value})</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(item.status)}
                        <span className={`text-sm font-medium ${
                          item.status === 'pass' ? 'text-green-600' : 
                          item.status === 'fail' ? 'text-red-600' : 'text-yellow-600'
                        }`}>
                          {getStatusText(item.status)}
                        </span>
                        {item.issueId && (
                          <Button variant="link" size="sm" className="p-0 h-auto text-blue-600 underline">
                            Issue #{item.issueId}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Sign-Off Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Vehicle Condition OK</span>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-green-600 capitalize">{check.vehicleCondition}</span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    {check.notes}
                  </div>

                  <Separator />

                  <div>
                    <div className="text-sm text-gray-600 mb-2">Reviewing Driver's Signature</div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="font-mono text-lg">{check.driverSignature}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalkAroundCheckDetail;
