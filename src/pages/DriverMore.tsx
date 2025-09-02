import React from 'react';
import StandardPageLayout, { MetricCard } from '@/components/layout/StandardPageLayout';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const DriverMore: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const metrics: MetricCard[] = [];

  const infoChips = [
    {
      title: 'Role',
      value: profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : 'Driver',
      icon: <User className="h-4 w-4" />, color: 'bg-blue-50 text-blue-600'
    },
    {
      title: 'Status', value: 'Active', icon: <Shield className="h-4 w-4" />, color: 'bg-green-50 text-green-600'
    },
    {
      title: 'Docs', value: 'View', icon: <FileText className="h-4 w-4" />, color: 'bg-indigo-50 text-indigo-600'
    },
    {
      title: 'Support', value: 'Help', icon: <HelpCircle className="h-4 w-4" />, color: 'bg-teal-50 text-teal-600'
    }
  ];

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
      description: 'Clock in/out & history',
      icon: Clock,
      path: '/driver/time',
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
      path: '/help',
      color: 'bg-teal-500 hover:bg-teal-600'
    }
  ];

  return (
    <StandardPageLayout
      title="More Options"
      description="Access additional features and settings"
      showMetricsDashboard={false}
      customHeaderContent={(
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {infoChips.map((chip, idx) => (
            <div key={idx} className="flex items-center gap-3 rounded-xl border bg-white p-3">
              <div className={`rounded-lg p-2 ${chip.color.replace('text-', 'bg-opacity-20 ')} ${chip.color.split(' ')[0]}`}>
                {chip.icon}
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{chip.title}</p>
                <p className="text-sm font-semibold truncate">{chip.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    >
    <div className="space-y-6">

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {moreOptions.map((option) => {
          const Icon = option.icon;
          return (
            <Card 
              key={option.id} 
              className="cursor-pointer transition-all duration-200 hover:shadow-lg active:scale-95"
              onClick={() => navigate(option.path)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-full ${option.color} text-white`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm truncate">{option.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 truncate">
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="h-10 w-10">
                <AvatarImage src={profile?.avatar_url || ''} />
                <AvatarFallback>
                  {profile?.first_name?.[0]}
                  {profile?.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">
                  {profile?.first_name} {profile?.last_name}
                </p>
                <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 md:gap-3">
              <div className="flex items-center gap-2 rounded-lg bg-white/60 px-2 py-1 border">
                <Shield className="w-3.5 h-3.5 text-green-600" />
                <Badge variant="outline" className="text-xs capitalize">
                  {profile?.role || 'driver'}
                </Badge>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-white/60 px-2 py-1 border">
                <Shield className="w-3.5 h-3.5 text-green-600" />
                <Badge variant="outline" className="text-xs text-green-700 border-green-600">Active</Badge>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>View Profile</Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/driver/settings')}>Settings</Button>
          </div>
        </CardContent>
      </Card>
    </div>
    </StandardPageLayout>
  );
};

export default DriverMore;
