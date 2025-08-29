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
      inspectionForm: 'Driver Vehicle Inspection Report (Simple)',
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
        { id: '1', name: 'Interior Cleanliness', status: 'note', note: 'Take a photo of the interior' },
        { id: '2', name: 'Engine', status: 'pass' },
        { id: '3', name: 'Transmission', status: 'pass' },
        { id: '4', name: 'Clutch', status: 'pass' },
        { id: '5', name: 'Steering Mechanism', status: 'pass' },
        { id: '6', name: 'Horn', status: 'pass' },
        { id: '7', name: 'Rear Vision Mirrors', status: 'pass' },
        { id: '8', name: 'Lighting Devices and Reflectors', status: 'pass' },
        { id: '9', name: 'Parking Brake', status: 'pass' },
        { id: '10', name: 'Service Brakes', status: 'pass' },
        { id: '11', name: 'Air Lines/Light Lines', status: 'pass' },
        { id: '12', name: 'Coupling Devices', status: 'pass' },
        { id: '13', name: 'Tires', status: 'pass' },
        { id: '14', name: 'Wheels and Rims', status: 'pass' },
        { id: '15', name: 'Emergency Equipment', status: 'pass' },
        { id: '16', name: 'Windshield and Wipers/Washers', status: 'fail', issueId: '6' },
        { id: '17', name: 'Oil Life Left', status: 'pass', value: '50' },
        { id: '18', name: 'Fuel Level', status: 'pass', value: 'Full' }
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

  const getItemIcon = (itemName: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'Engine': <Settings className="w-4 h-4" />,
      'Transmission': <Settings className="w-4 h-4" />,
      'Clutch': <Settings className="w-4 h-4" />,
      'Steering Mechanism': <Settings className="w-4 h-4" />,
      'Horn': <Volume2 className="w-4 h-4" />,
      'Rear Vision Mirrors': <Eye className="w-4 h-4" />,
      'Lighting Devices and Reflectors': <Lightbulb className="w-4 h-4" />,
      'Parking Brake': <Circle className="w-4 h-4" />,
      'Service Brakes': <Circle className="w-4 h-4" />,
      'Air Lines/Light Lines': <Settings className="w-4 h-4" />,
      'Coupling Devices': <Settings className="w-4 h-4" />,
      'Tires': <Circle className="w-4 h-4" />,
      'Wheels and Rims': <Circle className="w-4 h-4" />,
      'Emergency Equipment': <Zap className="w-4 h-4" />,
      'Windshield and Wipers/Washers': <Activity className="w-4 h-4" />,
      'Oil Life Left': <Droplets className="w-4 h-4" />,
      'Fuel Level': <Fuel className="w-4 h-4" />,
      'Interior Cleanliness': <Shield className="w-4 h-4" />
    };
    return iconMap[itemName] || <Settings className="w-4 h-4" />;
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
                        {getItemIcon(item.name)}
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
