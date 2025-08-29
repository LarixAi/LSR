import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ChevronRight, Calendar, MapPin, User, Clock } from "lucide-react";

interface MobileCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  status?: {
    label: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  metadata?: Array<{
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string;
  }>;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'secondary' | 'outline' | 'destructive';
  }>;
  onClick?: () => void;
  className?: string;
}

export const MobileCard = ({
  title,
  subtitle,
  description,
  status,
  metadata,
  actions,
  onClick,
  className
}: MobileCardProps) => {
  const isClickable = !!onClick;

  return (
    <Card 
      className={cn(
        "w-full transition-all duration-200",
        isClickable && "cursor-pointer hover:shadow-md active:scale-[0.98]",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-semibold leading-tight truncate">
              {title}
            </CardTitle>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1 truncate">
                {subtitle}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2 ml-2">
            {status && (
              <Badge variant={status.variant || 'default'} className="text-xs">
                {status.label}
              </Badge>
            )}
            {isClickable && (
              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
          </div>
        </div>
        
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
            {description}
          </p>
        )}
      </CardHeader>
      
      {(metadata || actions) && (
        <CardContent className="pt-0">
          {metadata && (
            <div className="grid grid-cols-2 gap-2 mb-3">
              {metadata.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="flex items-center gap-2 min-w-0">
                    <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground truncate">
                        {item.label}
                      </p>
                      <p className="text-sm font-medium truncate">
                        {item.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {actions && (
            <div className="flex gap-2 flex-wrap">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || 'outline'}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick();
                  }}
                  className="flex-1 min-w-0"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

// Pre-configured cards for common use cases
export const JobCard = ({ 
  job, 
  onView, 
  onEdit 
}: { 
  job: any; 
  onView: () => void; 
  onEdit: () => void; 
}) => (
  <MobileCard
    title={job.title}
    subtitle={`#${job.id?.slice(0, 8)}`}
    description={job.description}
    status={{
      label: job.status,
      variant: job.status === 'completed' ? 'default' : 
               job.status === 'in_progress' ? 'secondary' : 'outline'
    }}
    metadata={[
      { icon: Calendar, label: 'Date', value: job.start_date },
      { icon: MapPin, label: 'Route', value: job.route?.name || 'Not assigned' },
      { icon: User, label: 'Driver', value: job.driver?.name || 'Unassigned' },
      { icon: Clock, label: 'Time', value: job.start_time || 'TBD' }
    ]}
    actions={[
      { label: 'View', onClick: onView, variant: 'outline' },
      { label: 'Edit', onClick: onEdit }
    ]}
  />
);

export const VehicleCard = ({ 
  vehicle, 
  onView, 
  onInspect 
}: { 
  vehicle: any; 
  onView: () => void; 
  onInspect: () => void; 
}) => (
  <MobileCard
    title={`${vehicle.make} ${vehicle.model}`}
    subtitle={vehicle.vehicle_number}
    description={`${vehicle.year} • ${vehicle.fuel_type}`}
    status={{
      label: vehicle.status,
      variant: vehicle.status === 'active' ? 'default' : 'secondary'
    }}
    metadata={[
      { icon: MapPin, label: 'Location', value: vehicle.current_location || 'Unknown' },
      { icon: Calendar, label: 'Last Service', value: vehicle.last_service_date || 'N/A' }
    ]}
    actions={[
      { label: 'View Details', onClick: onView, variant: 'outline' },
      { label: 'Inspect', onClick: onInspect }
    ]}
  />
);