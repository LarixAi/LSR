import React from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useSidebar } from '@/components/ui/sidebar';

interface SafeSidebarTriggerProps {
  className?: string;
}

const SafeSidebarTrigger: React.FC<SafeSidebarTriggerProps> = ({ className }) => {
  try {
    // Try to access the sidebar context
    useSidebar();
    return <SidebarTrigger className={className} />;
  } catch (error) {
    // If not within SidebarProvider, don't render the trigger
    return null;
  }
};

export default SafeSidebarTrigger;