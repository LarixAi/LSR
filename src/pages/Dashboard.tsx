import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Truck, 
  Users, 
  Route, 
  AlertTriangle, 
  CheckCircle, 
  Activity,
  Calendar,
  MapPin,
  Wrench,
  FileText,
  TrendingUp,
  Plus,
  Settings,
  Download,
  Fuel,
  Shield,
  DollarSign,
  Star,
  GripVertical,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  X,
  BarChart3,
  PieChart,
  LineChart,
  MoreVertical,
  Clock
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import StandardPageLayout, { 
  MetricCard, 
  NavigationTab, 
  ActionButton 
} from "@/components/layout/StandardPageLayout";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

// Widget configuration options
interface WidgetConfig {
  displayFields: string[];
  refreshInterval?: number;
  showTrends?: boolean;
  customTitle?: string;
  customDescription?: string;
  dataSource?: string;
  filters?: Record<string, any>;
}

// Widget types and their configurations
interface DashboardWidget {
  id: string;
  type: string;
  title: string;
  description: string;
  iconName: string;
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number };
  config: WidgetConfig;
  isVisible: boolean;
  isLocked: boolean;
  data?: any;
}

// Available widget types with configuration options
const WIDGET_TYPES = {
  fuel_reports: {
    title: 'Fuel Reports',
    description: 'Fuel consumption and cost analysis',
    iconName: 'Fuel',
    size: 'medium',
    availableFields: ['totalReports', 'pendingReview', 'totalCost', 'averageConsumption', 'lastUpdated'],
    defaultFields: ['totalReports', 'pendingReview', 'totalCost']
  },
  vor_vehicles: {
    title: 'VOR Vehicles',
    description: 'Vehicles out of service',
    iconName: 'AlertTriangle',
    size: 'small',
    availableFields: ['totalVOR', 'reasons', 'offRoadDate', 'estimatedReturn', 'vehicleTypes'],
    defaultFields: ['totalVOR', 'reasons']
  },
  maintenance_due: {
    title: 'Maintenance Due',
    description: 'Upcoming maintenance requirements',
    iconName: 'Wrench',
    size: 'small',
    availableFields: ['totalDue', 'next7Days', 'next30Days', 'criticalItems', 'vehicleIds'],
    defaultFields: ['totalDue', 'next7Days', 'next30Days']
  },
  driver_compliance: {
    title: 'Driver Compliance',
    description: 'Driver compliance and safety metrics',
    iconName: 'Shield',
    size: 'small',
    availableFields: ['complianceRate', 'totalDrivers', 'needAttention', 'lastCheck', 'violations'],
    defaultFields: ['complianceRate', 'totalDrivers', 'needAttention']
  },
  route_efficiency: {
    title: 'Route Efficiency',
    description: 'Route optimization performance',
    iconName: 'Route',
    size: 'medium',
    availableFields: ['efficiency', 'totalRoutes', 'savings', 'optimizationDate', 'fuelSavings'],
    defaultFields: ['efficiency', 'totalRoutes', 'savings']
  },
  cost_per_mile: {
    title: 'Cost Per Mile',
    description: 'Operational cost metrics',
    iconName: 'DollarSign',
    size: 'small',
    availableFields: ['costPerMile', 'trend', 'totalMiles', 'fuelCost', 'maintenanceCost'],
    defaultFields: ['costPerMile', 'trend']
  },
  customer_satisfaction: {
    title: 'Customer Rating',
    description: 'Customer satisfaction metrics',
    iconName: 'Star',
    size: 'small',
    availableFields: ['rating', 'totalReviews', 'responseRate', 'lastReview', 'improvement'],
    defaultFields: ['rating', 'totalReviews']
  },
  fleet_overview_chart: {
    title: 'Fleet Overview Chart',
    description: 'Visual fleet statistics',
    iconName: 'BarChart3',
    size: 'large',
    availableFields: ['active', 'maintenance', 'outOfService', 'total', 'utilization'],
    defaultFields: ['active', 'maintenance', 'outOfService', 'total']
  },
  revenue_pie_chart: {
    title: 'Revenue Breakdown',
    description: 'Revenue by service type',
    iconName: 'PieChart',
    size: 'large',
    availableFields: ['airportTransfers', 'corporateEvents', 'weddingTransport', 'other', 'totalRevenue'],
    defaultFields: ['airportTransfers', 'corporateEvents', 'weddingTransport', 'other']
  },
  fuel_trends: {
    title: 'Fuel Trends',
    description: 'Fuel consumption over time',
    iconName: 'LineChart',
    size: 'large',
    availableFields: ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'trend'],
    defaultFields: ['jan', 'feb', 'mar', 'apr', 'may', 'jun']
  }
};

