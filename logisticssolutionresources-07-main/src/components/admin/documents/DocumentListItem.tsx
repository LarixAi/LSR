
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Download, 
  Eye, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Calendar 
} from 'lucide-react';

interface DocumentListItemProps {
  document: {
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
  };
}

const DocumentListItem = ({ document }: DocumentListItemProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'expiring_soon': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <AlertTriangle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'expiring_soon': return <Calendar className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
      <div className="flex-1">
        <div className="flex items-center space-x-3">
          <FileText className="w-5 h-5 text-gray-400" />
          <div>
            <h4 className="font-medium">{document.type || 'Document'}</h4>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              {document.category && (
                <span>Category: {document.category}</span>
              )}
              {document.profiles && (
                <span>• Uploaded by: {document.profiles.first_name} {document.profiles.last_name}</span>
              )}
              {document.related_entity_type && (
                <span>• Type: {document.related_entity_type}</span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="text-right">
          <Badge className={getStatusColor(document.status || 'pending')}>
            <span className="flex items-center space-x-1">
              {getStatusIcon(document.status || 'pending')}
              <span className="capitalize">{document.status || 'pending'}</span>
            </span>
          </Badge>
          <p className="text-sm text-gray-500 mt-1">
            {new Date(document.uploaded_at).toLocaleDateString()}
          </p>
        </div>
        
        <div className="flex space-x-1">
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4" />
          </Button>
          {document.status === 'pending' && (
            <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700">
              Review
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentListItem;
