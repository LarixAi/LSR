import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface PageLoaderProps {
  text?: string;
}

const PageLoader: React.FC<PageLoaderProps> = ({ text = 'Loading...' }) => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="text-center">
        <LoadingSpinner size="lg" text={text} />
      </div>
    </div>
  );
};

export default PageLoader;