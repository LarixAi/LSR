import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CheckCircle, 
  Clock, 
  Navigation, 
  AlertCircle,
  MessageSquare,
  Phone,
  FileText,
  Shield
} from 'lucide-react';

interface DriverQuickActionsProps {
  onVehicleCheck: () => void;
}

const DriverQuickActions: React.FC<DriverQuickActionsProps> = ({ onVehicleCheck }) => {
  return (
    <Card className="bg-glass border-primary/20 card-hover animate-slide-up">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-gradient">
          <CheckCircle className="w-6 h-6" />
          <span>Quick Actions</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Button 
            className="h-20 bg-gradient-primary text-white card-hover animate-scale-in flex-col space-y-2"
            onClick={onVehicleCheck}
          >
            <CheckCircle className="w-6 h-6" />
            <span className="text-sm font-medium">Vehicle Check</span>
          </Button>
          
          <Button className="h-20 bg-gradient-secondary text-white card-hover animate-scale-in flex-col space-y-2" style={{ animationDelay: '0.1s' }}>
            <Clock className="w-6 h-6" />
            <span className="text-sm font-medium">Clock In/Out</span>
          </Button>
          
          <Button className="h-20 bg-gradient-accent text-white card-hover animate-scale-in flex-col space-y-2" style={{ animationDelay: '0.2s' }}>
            <Navigation className="w-6 h-6" />
            <span className="text-sm font-medium">Start Route</span>
          </Button>
          
          <Button className="h-20 bg-glass border-primary/20 card-hover animate-scale-in flex-col space-y-2" style={{ animationDelay: '0.3s' }}>
            <AlertCircle className="w-6 h-6 text-primary" />
            <span className="text-sm font-medium text-primary">Report Issue</span>
          </Button>
          
          <Button className="h-20 bg-muted/30 hover:bg-muted/50 card-hover animate-scale-in flex-col space-y-2" style={{ animationDelay: '0.4s' }}>
            <MessageSquare className="w-6 h-6 text-primary" />
            <span className="text-sm font-medium text-primary">Messages</span>
          </Button>
          
          <Button className="h-20 bg-muted/30 hover:bg-muted/50 card-hover animate-scale-in flex-col space-y-2" style={{ animationDelay: '0.5s' }}>
            <Phone className="w-6 h-6 text-primary" />
            <span className="text-sm font-medium text-primary">Support</span>
          </Button>
          
          <Button className="h-20 bg-muted/30 hover:bg-muted/50 card-hover animate-scale-in flex-col space-y-2" style={{ animationDelay: '0.6s' }}>
            <FileText className="w-6 h-6 text-primary" />
            <span className="text-sm font-medium text-primary">Documents</span>
          </Button>
          
          <Button className="h-20 bg-muted/30 hover:bg-muted/50 card-hover animate-scale-in flex-col space-y-2" style={{ animationDelay: '0.7s' }}>
            <Shield className="w-6 h-6 text-primary" />
            <span className="text-sm font-medium text-primary">Safety</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DriverQuickActions;