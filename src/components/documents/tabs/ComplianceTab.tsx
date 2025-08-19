
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ComplianceTab = () => {
  return (
    <TabsContent value="compliance" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Compliance Dashboard</CardTitle>
          <CardDescription>
            Monitor document compliance across all categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">Advanced compliance analytics coming soon</p>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
};

export default ComplianceTab;
