import React from 'react';
import MobileSettings from './MobileSettings';

const MobileSettingsTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 mb-4">
        <h2 className="text-lg font-semibold mb-4">Mobile Settings Test</h2>
        <p className="text-sm text-gray-600 mb-4">
          This is a test page to verify the mobile settings component is working correctly.
          The mobile settings should appear below with proper mobile optimization.
        </p>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm">Mobile-optimized layout</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm">Touch-friendly interface</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span className="text-sm">Role-based settings</span>
          </div>
        </div>
      </div>
      
      {/* The mobile settings component */}
      <MobileSettings />
    </div>
  );
};

export default MobileSettingsTest;

