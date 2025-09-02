import React from 'react';
import StandardPageLayout from '@/components/layout/StandardPageLayout';

interface DriverLayoutProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
}

const DriverLayout: React.FC<DriverLayoutProps> = ({ title = 'Driver', description, children }) => {
  return (
    <StandardPageLayout
      title={title}
      description={description}
      showMetricsDashboard={false}
    >
      {children}
    </StandardPageLayout>
  );
};

export default DriverLayout;


