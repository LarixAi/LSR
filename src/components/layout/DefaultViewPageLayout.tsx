import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface DefaultViewPageLayoutProps {
  title: string;
  subtitle?: string;
  backUrl: string;
  backLabel?: string;
  rightContent?: React.ReactNode;
  navigationItems: {
    id: string;
    label: string;
  }[];
  children: React.ReactNode;
  isLoading?: boolean;
}

const DefaultViewPageLayout: React.FC<DefaultViewPageLayoutProps> = ({
  title,
  subtitle,
  backUrl,
  backLabel = 'Back',
  rightContent,
  navigationItems,
  children,
  isLoading = false
}) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate(backUrl)} 
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> {backLabel}
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                {subtitle && <p className="text-gray-600">{subtitle}</p>}
              </div>
            </div>
            {rightContent && (
              <div className="flex items-center gap-2">
                {rightContent}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Quick Navigation */}
        {navigationItems.length > 0 && (
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex flex-wrap gap-2">
              {navigationItems.map((item) => (
                <Button
                  key={item.id}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-xs"
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Page Content */}
        {children}
      </div>
    </div>
  );
};

export default DefaultViewPageLayout;
