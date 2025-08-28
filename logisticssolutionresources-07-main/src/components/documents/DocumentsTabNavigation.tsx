
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const DocumentsTabNavigation = () => {
  return (
    <TabsList className="grid w-full grid-cols-5">
      <TabsTrigger value="overview">Overview</TabsTrigger>
      <TabsTrigger value="browse">Browse</TabsTrigger>
      <TabsTrigger value="expiry">Expiry Tracker</TabsTrigger>
      <TabsTrigger value="approval">Approval Queue</TabsTrigger>
      <TabsTrigger value="compliance">Compliance</TabsTrigger>
    </TabsList>
  );
};

export default DocumentsTabNavigation;