export default function Dashboard() {
  const { profile } = useAuth();
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showWidgetSelector, setShowWidgetSelector] = useState(false);
  const [showWidgetConfig, setShowWidgetConfig] = useState(false);
  const [configuringWidget, setConfiguringWidget] = useState<DashboardWidget | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();
  const gridRef = useRef<HTMLDivElement>(null);

  // Fetch real data from database
  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .limit(100);
      
      if (error) {
        console.error('Error fetching vehicles:', error);
        return [];
      }
      return data || [];
    }
  });

  const { data: drivers = [] } = useQuery({
    queryKey: ['drivers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'driver')
        .limit(100);
      
      if (error) {
        console.error('Error fetching drivers:', error);
        return [];
      }
      return data || [];
    }
  });

  const { data: incidents = [] } = useQuery({
    queryKey: ['recent-incidents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) {
        console.error('Error fetching incidents:', error);
        return [];
      }
      return data || [];
    }
  });

  const { data: maintenanceRequests = [] } = useQuery({
    queryKey: ['maintenance-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) {
        console.error('Error fetching maintenance requests:', error);
        return [];
      }
      return data || [];
    }
  });

  // Initialize default widgets if none exist
  useEffect(() => {
    const savedWidgets = localStorage.getItem(`dashboard-widgets-${profile?.organization_id}`);
    if (savedWidgets) {
      setWidgets(JSON.parse(savedWidgets));
    } else {
      // Set default widgets
      const defaultWidgets: DashboardWidget[] = [
        {
          id: 'fuel-reports-1',
          type: 'fuel_reports',
          title: 'Fuel Reports',
          description: 'Fuel consumption and cost analysis',
          iconName: 'Fuel',
          size: 'medium',
          position: { x: 0, y: 0 },
          config: {
            displayFields: ['totalReports', 'pendingReview', 'totalCost'],
            refreshInterval: 300,
            showTrends: true,
            customTitle: 'Fuel Reports',
            customDescription: 'Fuel consumption and cost analysis',
            dataSource: 'default',
            filters: {}
          },
          isVisible: true,
          isLocked: false,
          data: { totalReports: 12, pendingReview: 3, totalCost: 2840.50 }
        },
        {
          id: 'vor-vehicles-1',
          type: 'vor_vehicles',
          title: 'VOR Vehicles',
          description: 'Vehicles out of service',
          iconName: 'AlertTriangle',
          size: 'small',
          position: { x: 2, y: 0 },
          config: {
            displayFields: ['totalVOR', 'reasons'],
            refreshInterval: 300,
            showTrends: false,
            customTitle: 'VOR Vehicles',
            customDescription: 'Vehicles out of service',
            dataSource: 'default',
            filters: {}
          },
          isVisible: true,
          isLocked: false,
          data: { totalVOR: 2, reasons: ['Maintenance', 'Accident'] }
        },
        {
          id: 'maintenance-due-1',
          type: 'maintenance_due',
          title: 'Maintenance Due',
          description: 'Upcoming maintenance requirements',
          iconName: 'Wrench',
          size: 'small',
          position: { x: 3, y: 0 },
          config: {
            displayFields: ['totalDue', 'next7Days', 'next30Days'],
            refreshInterval: 300,
            showTrends: false,
            customTitle: 'Maintenance Due',
            customDescription: 'Upcoming maintenance requirements',
            dataSource: 'default',
            filters: {}
          },
          isVisible: true,
          isLocked: false,
          data: { totalDue: 5, next7Days: 3, next30Days: 2 }
        },
        {
          id: 'driver-compliance-1',
          type: 'driver_compliance',
          title: 'Driver Compliance',
          description: 'Driver compliance and safety metrics',
          iconName: 'Shield',
          size: 'small',
          position: { x: 4, y: 0 },
          config: {
            displayFields: ['complianceRate', 'totalDrivers', 'needAttention'],
            refreshInterval: 300,
            showTrends: true,
            customTitle: 'Driver Compliance',
            customDescription: 'Driver compliance and safety metrics',
            dataSource: 'default',
            filters: {}
          },
          isVisible: true,
          isLocked: false,
          data: { complianceRate: 87, totalDrivers: 18, needAttention: 3 }
        },
        {
          id: 'fleet-overview-chart-1',
          type: 'fleet_overview_chart',
          title: 'Fleet Overview Chart',
          description: 'Visual fleet statistics',
          iconName: 'BarChart3',
          size: 'large',
          position: { x: 0, y: 1 },
          config: {
            displayFields: ['active', 'maintenance', 'outOfService', 'total'],
            refreshInterval: 300,
            showTrends: true,
            customTitle: 'Fleet Overview Chart',
            customDescription: 'Visual fleet statistics',
            dataSource: 'default',
            filters: {}
          },
          isVisible: true,
          isLocked: false,
          data: { active: 4, maintenance: 1, outOfService: 2, total: 6 }
        },
        {
          id: 'revenue-pie-chart-1',
          type: 'revenue_pie_chart',
          title: 'Revenue Breakdown',
          description: 'Revenue by service type',
          iconName: 'PieChart',
          size: 'large',
          position: { x: 2, y: 1 },
          config: {
            displayFields: ['airportTransfers', 'corporateEvents', 'weddingTransport', 'other'],
            refreshInterval: 300,
            showTrends: true,
            customTitle: 'Revenue Breakdown',
            customDescription: 'Revenue by service type',
            dataSource: 'default',
            filters: {}
          },
          isVisible: true,
          isLocked: false,
          data: { 
            airportTransfers: 45, 
            corporateEvents: 30, 
            weddingTransport: 15, 
            other: 10 
          }
        }
      ];
      setWidgets(defaultWidgets);
      saveWidgets(defaultWidgets);
    }
  }, [profile?.organization_id]);

  const saveWidgets = (widgetList: DashboardWidget[]) => {
    localStorage.setItem(`dashboard-widgets-${profile?.organization_id}`, JSON.stringify(widgetList));
  };

  const addWidget = (widgetType: string) => {
    const widgetConfig = WIDGET_TYPES[widgetType as keyof typeof WIDGET_TYPES];
    if (!widgetConfig) return;

    // Ensure we have default fields
    const defaultFields = widgetConfig.defaultFields || [];

    const newWidget: DashboardWidget = {
      id: `${widgetType}-${Date.now()}`,
      type: widgetType,
      title: widgetConfig.title,
      description: widgetConfig.description,
      iconName: widgetConfig.iconName,
      size: widgetConfig.size as 'small' | 'medium' | 'large',
      position: { x: 0, y: widgets.length },
      config: {
        displayFields: defaultFields,
        refreshInterval: 300, // 5 minutes
        showTrends: true,
        customTitle: widgetConfig.title,
        customDescription: widgetConfig.description,
        dataSource: 'default',
        filters: {}
      },
      isVisible: true,
      isLocked: false,
      data: generateMockData(widgetType)
    };

    const updatedWidgets = [...widgets, newWidget];
    setWidgets(updatedWidgets);
    saveWidgets(updatedWidgets);
    toast.success(`Added ${widgetConfig.title} widget`);
  };

  const generateMockData = (widgetType: string) => {
    switch (widgetType) {
      case 'fuel_reports':
        return { totalReports: 12, pendingReview: 3, totalCost: 2840.50 };
      case 'vor_vehicles':
        return { totalVOR: 2, reasons: ['Maintenance', 'Accident'] };
      case 'maintenance_due':
        return { totalDue: 5, next7Days: 3, next30Days: 2 };
      case 'driver_compliance':
        return { complianceRate: 87, totalDrivers: 18, needAttention: 3 };
      case 'fleet_overview_chart':
        return { active: 4, maintenance: 1, outOfService: 2, total: 6 };
      case 'revenue_pie_chart':
        return { 
          airportTransfers: 45, 
          corporateEvents: 30, 
          weddingTransport: 15, 
          other: 10 
        };
      case 'fuel_trends':
        return { 
          jan: 1200, feb: 1350, mar: 1100, apr: 1400, may: 1300, jun: 1250 
        };
      default:
        return {};
    }
  };

  const removeWidget = (widgetId: string) => {
    const updatedWidgets = widgets.filter(w => w.id !== widgetId);
    setWidgets(updatedWidgets);
    saveWidgets(updatedWidgets);
    toast.success('Widget removed');
  };

  const toggleWidgetVisibility = (widgetId: string) => {
    const updatedWidgets = widgets.map(w => 
      w.id === widgetId ? { ...w, isVisible: !w.isVisible } : w
    );
    setWidgets(updatedWidgets);
    saveWidgets(updatedWidgets);
  };

  const toggleWidgetLock = (widgetId: string) => {
    const updatedWidgets = widgets.map(w => 
      w.id === widgetId ? { ...w, isLocked: !w.isLocked } : w
    );
    setWidgets(updatedWidgets);
    saveWidgets(updatedWidgets);
  };

  const moveWidget = (widgetId: string, newPosition: { x: number; y: number }) => {
    const updatedWidgets = widgets.map(w => 
      w.id === widgetId ? { ...w, position: newPosition } : w
    );
    setWidgets(updatedWidgets);
    saveWidgets(updatedWidgets);
  };

  const resetToDefaults = () => {
    const defaultWidgets: DashboardWidget[] = [
      {
        id: 'fuel-reports-1',
        type: 'fuel_reports',
        title: 'Fuel Reports',
        description: 'Fuel consumption and cost analysis',
        iconName: 'Fuel',
        size: 'medium',
        position: { x: 0, y: 0 },
        config: {
          displayFields: ['totalReports', 'pendingReview', 'totalCost'],
          refreshInterval: 300,
          showTrends: true,
          customTitle: 'Fuel Reports',
          customDescription: 'Fuel consumption and cost analysis',
          dataSource: 'default',
          filters: {}
        },
        isVisible: true,
        isLocked: false,
        data: { totalReports: 12, pendingReview: 3, totalCost: 2840.50 }
      },
      {
        id: 'vor-vehicles-1',
        type: 'vor_vehicles',
        title: 'VOR Vehicles',
        description: 'Vehicles out of service',
        iconName: 'AlertTriangle',
        size: 'small',
        position: { x: 2, y: 0 },
        config: {
          displayFields: ['totalVOR', 'reasons'],
          refreshInterval: 300,
          showTrends: false,
          customTitle: 'VOR Vehicles',
          customDescription: 'Vehicles out of service',
          dataSource: 'default',
          filters: {}
        },
        isVisible: true,
        isLocked: false,
        data: { totalVOR: 2, reasons: ['Maintenance', 'Accident'] }
      },
      {
        id: 'maintenance-due-1',
        type: 'maintenance_due',
        title: 'Maintenance Due',
        description: 'Upcoming maintenance requirements',
        iconName: 'Wrench',
        size: 'small',
        position: { x: 3, y: 0 },
        config: {
          displayFields: ['totalDue', 'next7Days', 'next30Days'],
          refreshInterval: 300,
          showTrends: false,
          customTitle: 'Maintenance Due',
          customDescription: 'Upcoming maintenance requirements',
          dataSource: 'default',
          filters: {}
        },
        isVisible: true,
        isLocked: false,
        data: { totalDue: 5, next7Days: 3, next30Days: 2 }
      },
      {
        id: 'driver-compliance-1',
        type: 'driver_compliance',
        title: 'Driver Compliance',
        description: 'Driver compliance and safety metrics',
        iconName: 'Shield',
        size: 'small',
        position: { x: 4, y: 0 },
        config: {
          displayFields: ['complianceRate', 'totalDrivers', 'needAttention'],
          refreshInterval: 300,
          showTrends: true,
          customTitle: 'Driver Compliance',
          customDescription: 'Driver compliance and safety metrics',
          dataSource: 'default',
          filters: {}
        },
        isVisible: true,
        isLocked: false,
        data: { complianceRate: 87, totalDrivers: 18, needAttention: 3 }
      },
      {
        id: 'fleet-overview-chart-1',
        type: 'fleet_overview_chart',
        title: 'Fleet Overview Chart',
        description: 'Visual fleet statistics',
        iconName: 'BarChart3',
        size: 'large',
        position: { x: 0, y: 1 },
        config: {
          displayFields: ['active', 'maintenance', 'outOfService', 'total'],
          refreshInterval: 300,
          showTrends: true,
          customTitle: 'Fleet Overview Chart',
          customDescription: 'Visual fleet statistics',
          dataSource: 'default',
          filters: {}
        },
        isVisible: true,
        isLocked: false,
        data: { active: 4, maintenance: 1, outOfService: 2, total: 6 }
      },
      {
        id: 'revenue-pie-chart-1',
        type: 'revenue_pie_chart',
        title: 'Revenue Breakdown',
        description: 'Revenue by service type',
        iconName: 'PieChart',
        size: 'large',
        position: { x: 2, y: 1 },
        config: {
          displayFields: ['airportTransfers', 'corporateEvents', 'weddingTransport', 'other'],
          refreshInterval: 300,
          showTrends: true,
          customTitle: 'Revenue Breakdown',
          customDescription: 'Revenue by service type',
          dataSource: 'default',
          filters: {}
        },
        isVisible: true,
        isLocked: false,
        data: { 
          airportTransfers: 45, 
          corporateEvents: 30, 
          weddingTransport: 15, 
          other: 10 
        }
      }
    ];
    setWidgets(defaultWidgets);
    saveWidgets(defaultWidgets);
    toast.success('Dashboard reset to defaults');
  };

  // Open widget configuration dialog
  const openWidgetConfig = (widget: DashboardWidget) => {
    setConfiguringWidget(widget);
    setShowWidgetConfig(true);
  };

  // Save widget configuration
  const saveWidgetConfig = (updatedConfig: WidgetConfig) => {
    if (!configuringWidget) return;
    
    const updatedWidgets = widgets.map(w => 
      w.id === configuringWidget.id 
        ? { ...w, config: updatedConfig }
        : w
    );
    
    setWidgets(updatedWidgets);
    saveWidgets(updatedWidgets);
    setShowWidgetConfig(false);
    setConfiguringWidget(null);
    toast.success('Widget configuration saved');
  };

  // Function to render icon based on iconName
