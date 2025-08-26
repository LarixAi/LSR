import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import BackNavigation from '@/components/BackNavigation';
import { 
  MapPin, 
  Shield, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Settings
} from 'lucide-react';

interface LocationConsent {
  id: string;
  purpose: string;
  description: string;
  isEnabled: boolean;
  lastUpdated: Date;
  expiresAt?: Date;
  dataRetention: string;
}

const LocationConsent: React.FC = () => {
  const [consents, setConsents] = useState<LocationConsent[]>([
    {
      id: 'transport-tracking',
      purpose: 'Transport Management',
      description: 'Real-time location tracking for route optimization and safety monitoring',
      isEnabled: false,
      lastUpdated: new Date(),
      dataRetention: '12 months'
    },
    {
      id: 'safety-monitoring',
      purpose: 'Safety & Emergency',
      description: 'Location data for emergency response and accident investigation',
      isEnabled: false,
      lastUpdated: new Date(),
      dataRetention: '10 years (regulatory requirement)'
    },
    {
      id: 'route-optimization',
      purpose: 'Route Optimization',
      description: 'Historical location data for improving transport efficiency',
      isEnabled: false,
      lastUpdated: new Date(),
      dataRetention: '6 months'
    }
  ]);

  const [showSettings, setShowSettings] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const handleConsentChange = (id: string, enabled: boolean) => {
    setConsents(prev => prev.map(consent => 
      consent.id === id 
        ? { ...consent, isEnabled: enabled, lastUpdated: new Date() }
        : consent
    ));
  };

  const enableAllConsents = () => {
    setConsents(prev => prev.map(consent => ({
      ...consent,
      isEnabled: true,
      lastUpdated: new Date()
    })));
  };

  const disableAllConsents = () => {
    setConsents(prev => prev.map(consent => ({
      ...consent,
      isEnabled: false,
      lastUpdated: new Date()
    })));
  };

  const getStatusColor = (enabled: boolean) => {
    return enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getStatusIcon = (enabled: boolean) => {
    return enabled ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />;
  };

  const enabledCount = consents.filter(c => c.isEnabled).length;
  const totalCount = consents.length;

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.02]">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="black" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      <BackNavigation title="Location Services" />
      
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 mb-4">
          <MapPin className="w-5 h-5 text-gray-700" />
          <span className="text-sm font-medium text-gray-700">Location Services</span>
        </div>
        <h2 className="text-3xl font-bold text-black mb-3">Location Services Consent</h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-4">
          Take control of your location data. Manage your consent for GPS tracking and related services 
          to ensure your privacy while maintaining transport functionality.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Badge className="bg-gray-100 text-gray-800 px-3 py-1">
            {enabledCount} of {totalCount} services enabled
          </Badge>
          <Badge className="bg-gray-100 text-gray-800 px-3 py-1">
            Real-time Control
          </Badge>
        </div>
      </div>

      {/* Consent Overview */}
      <Card className="border border-gray-200 shadow-lg bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-black">
            <MapPin className="w-6 h-6" />
            Location Services Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-6 bg-gray-100 rounded-xl shadow-sm">
              <div className="text-3xl font-bold text-gray-700 mb-2">{enabledCount}</div>
              <div className="text-sm font-medium text-gray-600">Active Services</div>
              <div className="text-xs text-gray-500 mt-1">Currently enabled</div>
            </div>
            <div className="p-6 bg-gray-100 rounded-xl shadow-sm">
              <div className="text-3xl font-bold text-gray-700 mb-2">12 months</div>
              <div className="text-sm font-medium text-gray-600">Max Retention</div>
              <div className="text-xs text-gray-500 mt-1">Auto-deletion</div>
            </div>
            <div className="p-6 bg-gray-100 rounded-xl shadow-sm">
              <div className="text-3xl font-bold text-gray-700 mb-2">Real-time</div>
              <div className="text-sm font-medium text-gray-600">Update Frequency</div>
              <div className="text-xs text-gray-500 mt-1">30-second intervals</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Consent Items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Location Services</h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowInfo(true)}
              className="flex items-center gap-2"
            >
              <Info className="w-4 h-4" />
              Learn More
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Button>
          </div>
        </div>

        {consents.map((consent) => (
          <Card key={consent.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className="text-lg">{consent.purpose}</CardTitle>
                    <Badge className={getStatusColor(consent.isEnabled)}>
                      {consent.isEnabled ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{consent.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Retention: {consent.dataRetention}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      <span>Last updated: {consent.lastUpdated.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusIcon(consent.isEnabled)}
                  <Switch
                    checked={consent.isEnabled}
                    onCheckedChange={(checked) => handleConsentChange(consent.id, checked)}
                  />
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Bulk Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Bulk Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={enableAllConsents}
              className="flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Enable All Services
            </Button>
            <Button
              variant="outline"
              onClick={disableAllConsents}
              className="flex items-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              Disable All Services
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Privacy & Data Protection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Your Rights</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Withdraw consent at any time</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Request deletion of location data</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Access your location history</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Object to location processing</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Data Protection</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span>Encrypted location data</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span>Access controls in place</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span>Automatic data deletion</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <span>Purpose limitation enforced</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Information Dialog */}
      <Dialog open={showInfo} onOpenChange={setShowInfo}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Location Services Information</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Why We Use Location Data</h4>
              <p className="text-sm text-gray-600 mb-3">
                Location tracking helps us provide safe and efficient transport services. 
                We use this data for:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span><strong>Route Optimization:</strong> Find the most efficient routes and reduce travel time</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span><strong>Safety Monitoring:</strong> Ensure drivers follow safe practices and respond to emergencies</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span><strong>Customer Service:</strong> Provide accurate arrival times and real-time updates</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span><strong>Compliance:</strong> Meet regulatory requirements for transport safety</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Data Protection Measures</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span>Location data is encrypted in transit and at rest</span>
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span>Access is restricted to authorized personnel only</span>
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span>Data is automatically deleted after retention periods</span>
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span>We never sell or share location data with third parties</span>
                </li>
              </ul>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <span className="font-semibold text-yellow-800">Important</span>
              </div>
              <p className="text-sm text-yellow-700">
                You can withdraw your consent at any time. Disabling location services may affect 
                the functionality of transport features and safety monitoring.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Location Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Update Frequency</h4>
              <p className="text-sm text-gray-600 mb-3">
                Choose how often your location is updated:
              </p>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="radio" name="frequency" value="realtime" defaultChecked />
                  <span className="text-sm">Real-time (every 30 seconds)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="frequency" value="periodic" />
                  <span className="text-sm">Periodic (every 5 minutes)</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="frequency" value="manual" />
                  <span className="text-sm">Manual updates only</span>
                </label>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Data Retention</h4>
              <p className="text-sm text-gray-600 mb-3">
                Choose how long your location data is retained:
              </p>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="radio" name="retention" value="6months" />
                  <span className="text-sm">6 months</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="retention" value="12months" defaultChecked />
                  <span className="text-sm">12 months</span>
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" name="retention" value="regulatory" />
                  <span className="text-sm">Regulatory requirement (10 years)</span>
                </label>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
        </div>
      </div>
    </div>
  );
};

export default LocationConsent;
