import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  User, 
  Shield, 
  FileText, 
  Fuel, 
  Settings,
  Clock,
  MapPin,
  Bell,
  Download,
  HelpCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const DriverMore: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const moreOptions = [
    {
      id: 'schedule',
      title: 'Schedule',
      description: 'View your work schedule',
      icon: Calendar,
      path: '/driver-schedule',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      id: 'profile',
      title: 'Profile',
      description: 'Manage your account',
      icon: User,
      path: '/profile',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      id: 'compliance',
      title: 'Compliance',
      description: 'License & certifications',
      icon: Shield,
      path: '/driver-compliance',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      id: 'documents',
      title: 'Documents',
      description: 'View your documents',
      icon: FileText,
      path: '/driver/documents',
      color: 'bg-orange-500 hover:bg-orange-600'
    },
    {
      id: 'fuel',
      title: 'Fuel System',
      description: 'Record fuel purchases',
      icon: Fuel,
      path: '/driver/fuel',
      color: 'bg-red-500 hover:bg-red-600'
    },
    {
      id: 'time',
      title: 'Time Management',
      description: 'Clock in/out & timesheets',
      icon: Clock,
      path: '/time-management',
      color: 'bg-indigo-500 hover:bg-indigo-600'
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'App preferences',
      icon: Settings,
      path: '/driver/settings',
      color: 'bg-gray-500 hover:bg-gray-600'
    },
    {
      id: 'help',
      title: 'Help & Support',
      description: 'Get assistance',
      icon: HelpCircle,
      path: '/support',
      color: 'bg-teal-500 hover:bg-teal-600'
    }
  ];

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">More Options</h1>
        <p className="text-muted-foreground">
          Access additional features and settings
        </p>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 gap-4">
        {moreOptions.map((option) => {
          const Icon = option.icon;
          return (
            <Card 
              key={option.id} 
              className="cursor-pointer transition-all duration-200 hover:shadow-lg active:scale-95"
              onClick={() => navigate(option.path)}
            >
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className={`p-3 rounded-full ${option.color} text-white`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{option.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {option.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Driver Info Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Driver Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Name:</span>
              <span className="text-sm font-medium">
                {profile?.first_name} {profile?.last_name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Role:</span>
              <Badge variant="secondary" className="capitalize">
                {profile?.role}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Badge variant="outline" className="text-green-600 border-green-600">
                Active
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DriverMore;
