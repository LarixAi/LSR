import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ArrowLeft, 
  Car, 
  Calendar, 
  MapPin, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  User,
  Thermometer,
  Gauge,
  Camera,
  FileText,
  Edit
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface WalkAroundCheck {
  id: string;
  vehicle_id: string;
  driver_id: string;
  driver_name: string;
  check_date: string;
  check_time: string;
  overall_status: 'pass' | 'fail' | 'warning';
  location: string;
  weather_conditions: string;
  mileage: number;
  notes: string;
  defects_found: number;
  photos_taken: number;
  created_at: string;
  check_items: {
    category: string;
    items: {
      name: string;
      status: 'pass' | 'fail' | 'warning';
      notes?: string;
    }[];
  }[];
}

export default function WalkAroundCheckDetail() {
  const { checkId } = useParams<{ checkId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [check, setCheck] = useState<WalkAroundCheck | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (checkId) {
      fetchWalkAroundCheck();
    }
  }, [checkId]);

  const fetchWalkAroundCheck = async () => {
    try {
      setLoading(true);
      // For now, using mock data - replace with actual Supabase query
      const mockCheck: WalkAroundCheck = {
        id: checkId || '1',
        vehicle_id: 'vehicle-1',
        driver_id: 'driver-1',
        driver_name: 'John Smith',
        check_date: '2024-01-28',
        check_time: '08:30',
        overall_status: 'pass',
        location: 'London Depot',
        weather_conditions: 'Clear',
        mileage: 45230,
        notes: 'All systems functioning properly. Minor wear on front tires noted.',
        defects_found: 0,
        photos_taken: 3,
        created_at: '2024-01-28T08:30:00Z',
        check_items: [
          {
            category: 'Exterior',
            items: [
              { name: 'Body Condition', status: 'pass' },
              { name: 'Windows & Mirrors', status: 'pass' },
              { name: 'Lights & Indicators', status: 'pass' },
              { name: 'Tires & Wheels', status: 'warning', notes: 'Front tires showing wear' }
            ]
          },
          {
            category: 'Interior',
            items: [
              { name: 'Dashboard & Controls', status: 'pass' },
              { name: 'Seats & Safety Belts', status: 'pass' },
              { name: 'Emergency Equipment', status: 'pass' }
            ]
          },
          {
            category: 'Engine & Mechanical',
            items: [
              { name: 'Engine Oil Level', status: 'pass' },
              { name: 'Coolant Level', status: 'pass' },
              { name: 'Brake Fluid', status: 'pass' },
              { name: 'Windscreen Washer', status: 'pass' }
            ]
          }
        ]
      };
      
      setCheck(mockCheck);
    } catch (err) {
      setError('Failed to load walk-around check details');
      console.error('Error fetching walk-around check:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'fail':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'fail':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading walk-around check...</p>
        </div>
      </div>
    );
  }

  if (error || !check) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-4 text-lg font-semibold text-gray-900">Error</h2>
          <p className="mt-2 text-gray-600">{error || 'Walk-around check not found'}</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Vehicle
        </Button>
        <div className="flex items-center gap-2">
          {getStatusIcon(check.overall_status)}
          <Badge className={getStatusColor(check.overall_status)}>
            {check.overall_status.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Check Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="w-5 h-5" />
              Walk Around Check Details
            </CardTitle>
            <CardDescription>
              Performed on {format(new Date(check.check_date), 'EEEE, MMMM dd, yyyy')} at {check.check_time}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Driver Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Driver Information
                </h3>
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback>{check.driver_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{check.driver_name}</p>
                    <p className="text-sm text-gray-600">Driver ID: {check.driver_id}</p>
                  </div>
                </div>
              </div>

              {/* Check Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Check Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {check.location}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Weather:</span>
                    <span className="font-medium flex items-center gap-1">
                      <Thermometer className="w-3 h-3" />
                      {check.weather_conditions}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mileage:</span>
                    <span className="font-medium flex items-center gap-1">
                      <Gauge className="w-3 h-3" />
                      {check.mileage.toLocaleString()} mi
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Check Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{check.defects_found}</div>
                <div className="text-sm text-gray-600">Defects Found</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{check.photos_taken}</div>
                <div className="text-sm text-gray-600">Photos Taken</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold capitalize">{check.overall_status}</div>
                <div className="text-sm text-gray-600">Overall Status</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Check Items */}
        <Card>
          <CardHeader>
            <CardTitle>Check Details</CardTitle>
            <CardDescription>
              Detailed breakdown of all checked items
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {check.check_items.map((category, categoryIndex) => (
                <div key={categoryIndex} className="border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-4">{category.category}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {category.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">{item.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className={getStatusColor(item.status)}
                          >
                            {item.status.toUpperCase()}
                          </Badge>
                          {item.notes && (
                            <span className="text-xs text-gray-600 bg-white px-2 py-1 rounded">
                              {item.notes}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Driver Notes */}
        {check.notes && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Driver Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-900">{check.notes}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button variant="outline" className="flex items-center gap-2">
                <Edit className="w-4 h-4" />
                Edit Check
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Camera className="w-4 h-4" />
                View Photos
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Export Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
