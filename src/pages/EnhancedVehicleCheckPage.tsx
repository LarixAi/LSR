import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import EnhancedVehicleCheck from '@/components/driver/EnhancedVehicleCheck';

const EnhancedVehicleCheckPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/vehicle-checks');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">Enhanced Vehicle Check</h1>
              <p className="text-sm text-muted-foreground">
                Comprehensive vehicle inspection system
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto p-4">
        <EnhancedVehicleCheck />
      </div>
    </div>
  );
};

export default EnhancedVehicleCheckPage;

