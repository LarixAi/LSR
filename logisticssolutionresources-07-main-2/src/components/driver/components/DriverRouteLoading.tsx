
import React from 'react';

interface DriverRouteLoadingProps {
  userId?: string;
}

const DriverRouteLoading: React.FC<DriverRouteLoadingProps> = ({ userId }) => {
  return (
    <div className="flex items-center justify-center min-h-64">
      <div className="text-center">
        <div className="text-lg">Loading route information...</div>
        <div className="text-sm text-gray-500 mt-2">User ID: {userId}</div>
      </div>
    </div>
  );
};

export default DriverRouteLoading;
