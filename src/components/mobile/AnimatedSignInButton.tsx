import React, { useState } from 'react';
import { LogIn } from 'lucide-react';

interface AnimatedSignInButtonProps {
  onClick: (e: React.FormEvent) => void;
  text?: string;
  className?: string;
  isLoading?: boolean;
}

const AnimatedSignInButton: React.FC<AnimatedSignInButtonProps> = ({ 
  onClick, 
  text = "Sign In",
  className = "",
  isLoading = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClick = (e: React.FormEvent) => {
    onClick(e);
  };

  const handleTouchStart = () => {
    setIsExpanded(true);
  };

  const handleTouchEnd = () => {
    setTimeout(() => setIsExpanded(false), 300);
  };

  return (
    <button
      type="submit"
      className={`w-full h-12 bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-600 dark:to-gray-700 hover:from-gray-900 hover:to-black dark:hover:from-gray-500 dark:hover:to-gray-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 touch-target mobile-button-improved mobile-touch-improved ${isExpanded ? 'scale-95' : ''} ${className}`}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      title={text}
      disabled={isLoading}
    >
      <div className="flex items-center justify-center">
        {isLoading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
        ) : (
          <LogIn size={17} className="mr-2" />
        )}
      </div>
      <div className="text-sm font-medium">
        {isLoading ? "Signing in..." : text}
      </div>
    </button>
  );
};

export default AnimatedSignInButton;
