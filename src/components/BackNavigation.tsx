import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BackNavigationProps {
  title?: string;
  showHome?: boolean;
}

const BackNavigation: React.FC<BackNavigationProps> = ({ title, showHome = true }) => {
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-700 hover:text-black hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
            {title && (
              <div className="hidden sm:block">
                <span className="text-gray-400 mx-2">•</span>
                <span className="text-gray-700 font-medium">{title}</span>
              </div>
            )}
          </div>
          
          {showHome && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-700 hover:text-black hover:bg-gray-50"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BackNavigation;
