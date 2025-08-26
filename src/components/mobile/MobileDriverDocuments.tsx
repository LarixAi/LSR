import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  Upload, 
  Download, 
  Eye, 
  Search,
  Filter,
  Calendar,
  User,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  RefreshCw,
  SortAsc,
  SortDesc,
  Grid,
  List,
  File,
  Image,
  Archive,
  Shield,
  Info,
  Camera,
  X,
  AlertCircle,
  CheckCircle2,
  Clock3,
  FileX
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import ResponsiveScaffold from './ResponsiveScaffold';
import { useToast } from '@/hooks/use-toast';
import { format, isAfter, isBefore, addDays, differenceInDays } from 'date-fns';
import { useDriverDocuments, useUploadDriverDocument, type DriverDocument } from '@/hooks/useDriverDocuments';

interface DriverDocument {
  id: string;
  name: string;
  type: string;
  category: string;
  status: 'required' | 'uploaded' | 'approved' | 'expired' | 'pending_review';
  requestedBy: string;
  requestedAt: string;
  dueDate?: string;
  uploadedAt?: string;
  fileUrl?: string;
  description?: string;
  isUrgent: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

const MobileDriverDocuments = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [sortBy, setSortBy] = useState<'name' | 'dueDate' | 'status' | 'priority'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DriverDocument | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadNotes, setUploadNotes] = useState('');

  // Fetch driver documents from backend
  const { data: driverDocuments = [], isLoading, error, refetch } = useDriverDocuments();
  const uploadDocument = useUploadDriverDocument();

  // Filter documents
  const filteredDocuments = driverDocuments.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Sort documents
  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'dueDate':
        if (!a.due_date && !b.due_date) comparison = 0;
        else if (!a.due_date) comparison = 1;
        else if (!b.due_date) comparison = -1;
        else comparison = new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
      case 'priority':
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'uploaded': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending_review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'required': return 'bg-red-100 text-red-800 border-red-200';
      case 'expired': return 'bg-muted text-muted-foreground border-border';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle2 className="w-4 h-4" />;
      case 'uploaded': return <Upload className="w-4 h-4" />;
      case 'pending_review': return <Clock3 className="w-4 h-4" />;
      case 'required': return <AlertCircle className="w-4 h-4" />;
      case 'expired': return <FileX className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-muted';
    }
  };

  const handleUpload = (document: DriverDocument) => {
    setSelectedDocument(document);
    setIsUploadDialogOpen(true);
  };

  const handleView = (document: DriverDocument) => {
    if (document.file_url) {
      window.open(document.file_url, '_blank');
    } else {
      toast({
        title: "No file available",
        description: "This document hasn't been uploaded yet.",
        variant: "destructive"
      });
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile || !selectedDocument) return;

    try {
      await uploadDocument.mutateAsync({
        documentId: selectedDocument.id,
        file: selectedFile,
        notes: uploadNotes
      });
      
      setIsUploadDialogOpen(false);
      setSelectedFile(null);
      setUploadNotes('');
      setSelectedDocument(null);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const categories = [
    { id: 'License', name: 'License Documents' },
    { id: 'Medical', name: 'Medical Certificates' },
    { id: 'Training', name: 'Training Certificates' },
    { id: 'Insurance', name: 'Insurance Documents' },
    { id: 'Background', name: 'Background Checks' },
    { id: 'Other', name: 'Other Documents' }
  ];

  const statuses = [
    { id: 'required', name: 'Required' },
    { id: 'uploaded', name: 'Uploaded' },
    { id: 'pending_review', name: 'Pending Review' },
    { id: 'approved', name: 'Approved' },
    { id: 'expired', name: 'Expired' }
  ];

  const urgentDocuments = sortedDocuments.filter(doc => doc.is_urgent || doc.status === 'required');
  const regularDocuments = sortedDocuments.filter(doc => !doc.is_urgent && doc.status !== 'required');

  if (isLoading) {
    return (
      <ResponsiveScaffold>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-gray-600 mobile-text-responsive">Loading documents...</p>
          </div>
        </div>
      </ResponsiveScaffold>
    );
  }

  if (error) {
    return (
      <ResponsiveScaffold>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-4" />
            <p className="text-gray-600 mobile-text-responsive">Failed to load documents.</p>
            <Button onClick={() => refetch()} className="mt-4 mobile-button">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </ResponsiveScaffold>
    );
  }

  return (
    <ResponsiveScaffold
      className="bg-gradient-to-br from-blue-50 via-white to-indigo-50"
      scrollable={true}
      padding="medium"
    >
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mobile-text-xl">My Documents</h1>
            <p className="text-gray-600 mobile-text-responsive">
              {sortedDocuments.length} documents • {urgentDocuments.length} require attention
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="mobile-button"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mobile-input pl-10"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="mobile-button"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
              className="mobile-button"
            >
              {viewMode === 'list' ? <Grid className="w-4 h-4" /> : <List className="w-4 h-4" />}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="mobile-button"
            >
              {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            </Button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="space-y-3 p-4 bg-card rounded-lg border border-border">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full p-2 border rounded-md mobile-input"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full p-2 border rounded-md mobile-input"
                >
                  <option value="all">All Status</option>
                  {statuses.map(status => (
                    <option key={status.id} value={status.id}>
                      {status.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Urgent Documents */}
      {urgentDocuments.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold mobile-text-large text-red-700 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Requires Attention ({urgentDocuments.length})
          </h2>
          
          <div className="space-y-3">
            {urgentDocuments.map((document) => (
              <Card key={document.id} className="mobile-card border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(document.priority)}`}></div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium mobile-text-responsive truncate">
                            {document.name}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {document.category} • {document.description}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge className={getStatusColor(document.status)}>
                              <div className="flex items-center space-x-1">
                                {getStatusIcon(document.status)}
                                <span className="text-xs">{document.status.replace('_', ' ')}</span>
                              </div>
                            </Badge>
                            {document.isUrgent && (
                              <Badge variant="destructive" className="text-xs">
                                Urgent
                              </Badge>
                            )}
                          </div>
                                                     <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                             <span className="flex items-center space-x-1">
                               <User className="w-3 h-3" />
                               <span>Requested by Admin</span>
                             </span>
                             {document.due_date && (
                               <span className="flex items-center space-x-1">
                                 <Calendar className="w-3 h-3" />
                                 <span>Due: {format(new Date(document.due_date), 'MMM dd, yyyy')}</span>
                               </span>
                             )}
                           </div>
                         </div>
                         
                         <div className="flex items-center space-x-1">
                           {document.status === 'required' ? (
                             <Button
                               variant="default"
                               size="sm"
                               onClick={() => handleUpload(document)}
                               className="mobile-button bg-red-600 hover:bg-red-700"
                             >
                               <Upload className="w-4 h-4" />
                             </Button>
                           ) : (
                             <>
                               <Button
                                 variant="ghost"
                                 size="sm"
                                 onClick={() => handleView(document)}
                                 className="mobile-button p-1"
                               >
                                 <Eye className="w-4 h-4" />
                               </Button>
                               <Button
                                 variant="ghost"
                                 size="sm"
                                 onClick={() => handleUpload(document)}
                                 className="mobile-button p-1"
                               >
                                 <Upload className="w-4 h-4" />
                               </Button>
                             </>
                           )}
                         </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Regular Documents */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold mobile-text-large">All Documents</h2>
        
        {regularDocuments.length === 0 ? (
          <Card className="mobile-card">
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mobile-text-responsive">
                {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                  ? 'No documents match your filters'
                  : 'No other documents available'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 gap-4' : 'space-y-3'}>
            {regularDocuments.map((document) => (
              <Card key={document.id} className="mobile-card">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(document.priority)}`}></div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium mobile-text-responsive truncate">
                            {document.name}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {document.category} • {document.description}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge className={getStatusColor(document.status)}>
                              <div className="flex items-center space-x-1">
                                {getStatusIcon(document.status)}
                                <span className="text-xs">{document.status.replace('_', ' ')}</span>
                              </div>
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                            <span className="flex items-center space-x-1">
                              <User className="w-3 h-3" />
                              <span>Requested by {document.requestedBy}</span>
                            </span>
                            {document.dueDate && (
                              <span className="flex items-center space-x-1">
                                <Calendar className="w-3 h-3" />
                                <span>Due: {format(new Date(document.dueDate), 'MMM dd, yyyy')}</span>
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(document)}
                            className="mobile-button p-1"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpload(document)}
                            className="mobile-button p-1"
                          >
                            <Upload className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Upload Dialog */}
      {isUploadDialogOpen && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg p-4 w-full max-w-md max-h-[90vh] overflow-y-auto border border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Upload Document</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsUploadDialogOpen(false)}
                className="p-1"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>{selectedDocument.name}</strong>
                </p>
                <p className="text-xs text-gray-500">
                  {selectedDocument.description}
                </p>
              </div>
              
              <div className="space-y-3">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="w-full">
                  <Button variant="outline" className="w-full mobile-button">
                    <FileText className="w-4 h-4 mr-2" />
                    Choose File
                  </Button>
                </label>
                {selectedFile && (
                  <div className="p-2 bg-muted rounded text-sm">
                    <p className="font-medium">Selected: {selectedFile.name}</p>
                    <p className="text-gray-600">Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                )}
                <textarea
                  placeholder="Add notes (optional)"
                  value={uploadNotes}
                  onChange={(e) => setUploadNotes(e.target.value)}
                  className="w-full p-2 border rounded-md mobile-input"
                  rows={3}
                  style={{
                    fontSize: '16px',
                    lineHeight: '1.4',
                    resize: 'none',
                    minHeight: '80px'
                  }}
                />
              </div>
              
              <div className="flex space-x-2 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 mobile-button"
                  onClick={() => {
                    setIsUploadDialogOpen(false);
                    setSelectedFile(null);
                    setUploadNotes('');
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 mobile-button"
                  onClick={handleUploadSubmit}
                  disabled={!selectedFile || uploadDocument.isPending}
                >
                  {uploadDocument.isPending ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    'Upload'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ResponsiveScaffold>
  );
};

export default MobileDriverDocuments;
