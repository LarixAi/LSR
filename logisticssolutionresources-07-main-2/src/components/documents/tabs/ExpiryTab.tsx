
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import DocumentExpiryTracker from '@/components/documents/DocumentExpiryTracker';

interface Document {
  id: string;
  name: string;
  type: string;
  category: string;
  file_size?: string;
  upload_date: string;
  expiry_date?: string;
  status?: string;
  profiles?: { first_name: string; last_name: string } | null;
}

interface ExpiryTabProps {
  documents: Document[];
}

const ExpiryTab = ({ documents }: ExpiryTabProps) => {
  return (
    <TabsContent value="expiry" className="space-y-6">
      <DocumentExpiryTracker documents={documents} />
    </TabsContent>
  );
};

export default ExpiryTab;
