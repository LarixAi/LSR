import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { isPlatform } from "@/utils/platform";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Truck, 
  FileText, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Camera,
  Navigation
} from "lucide-react";
import MobileFriendlyButton from "@/components/mobile/MobileFriendlyButton";
import TouchFriendlyCard from "@/components/mobile/TouchFriendlyCard";
import MobileGrid from "@/components/mobile/MobileGrid";

export default function DriverMobile() {
  const isMobile = useIsMobile();
  const isNativeMobile = isPlatform.mobile();
  const { user, profile } = useAuth();

  // Fetch current driver assignment
  const { data: currentAssignment } = useQuery({
    queryKey: ['driver-current-assignment', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const today = new Date().toISOString().split('T')[0];
      const { data: assignmentData, error } = await supabase
        .from('driver_assignments')
        .select('*')
        .eq('driver_id', user.id)
        .eq('assigned_date', today)
        .eq('status', 'active')
        .maybeSingle();

      if (error || !assignmentData) return null;

      // Fetch route and vehicle data separately
      const [routeData, vehicleData] = await Promise.all([
        assignmentData.route_id ? supabase
          .from('routes')
          .select('name, start_location, end_location')
          .eq('id', assignmentData.route_id)
          .maybeSingle() : Promise.resolve({ data: null }),
        assignmentData.vehicle_id ? supabase
          .from('vehicles')
          .select('vehicle_number, make, model')
          .eq('id', assignmentData.vehicle_id)
          .maybeSingle() : Promise.resolve({ data: null })
      ]);

      return {
        ...assignmentData,
        routes: routeData.data,
        vehicles: vehicleData.data
      };
    },
    enabled: !!user?.id
  });

  // Fetch today's time entry
  const { data: todayTimeEntry } = useQuery({
    queryKey: ['driver-time-entry-today', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('driver_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) console.error('Error fetching time entry:', error);
      return data;
    },
    enabled: !!user?.id
  });

  const quickActions = [
    {
      icon: CheckCircle2,
      title: "Start Shift",
      description: "Begin your work day",
      color: "bg-green-500",
      action: () => console.log("Start shift")
    },
    {
      icon: FileText,
      title: "Documents",
      description: "View required docs",
      color: "bg-blue-500",
      action: () => console.log("View documents")
    },
    {
      icon: Camera,
      title: "Vehicle Check",
      description: "Pre-trip inspection",
      color: "bg-purple-500",
      action: () => console.log("Vehicle check")
    },
    {
      icon: Navigation,
      title: "Navigation",
      description: "Start route guidance",
      color: "bg-orange-500",
      action: () => console.log("Navigation")
    }
  ];

  const todayStats = [
    { 
      label: "Hours Worked", 
      value: todayTimeEntry?.total_hours?.toFixed(1) || "0.0", 
      icon: Clock 
    },
    { 
      label: "Current Route", 
      value: currentAssignment ? "1" : "0", 
      icon: CheckCircle2 
    },
    { 
      label: "Vehicle", 
      value: currentAssignment?.vehicles?.vehicle_number || "None", 
      icon: Truck 
    },
    { 
      label: "Status", 
      value: todayTimeEntry?.clock_out_time ? "Off Duty" : "On Duty", 
      icon: AlertTriangle 
    }
  ];

  return (
    <div className={`${isMobile ? 'space-y-4 p-4' : 'space-y-6 p-6'}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold text-foreground`}>
            Driver Dashboard
          </h1>
          <p className="text-muted-foreground text-sm">
            {isNativeMobile ? "Mobile App" : "Mobile View"}
          </p>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
          On Duty
        </Badge>
      </div>

      {/* Today's Stats */}
      <div>
        <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold mb-3`}>
          Today's Overview
        </h2>
        <MobileGrid mobileColumns={2} gap="sm">
          {todayStats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <TouchFriendlyCard
                key={index}
                className="p-3 bg-card border border-border"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <IconComponent className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </TouchFriendlyCard>
            );
          })}
        </MobileGrid>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold mb-3`}>
          Quick Actions
        </h2>
        <MobileGrid mobileColumns={2} gap="sm">
          {quickActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <TouchFriendlyCard
                key={index}
                onClick={action.action}
                pressable
                className="p-4 hover:shadow-md transition-all duration-200"
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className={`p-3 ${action.color} rounded-full`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{action.title}</p>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </div>
                </div>
              </TouchFriendlyCard>
            );
          })}
        </MobileGrid>
      </div>

      {/* Current Job */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center">
              <Truck className="w-5 h-5 mr-2 text-primary" />
              Current Assignment
            </CardTitle>
            <Badge className="bg-primary text-primary-foreground">
              In Progress
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-foreground">
                {currentAssignment?.routes?.name || "No Current Assignment"}
              </p>
              <p className="text-sm text-muted-foreground">
                {currentAssignment ? 
                  `${currentAssignment.routes?.start_location} → ${currentAssignment.routes?.end_location}` :
                  "Contact dispatch for assignment"
                }
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">Vehicle:</p>
              <p className="text-xs text-muted-foreground">
                {currentAssignment?.vehicles?.vehicle_number || "Not assigned"}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <MobileFriendlyButton 
              variant="outline" 
              size="sm"
              className="flex-1"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Navigate
            </MobileFriendlyButton>
            <MobileFriendlyButton 
              variant="outline" 
              size="sm"
              className="flex-1"
            >
              <FileText className="w-4 h-4 mr-2" />
              Details
            </MobileFriendlyButton>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      {isNativeMobile && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                <div>
                  <p className="font-semibold text-red-800 dark:text-red-200">Emergency</p>
                  <p className="text-xs text-red-600 dark:text-red-300">24/7 Support Available</p>
                </div>
              </div>
              <MobileFriendlyButton variant="destructive" size="sm">
                Call Now
              </MobileFriendlyButton>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}