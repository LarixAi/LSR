
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import DocumentApprovalWorkflow from '@/components/documents/DocumentApprovalWorkflow';

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

interface ApprovalTabProps {
  documents: Document[];
  onApproveDocument: (documentId: string, comments?: string) => void;
  onRejectDocument: (documentId: string, reason: string) => void;
}

const ApprovalTab = ({
  documents,
  onApproveDocument,
  onRejectDocument
}: ApprovalTabProps) => {
  return (
    <TabsContent value="approval" className="space-y-6">
      <DocumentApprovalWorkflow
        documents={documents}
        onApproveDocument={onApproveDocument}
        onRejectDocument={onRejectDocument}
      />
    </TabsContent>
  );
};

export default ApprovalTab;
