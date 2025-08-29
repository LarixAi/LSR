
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, AlertTriangle, Upload } from 'lucide-react';
import DocumentListItem from './DocumentListItem';

interface Document {
  id: string;
  type?: string;
  category?: string;
  status?: string;
  uploaded_at: string;
  related_entity_type?: string;
  profiles?: {
    first_name?: string;
    last_name?: string;
  } | null;
}

interface DocumentsListProps {
  documents: Document[];
  isLoading: boolean;
  error?: Error | null;
  searchTerm: string;
  statusFilter: string;
  categoryFilter: string;
}

const DocumentsList = ({ 
  documents, 
  isLoading, 
  error, 
  searchTerm, 
  statusFilter, 
  categoryFilter 
}: DocumentsListProps) => {
  const hasFiltersApplied = searchTerm || statusFilter !== 'all' || categoryFilter !== 'all';

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary mb-2"></div>
            <p className="text-sm text-gray-500">Loading documents...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 mx-auto text-red-400 mb-4" />
            <p className="text-red-600">Error loading documents: {error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization Documents</CardTitle>
        <CardDescription>
          {`${documents.length} documents found`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">
              {hasFiltersApplied 
                ? 'No documents match your filters' 
                : 'No documents uploaded yet for your organization'
              }
            </p>
            {!hasFiltersApplied && (
              <Button className="mt-4">
                <Upload className="w-4 h-4 mr-2" />
                Upload First Document
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map((document) => (
              <DocumentListItem key={document.id} document={document} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentsList;
