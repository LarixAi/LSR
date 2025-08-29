
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserCheck, Gavel, Clock, DollarSign } from 'lucide-react';

interface JobAssignmentTypeSelectorProps {
  onSelectType: (type: 'direct' | 'bidding') => void;
}

const JobAssignmentTypeSelector: React.FC<JobAssignmentTypeSelectorProps> = ({ onSelectType }) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">How would you like to assign this job?</h3>
        <p className="text-gray-600">Choose whether to assign directly to a driver or open for bidding</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserCheck className="w-5 h-5 text-blue-600" />
              <span>Direct Assignment</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Assign the job directly to a specific driver with a fixed payment amount.
            </p>
            <ul className="text-sm text-gray-500 space-y-1 mb-4">
              <li>• Immediate assignment</li>
              <li>• Fixed payment</li>
              <li>• No bidding process</li>
              <li>• Quick and simple</li>
            </ul>
            <Button 
              onClick={() => onSelectType('direct')} 
              className="w-full"
              variant="outline"
            >
              Assign Directly
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Gavel className="w-5 h-5 text-green-600" />
              <span>Open for Bidding</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Let available drivers bid on the job with their proposed rates.
            </p>
            <ul className="text-sm text-gray-500 space-y-1 mb-4">
              <li>• Competitive bidding</li>
              <li>• Potentially lower costs</li>
              <li>• Driver choice flexibility</li>
              <li>• Market-driven pricing</li>
            </ul>
            <Button 
              onClick={() => onSelectType('bidding')} 
              className="w-full"
              variant="outline"
            >
              Open for Bidding
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JobAssignmentTypeSelector;
