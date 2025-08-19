import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Navigation,
  User,
  Truck,
  Route
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface InspectionSession {
  id: string;
  driver_id: string;
  vehicle_id: string;
  vehicle_type: string;
  start_time: string;
  end_time?: string;
  start_latitude?: number;
  start_longitude?: number;
  end_latitude?: number;
  end_longitude?: number;
  total_steps: number;
  completed_steps: number;
  distance_traveled?: number;
  inspection_status: string;
  compliance_verified: boolean;
  verification_notes?: string;
  profiles?: {
    first_name: string;
    last_name: string;
  } | null;
  vehicles?: {
    registration_number: string;
    make: string;
    model: string;
  } | null;
}

interface TrackingPoint {
  id: string;
  step_position: number;
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: string;
  step_name?: string;
  notes?: string;
}

const InspectionGPSTracker: React.FC = () => {
  const [sessions, setSessions] = useState<InspectionSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<InspectionSession | null>(null);
  const [trackingPoints, setTrackingPoints] = useState<TrackingPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (profile?.organization_id) {
      fetchInspectionSessions();
    }
  }, [profile?.organization_id]);

  const fetchInspectionSessions = async () => {
    setIsLoading(true);
    try {
      // Mock data (tables don't exist yet)
      setSessions([]);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTrackingPoints = async (sessionId: string) => {
    try {
      // Mock data (tables don't exist yet)
      setTrackingPoints([]);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleSessionSelect = (session: InspectionSession) => {
    setSelectedSession(session);
    fetchTrackingPoints(session.id);
  };

  const verifyCompliance = async (sessionId: string, verified: boolean, notes?: string) => {
    try {
      // Mock update (table doesn't exist yet)
      console.log('Compliance verification would be updated:', { sessionId, verified, notes });

      toast({
        title: "Compliance Updated",
        description: `Inspection ${verified ? 'verified' : 'rejected'} successfully.`,
      });

      // Refresh sessions
      fetchInspectionSessions();
      
      // Update selected session
      if (selectedSession?.id === sessionId) {
        setSelectedSession(prev => prev ? {
          ...prev,
          compliance_verified: verified,
          verification_notes: notes
        } : null);
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const calculateMovementAnalysis = (points: TrackingPoint[]) => {
    if (points.length < 2) {
      return { suspicious: true, reason: 'Insufficient GPS data points' };
    }

    let totalDistance = 0;
    let maxDistance = 0;
    
    for (let i = 1; i < points.length; i++) {
      const distance = calculateDistance(
        points[i-1].latitude, points[i-1].longitude,
        points[i].latitude, points[i].longitude
      );
      totalDistance += distance;
      maxDistance = Math.max(maxDistance, distance);
    }

    // Analysis criteria
    const minExpectedDistance = 15; // Minimum 15m for a proper walk-around
    const maxReasonableStepDistance = 50; // Maximum 50m between steps
    const minSteps = 5; // Minimum number of tracked steps
    
    if (totalDistance < minExpectedDistance) {
      return { 
        suspicious: true, 
        reason: `Total movement (${totalDistance.toFixed(1)}m) below expected minimum (${minExpectedDistance}m)` 
      };
    }

    if (maxDistance > maxReasonableStepDistance) {
      return { 
        suspicious: true, 
        reason: `Large gap detected (${maxDistance.toFixed(1)}m) between inspection steps` 
      };
    }

    if (points.length < minSteps) {
      return { 
        suspicious: true, 
        reason: `Only ${points.length} GPS points recorded (expected ${minSteps}+)` 
      };
    }

    return { 
      suspicious: false, 
      reason: `Movement verified: ${totalDistance.toFixed(1)}m across ${points.length} steps` 
    };
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const duration = Math.floor((end.getTime() - start.getTime()) / 1000 / 60);
    return `${duration} minutes`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Loading inspection data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">GPS Inspection Tracking</h2>
          <p className="text-muted-foreground">
            Monitor and verify driver walk-around inspections with GPS compliance
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sessions List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Recent Inspections
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sessions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No inspection sessions found
              </p>
            ) : (
              sessions.map((session) => {
                const movementAnalysis = trackingPoints.length > 0 && selectedSession?.id === session.id
                  ? calculateMovementAnalysis(trackingPoints)
                  : null;

                return (
                  <div
                    key={session.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                      selectedSession?.id === session.id ? 'bg-primary/5 border-primary' : ''
                    }`}
                    onClick={() => handleSessionSelect(session)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">
                            {session.profiles?.first_name} {session.profiles?.last_name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Truck className="w-4 h-4" />
                          <span>
                            {session.vehicles?.registration_number} - {session.vehicle_type}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(session.start_time).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant={
                          session.compliance_verified 
                            ? 'default' 
                            : session.inspection_status === 'completed' 
                              ? 'secondary' 
                              : 'outline'
                        }>
                          {session.compliance_verified 
                            ? 'Verified' 
                            : session.inspection_status}
                        </Badge>
                        {movementAnalysis && (
                          <Badge variant={movementAnalysis.suspicious ? 'destructive' : 'default'}>
                            {movementAnalysis.suspicious ? 'Suspicious' : 'Valid'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Session Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Route className="w-5 h-5" />
              Inspection Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedSession ? (
              <p className="text-muted-foreground text-center py-8">
                Select an inspection to view GPS tracking details
              </p>
            ) : (
              <div className="space-y-4">
                {/* Session Overview */}
                <div className="grid grid-cols-2 gap-4 p-3 bg-muted/30 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Duration</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDuration(selectedSession.start_time, selectedSession.end_time)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Progress</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedSession.completed_steps}/{selectedSession.total_steps} steps
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Distance</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedSession.distance_traveled 
                        ? `${selectedSession.distance_traveled.toFixed(1)}m` 
                        : 'Not recorded'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">GPS Points</p>
                    <p className="text-sm text-muted-foreground">
                      {trackingPoints.length} recorded
                    </p>
                  </div>
                </div>

                {/* Movement Analysis */}
                {trackingPoints.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium">Movement Analysis</h4>
                    {(() => {
                      const analysis = calculateMovementAnalysis(trackingPoints);
                      return (
                        <div className={`p-3 rounded-lg border ${
                          analysis.suspicious 
                            ? 'bg-red-50 border-red-200' 
                            : 'bg-green-50 border-green-200'
                        }`}>
                          <div className="flex items-start gap-2">
                            {analysis.suspicious ? (
                              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                            ) : (
                              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                            )}
                            <div>
                              <p className={`font-medium ${
                                analysis.suspicious ? 'text-red-800' : 'text-green-800'
                              }`}>
                                {analysis.suspicious ? 'Suspicious Movement' : 'Movement Verified'}
                              </p>
                              <p className={`text-sm ${
                                analysis.suspicious ? 'text-red-700' : 'text-green-700'
                              }`}>
                                {analysis.reason}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* GPS Tracking Points */}
                {trackingPoints.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium">GPS Tracking Points</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {trackingPoints.map((point, index) => (
                        <div key={point.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="w-8 h-8 rounded-full p-0 flex items-center justify-center">
                              {point.step_position}
                            </Badge>
                            <div>
                              <p className="text-sm font-medium">{point.step_name || `Step ${point.step_position}`}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(point.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">
                              {point.latitude.toFixed(6)}, {point.longitude.toFixed(6)}
                            </p>
                            {point.accuracy && (
                              <p className="text-xs text-muted-foreground">±{point.accuracy.toFixed(0)}m</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Compliance Actions */}
                {selectedSession.inspection_status === 'completed' && !selectedSession.compliance_verified && (
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      size="sm"
                      onClick={() => verifyCompliance(selectedSession.id, true, 'GPS movement verified - inspection appears legitimate')}
                      className="flex-1"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Verify Compliance
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => verifyCompliance(selectedSession.id, false, 'GPS movement suspicious - requires investigation')}
                      className="flex-1"
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Flag for Review
                    </Button>
                  </div>
                )}

                {selectedSession.compliance_verified && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-800">Compliance Verified</span>
                    </div>
                    {selectedSession.verification_notes && (
                      <p className="text-sm text-green-700 mt-1">
                        {selectedSession.verification_notes}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InspectionGPSTracker;