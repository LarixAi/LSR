import React, { useState, useEffect } from 'react';
import { CheckCircle, X, MessageSquare } from 'lucide-react';

interface KairoNotificationProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  onOpenMessage: () => void;
}

export const KairoNotification: React.FC<KairoNotificationProps> = ({
  message,
  isVisible,
  onClose,
  onOpenMessage
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] animate-in slide-in-from-right duration-300">
      <div 
        className="card cursor-pointer hover:shadow-lg transition-shadow duration-200"
        onClick={onOpenMessage}
      >
        <svg className="wave" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        
        <div className="icon-container">
          <CheckCircle className="icon" />
        </div>
        
        <div className="message-text-container">
          <p className="message-text">Message Sent</p>
          <p className="sub-text">{message.length > 50 ? `${message.substring(0, 50)}...` : message}</p>
        </div>
        
        <X 
          className="cross-icon hover:text-gray-700 transition-colors duration-200" 
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        />
      </div>
    </div>
  );
};



