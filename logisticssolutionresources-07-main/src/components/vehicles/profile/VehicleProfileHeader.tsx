
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const VehicleProfileHeader = () => {
  return (
    <div className="flex items-center gap-4 mb-6">
      <Link to="/vehicle-management">
        <Button variant="outline" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </Link>
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Vehicle Profile</h1>
        <p className="text-gray-600">Detailed information and history</p>
      </div>
    </div>
  );
};

export default VehicleProfileHeader;
