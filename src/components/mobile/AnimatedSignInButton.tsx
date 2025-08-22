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
      className={`Btn ${isExpanded ? 'expanded' : ''} ${className}`}
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      title={text}
      disabled={isLoading}
    >
      <div className="sign">
        {isLoading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        ) : (
          <LogIn size={17} />
        )}
      </div>
      <div className="text">
        {isLoading ? "Signing in..." : text}
      </div>
    </button>
  );
};

export default AnimatedSignInButton;
