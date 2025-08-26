import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare } from 'lucide-react';
import { AdvancedMessagingSystem } from './AdvancedMessagingSystem';

interface MessagingTriggerProps {
  unreadCount?: number;
}

export const MessagingTrigger: React.FC<MessagingTriggerProps> = ({
  unreadCount = 0
}) => {
  const [isMessagingOpen, setIsMessagingOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsMessagingOpen(true)}
        className="relative h-10 w-10 p-0"
      >
        <MessageSquare className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      <AdvancedMessagingSystem
        isOpen={isMessagingOpen}
        onClose={() => setIsMessagingOpen(false)}
      />
    </>
  );
};


