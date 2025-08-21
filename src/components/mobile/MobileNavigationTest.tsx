import React from 'react';
import MobileNavigationEnhanced from './MobileNavigationEnhanced';

const MobileNavigationTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 mb-4">
        <h2 className="text-lg font-semibold mb-4">Mobile Navigation Test</h2>
        <p className="text-sm text-gray-600 mb-4">
          This is a test page to verify the enhanced mobile navigation is working correctly.
          The navigation should appear at the bottom of the screen on mobile devices.
        </p>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm">Enhanced animations</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm">Red vehicle check icon</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-sm">Mobile optimization</span>
          </div>
        </div>
      </div>
      
      {/* The enhanced navigation will appear at the bottom */}
      <MobileNavigationEnhanced />
    </div>
  );
};

export default MobileNavigationTest;

