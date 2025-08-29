import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useVehicleDocuments } from '@/hooks/useVehicleManagement';
import { 
  ArrowLeft, 
  FileText, 
  Calendar, 
  Download, 
  Eye, 
  Edit, 
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Building,
  Tag,
  Shield,
  ExternalLink,
  File,
  FileImage,
  FileArchive
} from 'lucide-react';
import { format } from 'date-fns';

export default function DocumentViewer() {
  const { documentId, vehicleId } = useParams<{ documentId: string; vehicleId: string }>();
  const navigate = useNavigate();
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch documents from backend
  const { data: documents = [] } = useVehicleDocuments(vehicleId || '');

  useEffect(() => {
    setLoading(true);
    
    // Find the document by ID from real data
    const foundDocument = documents.find(doc => doc.id === documentId);
    
    if (foundDocument) {
      setDocument(foundDocument);
      setError(null);
    } else {
      setError('Document not found');
    }
    setLoading(false);
  }, [documentId, documents]);

  const getFileIcon = (fileType: string) => {
    switch (fileType?.toLowerCase()) {
      case 'pdf':
        return <FileText className="w-8 h-8 text-red-500" />;
      case 'image':
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <FileImage className="w-8 h-8 text-blue-500" />;
      case 'zip':
      case 'rar':
        return <FileArchive className="w-8 h-8 text-purple-500" />;
      default:
        return <File className="w-8 h-8 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'valid':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'expired':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'valid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleDownload = () => {
    // Simulate download
    console.log('Downloading document:', document?.document_name);
    // In a real app, this would trigger a file download
  };

  const handleView = () => {
    // Simulate opening document in new tab
    window.open(document?.file_url, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FileText className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading document...</p>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error || 'Document not found'}</p>
          <Button onClick={() => navigate(`/vehicles/${vehicleId}`)} className="mt-4">
            Back to Vehicle
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(`/vehicles/${vehicleId}`)} className="p-0">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm text-gray-600">Vehicle Documents</span>
      </div>

      {/* Document Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {getFileIcon(document.file_type)}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{document.document_name}</h1>
            <p className="text-gray-600">{document.document_type}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleView}>
            <Eye className="w-4 h-4 mr-2" />
            View
          </Button>
          <Button variant="outline" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document Preview */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Document Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Document Preview</h3>
                <p className="text-gray-600 mb-4">
                  Click "View" to open the document in a new tab or "Download" to save it locally.
                </p>
                <div className="flex justify-center gap-3">
                  <Button onClick={handleView}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Document
                  </Button>
                  <Button variant="outline" onClick={handleDownload}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Document Details */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Document Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                {getStatusIcon(document.status)}
                <Badge className={getStatusColor(document.status)}>
                  {document.status}
                </Badge>
              </div>
              {document.expiry_date && (
                <div className="text-sm">
                  <span className="text-gray-500">Expires:</span>
                  <p className="font-medium">{format(new Date(document.expiry_date), 'MMM dd, yyyy')}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* File Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <File className="w-5 h-5" />
                File Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">File Type:</span>
                <span className="font-medium">{document.file_type}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">File Size:</span>
                <span className="font-medium">{document.file_size}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Uploaded:</span>
                <span className="font-medium">{format(new Date(document.uploaded_at), 'MMM dd, yyyy')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Uploaded By:</span>
                <span className="font-medium">{document.uploaded_by}</span>
              </div>
            </CardContent>
          </Card>

          {/* Document Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Document Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-sm text-gray-600">{document.description}</p>
              </div>
              
              {document.notes && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                  <p className="text-sm text-gray-600">{document.notes}</p>
                </div>
              )}

              {document.tags && document.tags.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {document.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" onClick={handleView}>
                <Eye className="w-4 h-4 mr-2" />
                View Document
              </Button>
              <Button variant="outline" className="w-full" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" className="w-full">
                <Edit className="w-4 h-4 mr-2" />
                Edit Details
              </Button>
              <Button variant="outline" className="w-full text-red-600 hover:text-red-700">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Document
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
