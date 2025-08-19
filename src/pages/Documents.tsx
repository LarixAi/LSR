import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Plus, 
  Search,
  Upload,
  Download,
  Eye,
  Edit,
  Share2,
  Lock,
  Calendar,
  Users,
  CheckCircle,
  AlertTriangle,
  Clock,
  Settings,
  FolderOpen,
  File,
  Image,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { useDocuments, useCreateDocument, useUpdateDocument, useDeleteDocument } from '@/hooks/useDocuments';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface Document {
  id: string;
  name: string;
  type: string;
  category: string;
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  status: 'approved' | 'pending' | 'rejected' | 'expired' | 'active';
  expiryDate?: string;
  tags: string[];
  isConfidential: boolean;
  downloadCount: number;
}

const Documents: React.FC = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState<boolean>(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false);

  // Fetch real data from backend
  const { data: documents = [], isLoading: documentsLoading, error, refetch } = useDocuments();
  const createDocument = useCreateDocument();
  const updateDocument = useUpdateDocument();
  const deleteDocument = useDeleteDocument();

  if (authLoading || documentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-lg">Loading document management...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/auth" replace />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Documents</h3>
          <p className="text-red-700 mb-4">{error.message}</p>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Transform backend data to match the interface
  const transformedDocuments: Document[] = documents.map(doc => ({
    id: doc.id,
    name: doc.name,
    type: doc.file_type?.toUpperCase() || 'UNKNOWN',
    category: doc.category || 'other',
    size: formatFileSize(doc.file_size),
    uploadedBy: doc.uploaded_by || 'Unknown',
    uploadedAt: doc.created_at,
    status: doc.status as 'approved' | 'pending' | 'rejected' | 'expired' | 'active' || 'pending',
    expiryDate: doc.expiry_date,
    tags: doc.tags || [],
    isConfidential: !doc.is_public,
    downloadCount: doc.download_count || 0
  }));

  // Calculate categories from real data
  const categoryCounts = transformedDocuments.reduce((acc, doc) => {
    acc[doc.category] = (acc[doc.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categories = [
    { id: 'compliance', name: 'Compliance Documents', count: categoryCounts.compliance || 0 },
    { id: 'insurance', name: 'Insurance & Certificates', count: categoryCounts.insurance || 0 },
    { id: 'vehicle', name: 'Vehicle Documents', count: categoryCounts.vehicle || 0 },
    { id: 'driver', name: 'Driver Documents', count: categoryCounts.driver || 0 },
    { id: 'operational', name: 'Operational Documents', count: categoryCounts.operational || 0 },
    { id: 'financial', name: 'Financial Documents', count: categoryCounts.financial || 0 },
    { id: 'other', name: 'Other Documents', count: categoryCounts.other || 0 }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      approved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      rejected: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800',
      active: 'bg-blue-100 text-blue-800'
    };
    
    return (
      <Badge className={statusConfig[status as keyof typeof statusConfig] || 'bg-gray-100 text-gray-800'}>
        {status}
      </Badge>
    );
  };

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-red-600" />;
      case 'xlsx':
      case 'xls':
        return <File className="w-4 h-4 text-green-600" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <Image className="w-4 h-4 text-purple-600" />;
      default:
        return <File className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredDocuments = transformedDocuments.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const documentStats = {
    totalDocuments: transformedDocuments.length,
    approvedDocuments: transformedDocuments.filter(d => d.status === 'approved' || d.status === 'active').length,
    pendingDocuments: transformedDocuments.filter(d => d.status === 'pending').length,
    confidentialDocs: transformedDocuments.filter(d => d.isConfidential).length
  };

  const handleViewDocument = (document: any) => {
    setSelectedDocument(document);
    setIsViewDialogOpen(true);
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      try {
        await deleteDocument.mutateAsync(documentId);
        toast({
          title: "Document Deleted",
          description: "Document has been successfully deleted.",
        });
      } catch (error) {
        toast({
          title: "Delete Failed",
          description: "Failed to delete document. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FolderOpen className="w-8 h-8 text-blue-600" />
            Document Management
          </h1>
          <p className="text-gray-600 mt-1">Organize, manage, and track all company documents</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => refetch()} variant="outline" disabled={documentsLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${documentsLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Upload New Document</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="document-name">Document Name</Label>
                  <Input id="document-name" placeholder="Enter document name" />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="file-upload">Select Files</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      Drag and drop files here, or click to browse
                    </p>
                    <Button variant="outline" size="sm">
                      Select Files
                    </Button>
                  </div>
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Upload Document
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Documents</p>
                <p className="text-2xl font-bold">{documentStats.totalDocuments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">{documentStats.approvedDocuments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{documentStats.pendingDocuments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Lock className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Confidential</p>
                <p className="text-2xl font-bold text-purple-600">{documentStats.confidentialDocs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="documents" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="documents">All Documents</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Document Library
              </CardTitle>
              <div className="flex gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Uploaded By</TableHead>
                    <TableHead>Upload Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Downloads</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="text-center">
                          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">No documents found</p>
                          <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDocuments.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {getFileIcon(doc.type)}
                            <div>
                              <p className="font-medium">{doc.name}</p>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span>{doc.type}</span>
                                <span>•</span>
                                <span>{doc.size}</span>
                                {doc.isConfidential && (
                                  <>
                                    <span>•</span>
                                    <Lock className="w-3 h-3" />
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">
                          {categories.find(c => c.id === doc.category)?.name || doc.category}
                        </TableCell>
                        <TableCell>{doc.uploadedBy}</TableCell>
                        <TableCell>{new Date(doc.uploadedAt).toLocaleDateString()}</TableCell>
                        <TableCell>{getStatusBadge(doc.status)}</TableCell>
                        <TableCell>{doc.downloadCount}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleViewDocument(doc)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Share2 className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleDeleteDocument(doc.id)}>
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Card key={category.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-lg bg-gray-100">
                      <FolderOpen className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{category.name}</h3>
                      <p className="text-sm text-gray-600">{category.count} documents</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      View Documents
                    </Button>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Document Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Generate Document Reports</h3>
                <p className="text-gray-600 mb-6">
                  Create comprehensive reports on document compliance and usage analytics.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Generate Report
                  </Button>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Document View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Document Details</DialogTitle>
          </DialogHeader>
          {selectedDocument && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Document Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{selectedDocument.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span>{selectedDocument.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Size:</span>
                      <span>{selectedDocument.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="capitalize">{selectedDocument.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span>{getStatusBadge(selectedDocument.status)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Uploaded By:</span>
                      <span>{selectedDocument.uploadedBy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Upload Date:</span>
                      <span>{format(new Date(selectedDocument.uploadedAt), 'MMM dd, yyyy')}</span>
                    </div>
                    {selectedDocument.expiryDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Expiry Date:</span>
                        <span>{format(new Date(selectedDocument.expiryDate), 'MMM dd, yyyy')}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Downloads:</span>
                      <span>{selectedDocument.downloadCount}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Actions</h3>
                  <div className="space-y-2">
                    <Button className="w-full" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Download Document
                    </Button>
                    <Button className="w-full" variant="outline">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Document
                    </Button>
                    <Button className="w-full" variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Details
                    </Button>
                    <Button className="w-full" variant="outline" onClick={() => handleDeleteDocument(selectedDocument.id)}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Document
                    </Button>
                  </div>
                </div>
              </div>
              {selectedDocument.tags && selectedDocument.tags.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedDocument.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Documents;
