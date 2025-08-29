import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  MessageSquare, 
  Phone, 
  FileText, 
  Clock, 
  AlertCircle, 
  Navigation, 
  Shield,
  Camera,
  Settings,
  HelpCircle
} from 'lucide-react';

interface DriverQuickActionsProps {
  onStartInspection: () => void;
  isMobile: boolean;
  hasVehicle: boolean;
}

const DriverQuickActions: React.FC<DriverQuickActionsProps> = ({ 
  onStartInspection, 
  isMobile, 
  hasVehicle 
}) => {
  const quickActions = [
    {
      id: 'inspection',
      title: 'Vehicle Inspection',
      description: 'Start daily safety check',
      icon: CheckCircle,
      color: 'bg-green-500 hover:bg-green-600',
      onClick: onStartInspection,
      disabled: !hasVehicle
    },
    {
      id: 'incident',
      title: 'Report Incident',
      description: 'Log safety concerns',
      icon: AlertCircle,
      color: 'bg-red-500 hover:bg-red-600',
      onClick: () => console.log('Report incident'),
      disabled: false
    },
    {
      id: 'communication',
      title: 'Contact Dispatch',
      description: 'Speak with coordinator',
      icon: Phone,
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: () => console.log('Contact dispatch'),
      disabled: false
    },
    {
      id: 'documentation',
      title: 'View Documents',
      description: 'Licenses & certifications',
      icon: FileText,
      color: 'bg-purple-500 hover:bg-purple-600',
      onClick: () => console.log('View documents'),
      disabled: false
    },
    {
      id: 'timesheet',
      title: 'Clock In/Out',
      description: 'Manage working hours',
      icon: Clock,
      color: 'bg-indigo-500 hover:bg-indigo-600',
      onClick: () => console.log('Time management'),
      disabled: false
    },
    {
      id: 'navigation',
      title: 'Route Guide',
      description: 'GPS navigation help',
      icon: Navigation,
      color: 'bg-teal-500 hover:bg-teal-600',
      onClick: () => console.log('Route navigation'),
      disabled: false
    }
  ];

  const supportActions = [
    {
      id: 'emergency',
      title: 'Emergency',
      description: 'Immediate assistance',
      icon: Shield,
      color: 'bg-red-600 hover:bg-red-700',
      onClick: () => console.log('Emergency contact'),
      priority: true
    },
    {
      id: 'maintenance',
      title: 'Report Issue',
      description: 'Vehicle problems',
      icon: AlertCircle,
      color: 'bg-orange-500 hover:bg-orange-600',
      onClick: () => console.log('Report maintenance'),
      priority: false
    },
    {
      id: 'help',
      title: 'Help & Support',
      description: 'Get assistance',
      icon: HelpCircle,
      color: 'bg-gray-500 hover:bg-gray-600',
      onClick: () => console.log('Help center'),
      priority: false
    }
  ];

  return (
    <div className="space-y-4">
      {/* Main Quick Actions */}
      <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
        <CardHeader className={isMobile ? 'pb-3' : ''}>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span>Quick Actions</span>
          </CardTitle>
          <CardDescription>Essential daily tasks and tools</CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className={`grid ${isMobile ? 'grid-cols-2 gap-3' : 'grid-cols-3 gap-4'}`}>
            {quickActions.map((action) => (
              <Button
                key={action.id}
                onClick={action.onClick}
                disabled={action.disabled}
                className={`${action.color} text-white h-auto flex flex-col items-center justify-center space-y-2 ${
                  isMobile ? 'p-3' : 'p-4'
                } transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <action.icon className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} />
                <div className="text-center">
                  <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-semibold`}>
                    {action.title}
                  </p>
                  <p className={`${isMobile ? 'text-xs' : 'text-xs'} opacity-90`}>
                    {action.description}
                  </p>
                </div>
              </Button>
            ))}
          </div>

          {!hasVehicle && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <p className="text-sm text-yellow-800">
                  Some actions require vehicle assignment
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Support & Emergency Actions */}
      <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
        <CardHeader className={isMobile ? 'pb-3' : ''}>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-red-500" />
            <span>Support & Safety</span>
          </CardTitle>
          <CardDescription>Emergency contacts and assistance</CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            {supportActions.map((action) => (
              <Button
                key={action.id}
                onClick={action.onClick}
                variant={action.priority ? "default" : "outline"}
                className={`w-full flex items-center justify-start space-x-3 ${
                  isMobile ? 'h-12' : 'h-14'
                } ${action.priority ? action.color : ''}`}
              >
                <action.icon className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} flex-shrink-0`} />
                <div className="text-left flex-1">
                  <p className={`${isMobile ? 'text-sm' : 'text-base'} font-semibold`}>
                    {action.title}
                  </p>
                  <p className={`${isMobile ? 'text-xs' : 'text-sm'} opacity-70`}>
                    {action.description}
                  </p>
                </div>
              </Button>
            ))}
          </div>

          {/* Emergency Information */}
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <Shield className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-800">Emergency Contacts</p>
                <p className="text-xs text-red-600 mt-1">
                  In case of emergency, call 999 first, then notify dispatch
                </p>
                <div className="mt-2 space-y-1 text-xs text-red-700">
                  <p>Dispatch: 0800-DISPATCH</p>
                  <p>Supervisor: 0800-SUPERVISOR</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile-Specific Features */}
      {isMobile && (
        <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <Camera className="w-5 h-5 text-blue-500" />
              <span>Mobile Tools</span>
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-12 flex flex-col items-center justify-center space-y-1">
                <Camera className="w-4 h-4" />
                <span className="text-xs">Scan QR</span>
              </Button>
              <Button variant="outline" className="h-12 flex flex-col items-center justify-center space-y-1">
                <MessageSquare className="w-4 h-4" />
                <span className="text-xs">Messages</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DriverQuickActions;