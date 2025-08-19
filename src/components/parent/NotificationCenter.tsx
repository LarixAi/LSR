
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Clock, AlertTriangle, Info, CheckCircle, Settings } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useIsMobile } from '@/hooks/use-mobile';

const NotificationCenter = () => {
  const [notificationSettings, setNotificationSettings] = useState({
    delays: true,
    incidents: true,
    pickup: true,
    general: true,
    emergency: true
  });
  const isMobile = useIsMobile();

  // Mock notification data
  const notifications = [
    {
      id: '1',
      type: 'delay',
      title: 'Route Delay',
      message: 'Bus running 10 minutes late due to traffic on Highway 101',
      timestamp: '5 minutes ago',
      status: 'unread',
      priority: 'medium'
    },
    {
      id: '2',
      type: 'incident',
      title: 'Minor Incident Report',
      message: 'Student Emma dropped her lunch box. Driver helped retrieve it.',
      timestamp: '2 hours ago',
      status: 'read',
      priority: 'low'
    },
    {
      id: '3',
      type: 'pickup',
      title: 'Pickup Confirmation',
      message: 'Emma has been picked up successfully at 7:30 AM',
      timestamp: '3 hours ago',
      status: 'read',
      priority: 'low'
    },
    {
      id: '4',
      type: 'emergency',
      title: 'Weather Alert',
      message: 'Heavy rain expected. Route may experience delays.',
      timestamp: '1 day ago',
      status: 'read',
      priority: 'high'
    }
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'delay': return <Clock className="w-4 h-4 text-orange-500" />;
      case 'incident': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'pickup': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'emergency': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'high') return 'border-l-4 border-red-500 bg-red-50';
    if (priority === 'medium') return 'border-l-4 border-orange-500 bg-orange-50';
    return 'border-l-4 border-blue-500 bg-blue-50';
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-orange-100 text-orange-800',
      low: 'bg-green-100 text-green-800'
    };
    return colors[priority as keyof typeof colors] || colors.low;
  };

  const handleSettingChange = (setting: string, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  return (
    <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'lg:grid-cols-3'}`}>
      <div className={isMobile ? 'order-2' : 'lg:col-span-2'}>
        <Card>
          <CardHeader className={isMobile ? 'pb-3' : ''}>
            <CardTitle className={`flex items-center space-x-2 ${isMobile ? 'text-lg' : ''}`}>
              <Bell className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
              <span>Recent Notifications</span>
            </CardTitle>
            <CardDescription className={isMobile ? 'text-sm' : ''}>
              Stay updated on your child's transport status
            </CardDescription>
          </CardHeader>
          <CardContent className={isMobile ? 'pt-0' : ''}>
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`${isMobile ? 'p-3' : 'p-4'} rounded-lg ${getNotificationColor(notification.type, notification.priority)} ${
                    notification.status === 'unread' ? 'shadow-md' : ''
                  }`}
                >
                  <div className={`flex items-start justify-between ${isMobile ? 'mb-1' : 'mb-2'}`}>
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      {getNotificationIcon(notification.type)}
                      <span className={`font-medium ${isMobile ? 'text-sm truncate' : ''}`}>
                        {notification.title}
                      </span>
                      {notification.status === 'unread' && (
                        <Badge variant="destructive" className="text-xs">New</Badge>
                      )}
                    </div>
                    <div className={`flex items-center space-x-2 ${isMobile ? 'flex-col gap-1' : ''}`}>
                      <Badge variant="outline" className={`${getPriorityBadge(notification.priority)} text-xs`}>
                        {notification.priority}
                      </Badge>
                      <span className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-500 whitespace-nowrap`}>
                        {notification.timestamp}
                      </span>
                    </div>
                  </div>
                  <p className={`${isMobile ? 'text-sm' : 'text-sm'} text-gray-700 leading-relaxed`}>
                    {notification.message}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className={isMobile ? 'order-1' : ''}>
        <CardHeader className={isMobile ? 'pb-3' : ''}>
          <CardTitle className={`flex items-center space-x-2 ${isMobile ? 'text-lg' : ''}`}>
            <Settings className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
            <span>Notification Settings</span>
          </CardTitle>
          <CardDescription className={isMobile ? 'text-sm' : ''}>
            Choose what notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className={`space-y-4 ${isMobile ? 'pt-0' : ''}`}>
          <div className={`flex items-center justify-between ${isMobile ? 'py-2' : ''}`}>
            <Label htmlFor="delays" className={`${isMobile ? 'text-sm' : 'text-sm'} font-medium`}>
              Route Delays
            </Label>
            <Switch
              id="delays"
              checked={notificationSettings.delays}
              onCheckedChange={(value) => handleSettingChange('delays', value)}
            />
          </div>
          <div className={`flex items-center justify-between ${isMobile ? 'py-2' : ''}`}>
            <Label htmlFor="incidents" className={`${isMobile ? 'text-sm' : 'text-sm'} font-medium`}>
              Incident Reports
            </Label>
            <Switch
              id="incidents"
              checked={notificationSettings.incidents}
              onCheckedChange={(value) => handleSettingChange('incidents', value)}
            />
          </div>
          <div className={`flex items-center justify-between ${isMobile ? 'py-2' : ''}`}>
            <Label htmlFor="pickup" className={`${isMobile ? 'text-sm' : 'text-sm'} font-medium`}>
              Pickup/Dropoff
            </Label>
            <Switch
              id="pickup"
              checked={notificationSettings.pickup}
              onCheckedChange={(value) => handleSettingChange('pickup', value)}
            />
          </div>
          <div className={`flex items-center justify-between ${isMobile ? 'py-2' : ''}`}>
            <Label htmlFor="general" className={`${isMobile ? 'text-sm' : 'text-sm'} font-medium`}>
              General Updates
            </Label>
            <Switch
              id="general"
              checked={notificationSettings.general}
              onCheckedChange={(value) => handleSettingChange('general', value)}
            />
          </div>
          <div className={`flex items-center justify-between ${isMobile ? 'py-2' : ''}`}>
            <Label htmlFor="emergency" className={`${isMobile ? 'text-sm' : 'text-sm'} font-medium`}>
              Emergency Alerts
            </Label>
            <Switch
              id="emergency"
              checked={notificationSettings.emergency}
              onCheckedChange={(value) => handleSettingChange('emergency', value)}
            />
          </div>
          <Button className={`w-full mt-4 ${isMobile ? 'h-12' : ''}`}>
            Save Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationCenter;