const renderIcon = (iconName: string) => {
  const iconProps = { className: "w-5 h-5" };
  switch (iconName) {
    case 'Fuel': return <Fuel {...iconProps} />;
    case 'AlertTriangle': return <AlertTriangle {...iconProps} />;
    case 'Wrench': return <Wrench {...iconProps} />;
    case 'Shield': return <Shield {...iconProps} />;
    case 'Route': return <Route {...iconProps} />;
    case 'DollarSign': return <DollarSign {...iconProps} />;
    case 'Star': return <Star {...iconProps} />;
    case 'BarChart3': return <BarChart3 {...iconProps} />;
    case 'PieChart': return <PieChart {...iconProps} />;
    case 'LineChart': return <LineChart {...iconProps} />;
    default: return <Activity {...iconProps} />;
  }
};

// Widget Configuration Form Component
interface WidgetConfigurationFormProps {
  widget: DashboardWidget;
  onSave: (config: WidgetConfig) => void;
  onCancel: () => void;
}

const WidgetConfigurationForm: React.FC<WidgetConfigurationFormProps> = ({ widget, onSave, onCancel }) => {
  // Ensure the widget has a valid config with displayFields
  const defaultConfig: WidgetConfig = {
    displayFields: widget.config?.displayFields || [],
    refreshInterval: widget.config?.refreshInterval || 300,
    showTrends: widget.config?.showTrends || false,
    customTitle: widget.config?.customTitle || widget.title,
    customDescription: widget.config?.customDescription || widget.description,
    dataSource: widget.config?.dataSource || 'default',
    filters: widget.config?.filters || {}
  };
  
  const [config, setConfig] = useState<WidgetConfig>(defaultConfig);
  const widgetType = WIDGET_TYPES[widget.type as keyof typeof WIDGET_TYPES];

  const handleSave = () => {
    onSave(config);
  };

  const toggleField = (field: string) => {
    setConfig(prev => ({
      ...prev,
      displayFields: (prev.displayFields || []).includes(field)
        ? (prev.displayFields || []).filter(f => f !== field)
        : [...(prev.displayFields || []), field]
    }));
  };

  if (!widgetType || !widgetType.availableFields) {
    return (
      <div className="text-center text-gray-500 py-8">
        <div className="text-sm">Widget type not found or invalid</div>
        <div className="text-xs">Type: {widget.type}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Basic Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Basic Settings</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="customTitle">Custom Title</Label>
            <Input
              id="customTitle"
              value={config.customTitle || widget.title}
              onChange={(e) => setConfig(prev => ({ ...prev, customTitle: e.target.value }))}
              placeholder="Enter custom title"
            />
          </div>
          
          <div>
            <Label htmlFor="refreshInterval">Refresh Interval (seconds)</Label>
            <Select
              value={config.refreshInterval?.toString() || "300"}
              onValueChange={(value) => setConfig(prev => ({ ...prev, refreshInterval: parseInt(value) }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="60">1 minute</SelectItem>
                <SelectItem value="300">5 minutes</SelectItem>
                <SelectItem value="900">15 minutes</SelectItem>
                <SelectItem value="1800">30 minutes</SelectItem>
                <SelectItem value="3600">1 hour</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="showTrends"
            checked={config.showTrends || false}
            onCheckedChange={(checked) => setConfig(prev => ({ ...prev, showTrends: checked }))}
          />
          <Label htmlFor="showTrends">Show trend indicators</Label>
        </div>
      </div>

      {/* Display Fields */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Display Fields</h3>
        <p className="text-sm text-gray-600">Select which information to display in this widget</p>
        
        <div className="grid grid-cols-2 gap-3">
          {widgetType.availableFields.map((field) => {
            const isSelected = config.displayFields.includes(field);
            const fieldLabel = field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            
            return (
              <div
                key={field}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleField(field)}
              >
                <div className="flex items-center space-x-2">
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                    isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                  }`}>
                    {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                  </div>
                  <span className={`text-sm ${isSelected ? 'font-medium' : ''}`}>
                    {fieldLabel}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          Save Configuration
        </Button>
      </div>
    </div>
  );
};

  // Calculate stats
  const activeVehicles = vehicles.filter(v => v.status === 'active').length;
  const activeDrivers = drivers.filter(d => d.is_active).length;
  const pendingMaintenance = maintenanceRequests.filter(r => r.status === 'pending').length;
  const recentIncidents = incidents.length;

  // StandardPageLayout Configuration
  const pageTitle = "Dashboard";
  const pageDescription = `Welcome back, ${profile?.first_name || 'User'}! Monitor your fleet operations and key metrics.`;

  const primaryAction: ActionButton = {
    label: "Add Vehicle",
    onClick: () => window.location.href = "/vehicles",
    icon: <Plus className="w-4 h-4" />
  };

  const secondaryActions: ActionButton[] = [
    {
      label: "Export Report",
      onClick: () => console.log("Export report clicked"),
      icon: <Download className="w-4 h-4" />,
      variant: "outline"
    },
    {
      label: "Customer Dashboard",
      onClick: () => window.location.href = "/customer-dashboard",
      icon: <Users className="w-4 h-4" />,
      variant: "outline"
    },
    {
      label: "Dashboard Settings",
      onClick: () => navigate('/settings?tab=dashboard'),
      icon: <Settings className="w-4 h-4" />,
      variant: "outline"
    }
  ];

  const metricsCards: MetricCard[] = [
    {
      title: "Total Vehicles",
      value: vehicles.length,
      subtitle: `${activeVehicles} active`,
      icon: <Truck className="w-5 h-5" />,
      bgColor: "bg-blue-100",
      color: "text-blue-600"
    },
    {
      title: "Active Drivers",
      value: activeDrivers,
      subtitle: `of ${drivers.length} total drivers`,
      icon: <Users className="w-5 h-5" />,
      bgColor: "bg-green-100",
      color: "text-green-600"
    },
    {
      title: "Pending Maintenance",
      value: pendingMaintenance,
      subtitle: "requests awaiting attention",
      icon: <Wrench className="w-5 h-5" />,
      bgColor: "bg-yellow-100",
      color: "text-yellow-600"
    },
    {
      title: "Recent Incidents",
      value: recentIncidents,
      subtitle: "in the last 7 days",
      icon: <AlertTriangle className="w-5 h-5" />,
      bgColor: "bg-red-100",
      color: "text-red-600"
    }
  ];

  const navigationTabs: NavigationTab[] = [
    { value: "overview", label: "Overview" },
    { value: "activity", label: "Recent Activity" },
    { value: "maintenance", label: "Maintenance" },
    { value: "incidents", label: "Incidents" }
  ];

  const quickActions = [
    { label: "Add Vehicle", icon: Truck, href: "/vehicles" },
    { label: "Add Driver", icon: Users, href: "/drivers" },
    { label: "Create Route", icon: Route, href: "/routes" },
    { label: "View Reports", icon: FileText, href: "/analytics" },
  ];

  // Widget renderer component with drag and drop
  const WidgetRenderer: React.FC<{ 
    widget: DashboardWidget; 
    onRemove: (id: string) => void; 
    onToggleVisibility: (id: string) => void; 
    onToggleLock: (id: string) => void;
    onMove: (id: string, newPosition: { x: number; y: number }) => void;
    isEditMode: boolean;
    gridRef: React.RefObject<HTMLDivElement>;
  }> = ({ 
    widget, 
    onRemove, 
    onToggleVisibility, 
    onToggleLock,
    onMove,
    isEditMode,
    gridRef
  }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const widgetRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = (e: React.MouseEvent) => {
      if (!isEditMode || widget.isLocked) return;
      
      e.preventDefault();
      setIsDragging(true);
      
      const rect = widgetRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !gridRef.current) return;
      
      const gridRect = gridRef.current.getBoundingClientRect();
      const gridX = e.clientX - gridRect.left - dragOffset.x;
      const gridY = e.clientY - gridRect.top - dragOffset.y;
      
      // Convert to grid coordinates (assuming 200px grid cells)
      const newX = Math.max(0, Math.floor(gridX / 200));
      const newY = Math.max(0, Math.floor(gridY / 200));
      
      if (newX !== widget.position.x || newY !== widget.position.y) {
        onMove(widget.id, { x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    useEffect(() => {
      if (isDragging) {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        
        return () => {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        };
      }
    }, [isDragging, dragOffset, widget.position]);

    const renderWidgetContent = () => {
      const { config, data } = widget;
      // Ensure config exists and has displayFields
      const displayFields = config?.displayFields || [];
      
      // Get widget type configuration
      const widgetType = WIDGET_TYPES[widget.type as keyof typeof WIDGET_TYPES];
      if (!widgetType) {
        return (
          <div className="text-center text-gray-500 py-4">
            <div className="text-sm">Unknown widget type</div>
            <div className="text-xs">Type: {widget.type}</div>
          </div>
        );
      }
      
      switch (widget.type) {
        case 'fuel_reports':
          return (
            <div className="space-y-3">
              {displayFields.includes('totalReports') && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{data?.totalReports || 0}</div>
                  <div className="text-sm text-gray-600">Total Reports</div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 text-center">
                {displayFields.includes('pendingReview') && (
                  <div className="p-2 bg-yellow-50 rounded">
                    <div className="text-lg font-bold text-yellow-600">{data?.pendingReview || 0}</div>
                    <div className="text-xs text-gray-600">Pending</div>
                  </div>
                )}
                {displayFields.includes('totalCost') && (
                  <div className="p-2 bg-green-50 rounded">
                    <div className="text-lg font-bold text-green-600">£{(data?.totalCost || 0).toLocaleString()}</div>
                    <div className="text-xs text-gray-600">Total Cost</div>
                  </div>
                )}
                {displayFields.includes('averageConsumption') && (
                  <div className="p-2 bg-blue-50 rounded">
                    <div className="text-lg font-bold text-blue-600">{data?.averageConsumption || 0}</div>
                    <div className="text-xs text-gray-600">Avg Consumption</div>
                  </div>
                )}
                {displayFields.includes('lastUpdated') && (
                  <div className="p-2 bg-gray-50 rounded">
                    <div className="text-lg font-bold text-gray-600">{data?.lastUpdated || 'N/A'}</div>
                    <div className="text-xs text-gray-600">Last Updated</div>
                  </div>
                )}
              </div>
            </div>
          );
        
        case 'vor_vehicles':
          return (
            <div className="space-y-3">
              {displayFields.includes('totalVOR') && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{data?.totalVOR || 0}</div>
                  <div className="text-sm text-gray-600">Out of Service</div>
                </div>
              )}
              {displayFields.includes('reasons') && (
                <div className="text-xs text-gray-500 text-center">
                  {data?.reasons?.join(', ') || 'No VOR vehicles'}
                </div>
              )}
              {displayFields.includes('offRoadDate') && (
                <div className="text-xs text-gray-500 text-center">
                  Off road since: {data?.offRoadDate || 'N/A'}
                </div>
              )}
              {displayFields.includes('estimatedReturn') && (
                <div className="text-xs text-gray-500 text-center">
                  Est. return: {data?.estimatedReturn || 'N/A'}
                </div>
              )}
              {displayFields.includes('vehicleTypes') && (
                <div className="text-xs text-gray-500 text-center">
                  Types: {data?.vehicleTypes?.join(', ') || 'N/A'}
                </div>
              )}
            </div>
          );
        
        case 'maintenance_due':
          return (
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{widget.data?.totalDue || 0}</div>
                <div className="text-sm text-gray-600">Due Soon</div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-1 bg-orange-50 rounded">
                  <div className="font-bold text-orange-600">{widget.data?.next7Days || 0}</div>
                  <div className="text-gray-600">7 days</div>
                </div>
                <div className="p-1 bg-red-50 rounded">
                  <div className="font-bold text-red-600">{widget.data?.next30Days || 0}</div>
                  <div className="text-gray-600">30 days</div>
                </div>
              </div>
            </div>
          );
        
        case 'driver_compliance':
          return (
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{widget.data?.complianceRate || 0}%</div>
                <div className="text-sm text-gray-600">Compliance Rate</div>
              </div>
              <div className="text-xs text-gray-500 text-center">
                {widget.data?.needAttention || 0} drivers need attention
              </div>
            </div>
          );
        
        case 'fleet_overview_chart':
          return (
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{widget.data?.total || 0}</div>
                <div className="text-sm text-gray-600">Total Fleet</div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-1 bg-green-50 rounded">
                  <div className="font-bold text-green-600">{widget.data?.active || 0}</div>
                  <div className="text-gray-600">Active</div>
                </div>
                <div className="p-1 bg-yellow-50 rounded">
                  <div className="font-bold text-yellow-600">{widget.data?.maintenance || 0}</div>
                  <div className="text-gray-600">Maintenance</div>
                </div>
                <div className="p-1 bg-red-50 rounded">
                  <div className="font-bold text-red-600">{widget.data?.outOfService || 0}</div>
                  <div className="text-gray-600">VOR</div>
                </div>
              </div>
            </div>
          );
        
        case 'revenue_pie_chart':
          return (
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">100%</div>
                <div className="text-sm text-gray-600">Revenue Split</div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="p-1 bg-blue-50 rounded">
                  <div className="font-bold text-blue-600">{widget.data?.airportTransfers || 0}%</div>
                  <div className="text-gray-600">Airport</div>
                </div>
                <div className="p-1 bg-green-50 rounded">
                  <div className="font-bold text-green-600">{widget.data?.corporateEvents || 0}%</div>
                  <div className="text-gray-600">Corporate</div>
                </div>
                <div className="p-1 bg-yellow-50 rounded">
                  <div className="font-bold text-yellow-600">{widget.data?.weddingTransport || 0}%</div>
                  <div className="text-gray-600">Wedding</div>
                </div>
                <div className="p-1 bg-red-50 rounded">
                  <div className="font-bold text-red-600">{widget.data?.other || 0}%</div>
                  <div className="text-gray-600">Other</div>
                </div>
              </div>
            </div>
          );
        
        default:
          return (
            <div className="text-center text-gray-500 py-4">
              <div className="text-sm">Widget content</div>
              <div className="text-xs">Type: {widget.type}</div>
            </div>
          );
      }
    };

    const getSizeClasses = () => {
      switch (widget.size) {
        case 'small': return 'col-span-1 row-span-1';
        case 'medium': return 'col-span-2 row-span-1';
        case 'large': return 'col-span-2 row-span-2';
        default: return 'col-span-1 row-span-1';
      }
    };

    return (
      <Card 
        ref={widgetRef}
        className={`${getSizeClasses()} relative group transition-all duration-200 hover:shadow-md ${
          !widget.isVisible ? 'opacity-50' : ''
        } ${isDragging ? 'z-50 shadow-2xl' : ''}`}
        style={{
          gridColumn: `span ${widget.size === 'large' ? 2 : widget.size === 'medium' ? 2 : 1}`,
          gridRow: `span ${widget.size === 'large' ? 2 : 1}`,
          cursor: isEditMode && !widget.isLocked ? 'move' : 'default'
        }}
        onMouseDown={handleMouseDown}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-gray-500">{renderIcon(widget.iconName)}</div>
              <div>
                <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
                <p className="text-xs text-gray-500">{widget.description}</p>
              </div>
            </div>
            
            {/* Widget Settings Menu (3-dot menu) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100"
                  title="Widget settings"
                >
                  <MoreVertical className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {/* Widget Controls */}
                <DropdownMenuItem 
                  onClick={() => onToggleVisibility(widget.id)}
                  className="flex items-center gap-2"
                >
                  {widget.isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  {widget.isVisible ? 'Hide Widget' : 'Show Widget'}
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => onToggleLock(widget.id)}
                  className="flex items-center gap-2"
                >
                  {widget.isLocked ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                  {widget.isLocked ? 'Unlock Widget' : 'Lock Widget'}
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                {/* Widget Actions */}
                <DropdownMenuItem 
                  onClick={() => openWidgetConfig(widget)}
                  className="flex items-center gap-2"
                >
                  <Settings className="w-3 h-3" />
                  Configure Widget
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => console.log(`Refresh ${widget.title} data`)}
                  className="flex items-center gap-2"
                >
                  <Activity className="w-3 h-3" />
                  Refresh Data
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => console.log(`Export ${widget.title} data`)}
                  className="flex items-center gap-2"
                >
                  <Download className="w-3 h-3" />
                  Export Data
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                {/* Dashboard Management */}
                <DropdownMenuItem 
                  onClick={() => setIsEditMode(!isEditMode)}
                  className="flex items-center gap-2"
                >
                  {isEditMode ? <X className="w-3 h-3" /> : <Settings className="w-3 h-3" />}
                  {isEditMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => setShowWidgetSelector(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-3 h-3" />
                  Add New Widget
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={() => resetToDefaults()}
                  className="flex items-center gap-2"
                >
                  <Activity className="w-3 h-3" />
                  Reset to Defaults
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                {/* Remove Widget */}
                <DropdownMenuItem 
                  onClick={() => onRemove(widget.id)}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700"
                >
                  <X className="w-3 h-3" />
                  Remove Widget
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Legacy Edit Mode Controls (hidden when using dropdown) */}
            {isEditMode && false && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => onToggleVisibility(widget.id)}
                  title={widget.isVisible ? 'Hide widget' : 'Show widget'}
                >
                  {widget.isVisible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => onToggleLock(widget.id)}
                  title={widget.isLocked ? 'Unlock widget' : 'Lock widget'}
                >
                  {widget.isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                  onClick={() => onRemove(widget.id)}
                  title="Remove widget"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {renderWidgetContent()}
        </CardContent>
        {isEditMode && !widget.isLocked && (
          <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical className="w-4 h-4 text-gray-400" />
          </div>
        )}
      </Card>
    );
  };

  return (
    <StandardPageLayout
      title={pageTitle}
      description={pageDescription}
      primaryAction={primaryAction}
      secondaryActions={secondaryActions}
      metricsCards={metricsCards}
      showMetricsDashboard={true}
      navigationTabs={navigationTabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {/* Edit Mode Instructions */}
      {isEditMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-blue-800">
            <Settings className="w-5 h-5" />
            <span className="font-medium">Edit Mode Active</span>
          </div>
          <p className="text-blue-700 text-sm mt-1">
            Drag widgets to move them around, use the controls to show/hide or lock widgets, and add new widgets from the widget library.
          </p>
        </div>
      )}

      {/* Widget Selector Modal */}
      {showWidgetSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Add Widgets to Dashboard</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowWidgetSelector(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
                {Object.entries(WIDGET_TYPES).map(([type, config]) => (
                  <Card
                    key={type}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => {
                      addWidget(type);
                      setShowWidgetSelector(false);
                    }}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <div className="text-blue-600">{renderIcon(config.iconName)}</div>
                        <div>
                          <CardTitle className="text-sm font-medium">{config.title}</CardTitle>
                          <p className="text-xs text-gray-500">{config.description}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Badge variant="outline" className="text-xs">
                        {config.size}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Widget Configuration Modal */}
      {showWidgetConfig && configuringWidget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Configure Widget: {configuringWidget.title}</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowWidgetConfig(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="p-6">
              <WidgetConfigurationForm
                widget={configuringWidget}
                onSave={saveWidgetConfig}
                onCancel={() => setShowWidgetConfig(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Dashboard Widgets Grid */}
          <div 
            ref={gridRef}
            className="grid grid-cols-4 gap-4 auto-rows-min min-h-[400px] bg-gray-50 p-4 rounded-lg mb-6"
            style={{
              gridTemplateColumns: 'repeat(4, 1fr)',
              gridAutoRows: 'minmax(200px, auto)'
            }}
          >
            {widgets.filter(w => w.isVisible).map((widget) => (
              <WidgetRenderer
                key={widget.id}
                widget={widget}
                onRemove={removeWidget}
                onToggleVisibility={toggleWidgetVisibility}
                onToggleLock={toggleWidgetLock}
                onMove={moveWidget}
                isEditMode={isEditMode}
                gridRef={gridRef}
              />
            ))}
          </div>

                {/* Widget Management Instructions */}
          {isEditMode && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-blue-800">
                <Settings className="w-5 h-5" />
                <span className="font-medium">Edit Mode Active</span>
              </div>
              <p className="text-blue-700 text-sm mt-1">
                Use the 3-dot menu (⋮) on any widget to access all widget controls and dashboard management options.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Recent Activity Tab */}
      {activeTab === 'activity' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-primary" />
                <span>Recent Activity</span>
              </CardTitle>
              <p className="text-muted-foreground">Latest updates and activities across your fleet</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Recent Incidents */}
                <div className="space-y-3">
                  <h3 className="text-lg font-medium">Recent Incidents</h3>
                  {incidents.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                      <p>No recent incidents - Great job!</p>
                    </div>
                  ) : (
                    incidents.slice(0, 10).map((incident, index) => (
                      <div key={incident.id || index} className="flex items-center space-x-4 rounded-lg border p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex-shrink-0">
                          <AlertTriangle className="w-5 h-5 text-orange-500" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">{incident.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {incident.description?.substring(0, 150)}...
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(incident.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge 
                          variant={
                            incident.severity === 'high' ? 'destructive' : 
                            incident.severity === 'medium' ? 'default' : 'secondary'
                          }
                        >
                          {incident.severity}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>

                {/* Recent Maintenance */}
                <div className="space-y-3 pt-6 border-t">
                  <h3 className="text-lg font-medium">Recent Maintenance</h3>
                  {maintenanceRequests.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                      <p>No recent maintenance requests</p>
                    </div>
                  ) : (
                    maintenanceRequests.slice(0, 10).map((request, index) => (
                      <div key={request.id || index} className="flex items-center space-x-4 rounded-lg border p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex-shrink-0">
                          <Wrench className="w-5 h-5 text-blue-500" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">{request.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {request.description?.substring(0, 150)}...
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge 
                          variant={
                            request.status === 'pending' ? 'default' : 
                            request.status === 'in_progress' ? 'secondary' : 'outline'
                          }
                        >
                          {request.status}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>

                {/* Recent Vehicle Updates */}
                <div className="space-y-3 pt-6 border-t">
                  <h3 className="text-lg font-medium">Vehicle Updates</h3>
                  <div className="space-y-3">
                    {vehicles.slice(0, 5).map((vehicle, index) => (
                      <div key={vehicle.id || index} className="flex items-center space-x-4 rounded-lg border p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex-shrink-0">
                          <Truck className="w-5 h-5 text-green-500" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">{vehicle.license_plate || `Vehicle ${index + 1}`}</p>
                          <p className="text-sm text-muted-foreground">
                            {vehicle.make} {vehicle.model} - {vehicle.year}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Status: {vehicle.status || 'Active'}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {vehicle.status || 'Active'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Maintenance Tab */}
      {activeTab === 'maintenance' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Wrench className="w-5 h-5 text-primary" />
                <span>Maintenance Management</span>
              </CardTitle>
              <p className="text-muted-foreground">Track and manage vehicle maintenance requests</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Maintenance Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Pending</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-900">{pendingMaintenance}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-yellow-50 border-yellow-200">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Wrench className="w-5 h-5 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-800">In Progress</span>
                      </div>
                      <p className="text-2xl font-bold text-yellow-900">
                        {maintenanceRequests.filter(r => r.status === 'in_progress').length}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-green-800">Completed</span>
                      </div>
                      <p className="text-2xl font-bold text-green-900">
                        {maintenanceRequests.filter(r => r.status === 'completed').length}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Maintenance Requests Table */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Maintenance Requests</h3>
                    <Button variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      New Request
                    </Button>
                  </div>
                  
                  {maintenanceRequests.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                      <p>No maintenance requests found</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {maintenanceRequests.map((request, index) => (
                        <div key={request.id || index} className="flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <Wrench className="w-5 h-5 text-blue-500" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium leading-none">{request.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {request.description?.substring(0, 100)}...
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Created: {new Date(request.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant={
                                request.status === 'pending' ? 'default' : 
                                request.status === 'in_progress' ? 'secondary' : 'outline'
                              }
                            >
                              {request.status}
                            </Badge>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Incidents Tab */}
      {activeTab === 'incidents' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-primary" />
                <span>Incident Management</span>
              </CardTitle>
              <p className="text-muted-foreground">Track and manage fleet incidents and safety reports</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Incident Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-red-50 border-red-200">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <span className="text-sm font-medium text-red-800">Total Incidents</span>
                      </div>
                      <p className="text-2xl font-bold text-red-900">{recentIncidents}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-orange-50 border-orange-200">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-5 h-5 text-orange-600" />
                        <span className="text-sm font-medium text-orange-800">Open Cases</span>
                      </div>
                      <p className="text-2xl font-bold text-orange-900">
                        {incidents.filter(i => i.status === 'open').length}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-green-800">Resolved</span>
                      </div>
                      <p className="text-2xl font-bold text-green-900">
                        {incidents.filter(i => i.status === 'resolved').length}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Incidents Table */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Recent Incidents</h3>
                    <Button variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Report Incident
                    </Button>
                  </div>
                  
                  {incidents.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                      <p>No incidents reported</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {incidents.map((incident, index) => (
                        <div key={incident.id || index} className="flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <AlertTriangle className="w-5 h-5 text-orange-500" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium leading-none">{incident.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {incident.description?.substring(0, 100)}...
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Reported: {new Date(incident.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant={
                                incident.severity === 'high' ? 'destructive' : 
                                incident.severity === 'medium' ? 'default' : 'secondary'
                              }
                            >
                              {incident.severity}
                            </Badge>
                            <Badge variant="outline">
                              {incident.status || 'Open'}
                            </Badge>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 sm:gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-4 border-primary/10 hover:border-primary/20 transition-all">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="incidents" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                <TabsTrigger value="incidents">Recent Incidents</TabsTrigger>
                <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
              </TabsList>
              
              <TabsContent value="incidents" className="space-y-4">
                {incidents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                    <p>No recent incidents - Great job!</p>
                  </div>
                ) : (
                  incidents.slice(0, 5).map((incident, index) => (
                    <div key={incident.id || index} className="flex items-center space-x-4 rounded-lg border p-3">
                      <div className="flex-shrink-0">
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">{incident.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {incident.description?.substring(0, 100)}...
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(incident.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge 
                        variant={
                          incident.severity === 'high' ? 'destructive' : 
                          incident.severity === 'medium' ? 'default' : 'secondary'
                        }
                      >
                        {incident.severity}
                      </Badge>
                    </div>
                  ))
                )}
              </TabsContent>
              
              <TabsContent value="maintenance" className="space-y-4">
                {maintenanceRequests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                    <p>No pending maintenance requests</p>
                  </div>
                ) : (
                  maintenanceRequests.slice(0, 5).map((request, index) => (
                    <div key={request.id || index} className="flex items-center space-x-4 rounded-lg border p-3">
                      <div className="flex-shrink-0">
                        <Wrench className="w-5 h-5 text-blue-500" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          Maintenance Request
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {request.description?.substring(0, 100)}...
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge 
                        variant={
                          request.status === 'pending' ? 'default' : 
                          request.status === 'in_progress' ? 'secondary' : 'outline'
                        }
                      >
                        {request.status}
                      </Badge>
                    </div>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="lg:col-span-3 border-primary/10 hover:border-primary/20 transition-all">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <span>Quick Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start hover:bg-primary/5 hover:border-primary/30 transition-all group"
                    onClick={() => window.location.href = action.href}
                  >
                    <Icon className="w-4 h-4 mr-2 group-hover:text-primary transition-colors" />
                    {action.label}
                  </Button>
                );
              })}
            </div>

            {/* Fleet Status Summary */}
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-3">Fleet Status</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Vehicles Active</span>
                  <Badge variant="secondary">{activeVehicles}/{vehicles.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Drivers Available</span>
                  <Badge variant="secondary">{activeDrivers}/{drivers.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Maintenance Due</span>
                  <Badge variant={pendingMaintenance > 0 ? "destructive" : "secondary"}>
                    {pendingMaintenance}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Today's Summary */}
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-3 flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Today's Summary</span>
              </h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Active Routes</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between">
                  <span>Completed Jobs</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between">
                  <span>New Incidents</span>
                  <span className="font-medium">{recentIncidents}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </StandardPageLayout>
  );
}