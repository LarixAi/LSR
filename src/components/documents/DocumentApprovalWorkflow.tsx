
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckCircle, XCircle, Clock, Eye, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Document {
  id: string;
  name: string;
  category: string;
  status?: string;
  upload_date: string;
  profiles?: { first_name: string; last_name: string } | null;
}

interface DocumentApprovalWorkflowProps {
  documents: Document[];
  onApproveDocument: (documentId: string, comments?: string) => void;
  onRejectDocument: (documentId: string, reason: string) => void;
}

const DocumentApprovalWorkflow = ({ 
  documents, 
  onApproveDocument, 
  onRejectDocument 
}: DocumentApprovalWorkflowProps) => {
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [reviewComments, setReviewComments] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const { toast } = useToast();

  // Filter documents that need approval
  const pendingDocuments = documents.filter(doc => 
    doc.status === 'pending_approval' || doc.status === 'valid'
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'pending_approval':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const handleApprove = (documentId: string) => {
    onApproveDocument(documentId, reviewComments);
    setSelectedDocument(null);
    setReviewComments('');
    toast({
      title: "Document Approved",
      description: "The document has been approved successfully.",
    });
  };

  const handleReject = (documentId: string) => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Rejection Reason Required",
        description: "Please provide a reason for rejecting the document.",
        variant: "destructive",
      });
      return;
    }
    
    onRejectDocument(documentId, rejectionReason);
    setSelectedDocument(null);
    setRejectionReason('');
    toast({
      title: "Document Rejected",
      description: "The document has been rejected with feedback.",
      variant: "destructive",
    });
  };

  const rejectionReasons = [
    'Document quality is poor/unreadable',
    'Document has expired',
    'Wrong document type uploaded',
    'Missing required information',
    'Document appears to be fraudulent',
    'Incorrect format or specifications',
    'Other (specify in comments)'
  ];

  if (pendingDocuments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span>Document Approval Queue</span>
          </CardTitle>
          <CardDescription>
            All documents have been reviewed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-gray-500">No documents pending approval</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-orange-600" />
          <span>Document Approval Queue</span>
          <Badge className="bg-orange-100 text-orange-800">
            {pendingDocuments.length} pending
          </Badge>
        </CardTitle>
        <CardDescription>
          Review and approve or reject uploaded documents
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pendingDocuments.map((doc) => (
            <div key={doc.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium">{doc.name}</h4>
                  <p className="text-sm text-gray-600">
                    {doc.category} • Uploaded {doc.upload_date}
                  </p>
                  <p className="text-sm text-gray-500">
                    By: {doc.profiles?.first_name} {doc.profiles?.last_name}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(doc.status || 'valid')}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedDocument(selectedDocument === doc.id ? null : doc.id)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Review
                  </Button>
                </div>
              </div>

              {selectedDocument === doc.id && (
                <div className="border-t pt-4 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Review Comments (Optional)</label>
                    <Textarea
                      value={reviewComments}
                      onChange={(e) => setReviewComments(e.target.value)}
                      placeholder="Add any comments about this document..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Rejection Reason (if rejecting)</label>
                    <Select value={rejectionReason} onValueChange={setRejectionReason}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a reason for rejection" />
                      </SelectTrigger>
                      <SelectContent>
                        {rejectionReasons.map((reason) => (
                          <SelectItem key={reason} value={reason}>
                            {reason}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => handleApprove(doc.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => handleReject(doc.id)}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setSelectedDocument(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentApprovalWorkflow;
