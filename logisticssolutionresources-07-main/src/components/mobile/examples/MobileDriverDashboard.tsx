import React, { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileOptimizedLayout from '../MobileOptimizedLayout';
import TouchFriendlyCard from '../TouchFriendlyCard';
import MobileFriendlyButton from '../MobileFriendlyButton';
import MobileGrid from '../MobileGrid';
import MobilePullToRefresh from '../MobilePullToRefresh';
import MobileBottomSheet from '../MobileBottomSheet';
import { 
  MapPin, 
  Clock, 
  Truck, 
  AlertTriangle, 
  CheckCircle,
  Settings,
  Phone,
  Navigation
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

// Example component showing mobile optimization patterns
const MobileDriverDashboard: React.FC = () => {
  const isMobile = useIsMobile();
  const [isOnline, setIsOnline] = useState(true);
  const [showSettingsSheet, setShowSettingsSheet] = useState(false);

  // Mock data for demonstration
  const activeJob = {
    id: '123',
    pickup: 'School Main Gate',
    dropoff: 'Student Home Area',
    time: '15:30',
    students: 8,
    status: 'in_progress'
  };

  const todayStats = {
    jobsCompleted: 4,
    totalJobs: 6,
    hoursWorked: 6.5,
    distanceDriven: 124
  };

  const handleRefresh = async () => {
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('Data refreshed!');
  };

  const quickActions = [
    { icon: CheckCircle, label: 'Vehicle Check', action: () => {} },
    { icon: AlertTriangle, label: 'Report Issue', action: () => {} },
    { icon: Phone, label: 'Call Support', action: () => {} },
    { icon: Navigation, label: 'Navigation', action: () => {} },
  ];

  return (
    <MobileOptimizedLayout>
      <MobilePullToRefresh onRefresh={handleRefresh}>
        <div className="space-y-4">
          {/* Status Header */}
          <TouchFriendlyCard variant="elevated" className="bg-gradient-primary text-primary-foreground">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Driver Dashboard</h2>
                <p className="text-primary-foreground/90">Good afternoon, John!</p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={isOnline ? "secondary" : "destructive"}>
                  {isOnline ? 'Online' : 'Offline'}
                </Badge>
                <MobileFriendlyButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsOnline(!isOnline)}
                >
                  {isOnline ? 'Go Offline' : 'Go Online'}
                </MobileFriendlyButton>
              </div>
            </div>
          </TouchFriendlyCard>

          {/* Active Job Card */}
          {activeJob && (
            <TouchFriendlyCard 
              title="Current Job"
              variant="interactive"
              className="border-l-4 border-l-primary"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="font-medium">{activeJob.pickup}</span>
                  </div>
                  <Badge variant="outline">{activeJob.students} students</Badge>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Navigation className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">to {activeJob.dropoff}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{activeJob.time}</span>
                  </div>
                  <Badge className="bg-green-500">In Progress</Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <MobileFriendlyButton variant="outline" size="sm">
                    <Phone className="w-4 h-4 mr-2" />
                    Call School
                  </MobileFriendlyButton>
                  <MobileFriendlyButton variant="default" size="sm">
                    <Navigation className="w-4 h-4 mr-2" />
                    Navigate
                  </MobileFriendlyButton>
                </div>
              </div>
            </TouchFriendlyCard>
          )}

          {/* Today's Progress */}
          <TouchFriendlyCard title="Today's Progress" variant="elevated">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Jobs Completed</span>
                <span className="text-lg font-bold">{todayStats.jobsCompleted}/{todayStats.totalJobs}</span>
              </div>
              <Progress value={(todayStats.jobsCompleted / todayStats.totalJobs) * 100} />
              
              <MobileGrid mobileColumns={2} gap="sm" className="mt-4">
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-primary">{todayStats.hoursWorked}h</div>
                  <div className="text-xs text-muted-foreground">Hours Worked</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-primary">{todayStats.distanceDriven}km</div>
                  <div className="text-xs text-muted-foreground">Distance</div>
                </div>
              </MobileGrid>
            </div>
          </TouchFriendlyCard>

          {/* Quick Actions */}
          <TouchFriendlyCard title="Quick Actions">
            <MobileGrid mobileColumns={2} gap="sm">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <MobileFriendlyButton
                    key={index}
                    variant="outline"
                    className="h-16 flex-col space-y-1"
                    onClick={action.action}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs">{action.label}</span>
                  </MobileFriendlyButton>
                );
              })}
            </MobileGrid>
          </TouchFriendlyCard>

          {/* Settings Bottom Sheet */}
          <MobileBottomSheet
            trigger={
              <MobileFriendlyButton 
                variant="outline" 
                className="w-full"
                onClick={() => setShowSettingsSheet(true)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings & Preferences
              </MobileFriendlyButton>
            }
            title="Driver Settings"
            description="Manage your preferences and settings"
            open={showSettingsSheet}
            onOpenChange={setShowSettingsSheet}
          >
            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Notifications</h4>
                <p className="text-sm text-muted-foreground">
                  Manage how you receive job updates and alerts
                </p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Navigation</h4>
                <p className="text-sm text-muted-foreground">
                  Choose your preferred navigation app
                </p>
              </div>
            </div>
          </MobileBottomSheet>
        </div>
      </MobilePullToRefresh>
    </MobileOptimizedLayout>
  );
};

export default MobileDriverDashboard;