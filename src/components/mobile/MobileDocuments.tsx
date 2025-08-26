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
  Star,
  MoreHorizontal,
  Plus,
  RefreshCw,
  SortAsc,
  SortDesc,
  Grid,
  List,
  FolderOpen,
  File,
  Image,
  Archive,
  Tag,
  Shield,
  Info
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useDocuments } from '@/hooks/useDocuments';
import ResponsiveScaffold from './ResponsiveScaffold';
import { useToast } from '@/hooks/use-toast';
import { format, isAfter, isBefore, addDays, differenceInDays } from 'date-fns';

interface Document {
  id: string;
  name: string;
  type: string;
  category: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  status: 'approved' | 'pending' | 'rejected' | 'expired' | 'active' | 'archived';
  expiryDate?: string;
  tags: string[];
  isConfidential: boolean;
  downloadCount: number;
  description?: string;
  version?: string;
  department?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  isFavorite: boolean;
  fileUrl?: string;
  thumbnailUrl?: string;
}

const MobileDocuments = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);

  const { data: documents = [], isLoading, error, refetch } = useDocuments();

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Transform backend data to match the interface
  const transformedDocuments: Document[] = documents.map(doc => ({
    id: doc.id,
    name: doc.name,
    type: doc.file_type?.toUpperCase() || 'UNKNOWN',
    category: doc.category || 'other',
    size: formatFileSize(doc.file_size),
    uploadedBy: doc.uploaded_by || 'Unknown',
    uploadedAt: doc.created_at,
    status: doc.status as 'approved' | 'pending' | 'rejected' | 'expired' | 'active' | 'archived' || 'pending',
    expiryDate: doc.expiry_date,
    tags: doc.tags || [],
    isConfidential: !doc.is_public,
    downloadCount: doc.download_count || 0,
    description: doc.description,
    version: doc.version,
    department: doc.department,
    priority: doc.priority as 'low' | 'medium' | 'high' | 'critical' || 'medium',
    isFavorite: doc.is_favorite,
    fileUrl: doc.file_path,
    thumbnailUrl: doc.thumbnail_url
  }));

  // Filter documents
  const filteredDocuments = transformedDocuments.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Sort documents
  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'date':
        comparison = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
        break;
      case 'status':
        comparison = a.status.localeCompare(b.status);
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'expired': return 'bg-muted text-muted-foreground border-border';
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'archived': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'rejected': return <AlertTriangle className="w-4 h-4" />;
      case 'expired': return <Calendar className="w-4 h-4" />;
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'archived': return <Archive className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getFileIcon = (type: string) => {
    if (type.includes('PDF')) return <FileText className="w-5 h-5 text-red-500" />;
    if (type.includes('IMAGE') || type.includes('JPG') || type.includes('PNG')) return <Image className="w-5 h-5 text-blue-500" />;
    if (type.includes('DOC') || type.includes('DOCX')) return <FileText className="w-5 h-5 text-blue-600" />;
    if (type.includes('XLS') || type.includes('XLSX')) return <FileText className="w-5 h-5 text-green-600" />;
    return <File className="w-5 h-5 text-gray-500" />;
  };

  const handleDownload = (document: Document) => {
    if (document.fileUrl) {
      window.open(document.fileUrl, '_blank');
      toast({
        title: "Download Started",
        description: `${document.name} is being downloaded.`,
      });
    } else {
      toast({
        title: "Download Error",
        description: "File URL not available.",
        variant: "destructive"
      });
    }
  };

  const handleView = (document: Document) => {
    if (document.fileUrl) {
      window.open(document.fileUrl, '_blank');
    } else {
      toast({
        title: "View Error",
        description: "File URL not available.",
        variant: "destructive"
      });
    }
  };

  const categories = [
    { id: 'compliance', name: 'Compliance Documents' },
    { id: 'vehicle', name: 'Vehicle Documents' },
    { id: 'driver', name: 'Driver Documents' },
    { id: 'route', name: 'Route Documents' },
    { id: 'maintenance', name: 'Maintenance Records' },
    { id: 'insurance', name: 'Insurance Documents' },
    { id: 'other', name: 'Other Documents' }
  ];

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
            <h1 className="text-2xl font-bold text-gray-900 mobile-text-xl">Documents</h1>
            <p className="text-gray-600 mobile-text-responsive">
              {sortedDocuments.length} documents available
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
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
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                  <option value="expired">Expired</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Documents List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold mobile-text-large">Documents</h2>
        
        {sortedDocuments.length === 0 ? (
          <Card className="mobile-card">
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mobile-text-responsive">
                {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                  ? 'No documents match your filters'
                  : 'No documents available'
                }
              </p>
              {!searchTerm && categoryFilter === 'all' && statusFilter === 'all' && (
                <Button className="mt-4 mobile-button">
                  <Plus className="w-4 h-4 mr-2" />
                  Upload Document
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 gap-4' : 'space-y-3'}>
            {sortedDocuments.map((document) => (
              <Card key={document.id} className="mobile-card">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {getFileIcon(document.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium mobile-text-responsive truncate">
                            {document.name}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {document.category} • {document.size}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge className={getStatusColor(document.status)}>
                              <div className="flex items-center space-x-1">
                                {getStatusIcon(document.status)}
                                <span className="text-xs">{document.status}</span>
                              </div>
                            </Badge>
                            {document.isConfidential && (
                              <Badge variant="outline" className="text-xs">
                                <Shield className="w-3 h-3 mr-1" />
                                Confidential
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                            <span className="flex items-center space-x-1">
                              <User className="w-3 h-3" />
                              <span>{document.uploadedBy}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>{format(new Date(document.uploadedAt), 'MMM dd, yyyy')}</span>
                            </span>
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
                            onClick={() => handleDownload(document)}
                            className="mobile-button p-1"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {document.expiryDate && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500">
                            Expires: {format(new Date(document.expiryDate), 'MMM dd, yyyy')}
                            {isBefore(new Date(document.expiryDate), new Date()) && (
                              <span className="text-red-500 ml-2">(Expired)</span>
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </ResponsiveScaffold>
  );
};

export default MobileDocuments;
