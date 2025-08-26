import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
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
  Trash2,
  Filter,
  SortAsc,
  SortDesc,
  Grid,
  List,
  MoreHorizontal,
  Star,
  StarOff,
  Copy,
  ExternalLink,
  Archive,
  Tag,
  Shield,
  AlertCircle,
  Info,
  BarChart3,
  PieChart,
  TrendingUp,
  FileCheck,
  FileX,
  FileClock,
  FileAlert,
  FolderPlus,
  BookOpen,
  CalendarDays,
  UserCheck,
  Building2,
  Car,
  Truck,
  Bus,
  Train,
  Ship,
  Plane
} from 'lucide-react';
import { useDocuments, useCreateDocument, useUpdateDocument, useDeleteDocument } from '@/hooks/useDocuments';
import { format, isAfter, isBefore, addDays, differenceInDays } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { uploadFileToStorage } from '@/utils/fileUpload';
import { supabase } from '@/integrations/supabase/client';

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
  priority?: 'low' | 'medium' | 'high' | 'critical';
  isFavorite?: boolean;
  fileUrl?: string;
  thumbnailUrl?: string;
}

interface DocumentStats {
  total: number;
  approved: number;
  pending: number;
  expired: number;
  confidential: number;
  byCategory: Record<string, number>;
  byStatus: Record<string, number>;
  expiringSoon: number;
  recentlyUploaded: number;
}

const Documents: React.FC = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState<boolean>(false);
  const [isBulkUploadDialogOpen, setIsBulkUploadDialogOpen] = useState<boolean>(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'kanban'>('list');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'status' | 'priority' | 'expiry'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [isBulkActionDialogOpen, setIsBulkActionDialogOpen] = useState<boolean>(false);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [showExpiredOnly, setShowExpiredOnly] = useState<boolean>(false);
  const [showConfidentialOnly, setShowConfidentialOnly] = useState<boolean>(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);

  // Upload form state
  const [uploadFormData, setUploadFormData] = useState({
    name: '',
    category: '',
    description: '',
    expiryDate: '',
    tags: '',
    isConfidential: false,
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    department: '',
    version: '1.0'
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadingToCategory, setUploadingToCategory] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Fetch real data from backend
  const { data: documents = [], isLoading: documentsLoading, error, refetch } = useDocuments();
  const createDocument = useCreateDocument();
  const updateDocument = useUpdateDocument();
  const deleteDocument = useDeleteDocument();

  // Calculate document statistics
  const documentStats: DocumentStats = useMemo(() => {
    const stats = {
      total: documents.length,
      approved: 0,
      pending: 0,
      expired: 0,
      confidential: 0,
      byCategory: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
      expiringSoon: 0,
      recentlyUploaded: 0
    };

    const thirtyDaysFromNow = addDays(new Date(), 30);
    const sevenDaysAgo = addDays(new Date(), -7);

    documents.forEach(doc => {
      // Status counts
      stats.byStatus[doc.status] = (stats.byStatus[doc.status] || 0) + 1;
      if (doc.status === 'approved') stats.approved++;
      if (doc.status === 'pending') stats.pending++;
      if (doc.status === 'expired') stats.expired++;
      if (!doc.is_public) stats.confidential++;

      // Category counts
      const category = doc.category || 'other';
      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;

      // Expiring soon
      if (doc.expiry_date && isAfter(new Date(doc.expiry_date), new Date()) && isBefore(new Date(doc.expiry_date), thirtyDaysFromNow)) {
        stats.expiringSoon++;
      }

      // Recently uploaded
      if (new Date(doc.created_at) > sevenDaysAgo) {
        stats.recentlyUploaded++;
      }
    });

    return stats;
  }, [documents]);

  if (authLoading || documentsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
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
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Documents</h3>
          <p className="text-red-700 mb-4 text-sm">{error.message}</p>
          <Button onClick={() => refetch()} variant="outline" className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

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
      active: 'bg-blue-100 text-blue-800',
      archived: 'bg-gray-100 text-gray-800'
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

  // Sort and filter documents
  const sortedAndFilteredDocuments = transformedDocuments
    .filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || doc.priority === priorityFilter;
      const matchesExpiry = showExpiredOnly ? isAfter(new Date(doc.expiryDate || ''), new Date()) : true;
      const matchesConfidential = showConfidentialOnly ? !doc.isConfidential : true;
      const matchesFavorites = showFavoritesOnly ? doc.isFavorite : true;

      return matchesSearch && matchesCategory && matchesStatus && matchesPriority && matchesExpiry && matchesConfidential && matchesFavorites;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'date':
          aValue = new Date(a.uploadedAt).getTime();
          bValue = new Date(b.uploadedAt).getTime();
          break;
        case 'size':
          aValue = parseFloat(a.size.split(' ')[0]);
          bValue = parseFloat(b.size.split(' ')[0]);
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'priority':
          aValue = a.priority;
          bValue = b.priority;
          break;
        case 'expiry':
          aValue = a.expiryDate ? new Date(a.expiryDate).getTime() : 0;
          bValue = b.expiryDate ? new Date(b.expiryDate).getTime() : 0;
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const handleViewDocument = (document: Document) => {
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

  const handleUploadToCategory = (categoryId: string) => {
    setUploadingToCategory(categoryId);
    setUploadFormData(prev => ({ ...prev, category: categoryId }));
    setIsUploadDialogOpen(true);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
  };

  const handleUploadSubmit = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select at least one file to upload.",
        variant: "destructive",
      });
      return;
    }

    if (!uploadFormData.name.trim()) {
      toast({
        title: "Document Name Required",
        description: "Please enter a name for the document.",
        variant: "destructive",
      });
      return;
    }

    if (!profile?.organization_id || !profile?.id) {
      toast({
        title: "Authentication Error",
        description: "Please log in again to upload documents.",
        variant: "destructive",
      });
      return;
    }

    try {
      // For each selected file, upload to storage and create document record
      for (const file of selectedFiles) {
        // First, upload file to Supabase Storage
        console.log('Uploading file to storage:', {
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          organizationId: profile.organization_id,
          userId: profile.id
        });

        const uploadResult = await uploadFileToStorage(
          file,
          'documents', // bucket name
          'uploads',   // folder
          profile.organization_id,
          profile.id
        );

        if (!uploadResult.success) {
          console.error('Upload failed:', uploadResult.error);
          throw new Error(uploadResult.error || 'File upload failed');
        }

        console.log('File uploaded successfully:', uploadResult);

        // Then create the document record in the database
        const documentData = {
          name: uploadFormData.name,
          category: uploadFormData.category,
          description: uploadFormData.description,
          expiry_date: uploadFormData.expiryDate || null,
          tags: uploadFormData.tags ? uploadFormData.tags.split(',').map(tag => tag.trim()) : [],
          is_public: !uploadFormData.isConfidential,
          file_name: file.name,
          file_path: uploadResult.storagePath!, // Use the storage path from upload
          file_type: file.type,
          file_size: file.size,
          mime_type: file.type,
          status: 'draft' as const,
          priority: uploadFormData.priority,
          department: uploadFormData.department,
          version: uploadFormData.version,
          is_favorite: false, // Default to false
          thumbnail_url: uploadResult.thumbnailUrl || null // Assuming thumbnailUrl is available from upload
        };

        console.log('Creating document record:', documentData);
        
        try {
          await createDocument.mutateAsync(documentData);
          console.log('Document record created successfully');
        } catch (dbError) {
          console.error('Database error:', dbError);
          // If database insertion fails, we should clean up the uploaded file
          // For now, just throw the error
          throw new Error(`Database error: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`);
        }
      }

      // Reset form
      setUploadFormData({
        name: '',
        category: '',
        description: '',
        expiryDate: '',
        tags: '',
        isConfidential: false,
        priority: 'medium',
        department: '',
        version: '1.0'
      });
      setSelectedFiles([]);
      setUploadingToCategory('');
      setIsUploadDialogOpen(false);

      toast({
        title: "Upload Successful",
        description: `${selectedFiles.length} document(s) uploaded successfully.`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload document(s). Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetUploadForm = () => {
    setUploadFormData({
      name: '',
      category: '',
      description: '',
      expiryDate: '',
      tags: '',
      isConfidential: false,
      priority: 'medium',
      department: '',
      version: '1.0'
    });
    setSelectedFiles([]);
    setUploadingToCategory('');
  };

  const toggleSort = (field: 'name' | 'date' | 'size' | 'status' | 'priority' | 'expiry') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleBulkAction = async () => {
    if (selectedDocuments.length === 0) {
      toast({
        title: "No Documents Selected",
        description: "Please select at least one document to perform a bulk action.",
        variant: "destructive",
      });
      return;
    }

    if (!bulkAction) {
      toast({
        title: "No Action Selected",
        description: "Please select an action to perform on the selected documents.",
        variant: "destructive",
      });
      return;
    }

    if (bulkAction === 'delete') {
      if (confirm('Are you sure you want to delete these documents?')) {
        try {
          for (const docId of selectedDocuments) {
            await deleteDocument.mutateAsync(docId);
          }
          toast({
            title: "Bulk Deleted",
            description: `${selectedDocuments.length} document(s) deleted.`,
          });
        } catch (error) {
          toast({
            title: "Bulk Delete Failed",
            description: "Failed to delete documents. Please try again.",
            variant: "destructive",
          });
        }
      }
    }
    setSelectedDocuments([]);
    setIsBulkActionDialogOpen(false);
  };

  const handleFavorite = async (documentId: string, isFavorite: boolean) => {
    try {
      await updateDocument.mutateAsync({ id: documentId, is_favorite: isFavorite });
      toast({
        title: "Favorite Updated",
        description: `Document marked as ${isFavorite ? 'favorite' : 'not favorite'}.`,
      });
    } catch (error) {
      toast({
        title: "Favorite Update Failed",
        description: "Failed to update favorite status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleArchive = async (documentId: string, isArchived: boolean) => {
    try {
      await updateDocument.mutateAsync({ id: documentId, status: isArchived ? 'archived' : 'active' });
      toast({
        title: "Document Archived",
        description: `Document marked as ${isArchived ? 'archived' : 'active'}.`,
      });
    } catch (error) {
      toast({
        title: "Archive Failed",
        description: "Failed to archive document. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditDocument = (document: Document) => {
    setSelectedDocument(document);
    setUploadFormData({
      name: document.name,
      category: document.category,
      description: document.description || '',
      expiryDate: document.expiryDate || '',
      tags: document.tags.join(', '),
      isConfidential: !document.is_public,
      priority: document.priority || 'medium',
      department: document.department || '',
      version: document.version || '1.0'
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!selectedDocument) return;

    const updatedDocumentData = {
      id: selectedDocument.id,
      name: uploadFormData.name,
      category: uploadFormData.category,
      description: uploadFormData.description,
      expiry_date: uploadFormData.expiryDate || null,
      tags: uploadFormData.tags ? uploadFormData.tags.split(',').map(tag => tag.trim()) : [],
      is_public: !uploadFormData.isConfidential,
      priority: uploadFormData.priority,
      department: uploadFormData.department,
      version: uploadFormData.version,
      is_favorite: selectedDocument.isFavorite || false, // Preserve favorite status
      thumbnail_url: selectedDocument.thumbnailUrl || null // Preserve thumbnail
    };

    try {
      await updateDocument.mutateAsync(updatedDocumentData);
      toast({
        title: "Document Updated",
        description: "Document details have been updated.",
      });
      setIsEditDialogOpen(false);
      refetch(); // Refresh data after update
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update document details. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShareDocument = () => {
    setSelectedDocument(null); // Clear selected document for sharing
    setIsShareDialogOpen(true);
  };

  const handleCloseDialogs = () => {
    setIsUploadDialogOpen(false);
    setIsBulkUploadDialogOpen(false);
    setIsViewDialogOpen(false);
    setIsEditDialogOpen(false);
    setIsShareDialogOpen(false);
    setIsBulkActionDialogOpen(false);
    setSelectedDocument(null);
    setSelectedDocuments([]);
    setUploadingToCategory('');
    setUploadFormData({
      name: '',
      category: '',
      description: '',
      expiryDate: '',
      tags: '',
      isConfidential: false,
      priority: 'medium',
      department: '',
      version: '1.0'
    });
    setSelectedFiles([]);
    setUploadProgress(0);
    setIsUploading(false);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setShowExpiredOnly(false);
    setShowConfidentialOnly(false);
    setShowFavoritesOnly(false);
  };

  const handleFilterChange = (value: string) => {
    if (value === 'expired') {
      setShowExpiredOnly(true);
    } else if (value === 'confidential') {
      setShowConfidentialOnly(true);
    } else if (value === 'favorites') {
      setShowFavoritesOnly(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Compact Mobile Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FolderOpen className="w-6 h-6 text-blue-600" />
            <div>
              <h1 className="text-lg font-bold text-gray-900">Document Management</h1>
              <p className="text-xs text-gray-600">Organize and manage documents</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={() => refetch()} variant="outline" size="sm" disabled={documentsLoading}>
              <RefreshCw className={`w-4 h-4 ${documentsLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-1" />
                  Upload
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md mx-4">
                <DialogHeader>
                  <DialogTitle className="text-base">
                    {uploadingToCategory ? `Upload to ${categories.find(c => c.id === uploadingToCategory)?.name}` : 'Upload New Document'}
                  </DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground">
                    {uploadingToCategory 
                      ? `Upload documents to the ${categories.find(c => c.id === uploadingToCategory)?.name} category.`
                      : 'Upload new documents to your organization\'s document library.'
                    }
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="document-name" className="text-sm">Document Name</Label>
                    <Input 
                      id="document-name" 
                      placeholder="Enter document name" 
                      className="mt-1"
                      value={uploadFormData.name}
                      onChange={(e) => setUploadFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  
                  {!uploadingToCategory && (
                    <div>
                      <Label htmlFor="category" className="text-sm">Category</Label>
                      <Select 
                        value={uploadFormData.category} 
                        onValueChange={(value) => setUploadFormData(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger className="mt-1">
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
                  )}
                  
                  <div>
                    <Label htmlFor="description" className="text-sm">Description (Optional)</Label>
                    <Input 
                      id="description" 
                      placeholder="Enter document description" 
                      className="mt-1"
                      value={uploadFormData.description}
                      onChange={(e) => setUploadFormData(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="expiry-date" className="text-sm">Expiry Date (Optional)</Label>
                    <Input 
                      id="expiry-date" 
                      type="date" 
                      className="mt-1"
                      value={uploadFormData.expiryDate}
                      onChange={(e) => setUploadFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="tags" className="text-sm">Tags (Optional)</Label>
                    <Input 
                      id="tags" 
                      placeholder="Enter tags separated by commas" 
                      className="mt-1"
                      value={uploadFormData.tags}
                      onChange={(e) => setUploadFormData(prev => ({ ...prev, tags: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="file-upload" className="text-sm">Select Files</Label>
                    <div className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                      <p className="text-xs text-gray-600 mb-2">
                        Drag and drop files here, or click to browse
                      </p>
                      <input
                        type="file"
                        id="file-upload"
                        multiple
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => document.getElementById('file-upload')?.click()}
                      >
                        Select Files
                      </Button>
                    </div>
                    {selectedFiles.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="text-xs text-gray-600 flex items-center justify-between">
                            <span>{file.name}</span>
                            <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="confidential"
                      checked={uploadFormData.isConfidential}
                      onChange={(e) => setUploadFormData(prev => ({ ...prev, isConfidential: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="confidential" className="text-sm">Mark as confidential</Label>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        resetUploadForm();
                        setIsUploadDialogOpen(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      onClick={handleUploadSubmit}
                      disabled={createDocument.isPending}
                    >
                      {createDocument.isPending ? 'Uploading...' : 'Upload Document'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Compact Stats Cards */}
      <div className="px-4 py-3">
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-3">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xs text-gray-600">Total</p>
                <p className="text-lg font-bold">{documentStats.total}</p>
              </div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-xs text-gray-600">Approved</p>
                <p className="text-lg font-bold text-green-600">{documentStats.approved}</p>
              </div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-xs text-gray-600">Pending</p>
                <p className="text-lg font-bold text-yellow-600">{documentStats.pending}</p>
              </div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="flex items-center space-x-2">
              <Lock className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-xs text-gray-600">Confidential</p>
                <p className="text-lg font-bold text-purple-600">{documentStats.confidential}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Compact Search and Filters */}
      <div className="px-4 pb-3">
        <Card className="p-3">
          <div className="space-y-3">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Filter Controls */}
            <div className="flex space-x-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="All Categories" />
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
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>

              <Select value={handleFilterChange} onValueChange={handleFilterChange}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Filter by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Documents</SelectItem>
                  <SelectItem value="expired">Expiring Soon</SelectItem>
                  <SelectItem value="confidential">Confidential</SelectItem>
                  <SelectItem value="favorites">Favorites</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
              >
                {viewMode === 'list' ? <Grid className="w-4 h-4" /> : <List className="w-4 h-4" />}
              </Button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                <div className="flex space-x-2">
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="size">Size</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                      <SelectItem value="priority">Priority</SelectItem>
                      <SelectItem value="expiry">Expiry Date</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  >
                    {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="px-4">
        <Tabs defaultValue="documents" className="space-y-3">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="documents" className="text-xs">Documents</TabsTrigger>
            <TabsTrigger value="categories" className="text-xs">Categories</TabsTrigger>
            <TabsTrigger value="reports" className="text-xs">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="space-y-3">
            <Card>
              <CardHeader className="p-3">
                <CardTitle className="flex items-center space-x-2 text-base">
                  <FileText className="w-4 h-4" />
                  <span>Document Library</span>
                  <span className="text-xs text-gray-500">({sortedAndFilteredDocuments.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {sortedAndFilteredDocuments.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No documents found</p>
                    <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
                  </div>
                ) : viewMode === 'grid' ? (
                  /* Compact Grid View */
                  <div className="grid grid-cols-1 gap-3 p-3">
                    {sortedAndFilteredDocuments.map((doc) => (
                      <Card key={doc.id} className="p-3 hover:shadow-md transition-shadow">
                        <div className="space-y-2">
                          <div className="flex items-start space-x-2">
                            {getFileIcon(doc.type)}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{doc.name}</p>
                              <p className="text-xs text-gray-500">{doc.type} • {doc.size}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{doc.uploadedBy}</span>
                            <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            {getStatusBadge(doc.status)}
                            {doc.isConfidential && <Lock className="w-3 h-3 text-gray-400" />}
                            {doc.isFavorite && <Star className="w-3 h-3 text-yellow-500" />}
                            {doc.expiryDate && isAfter(new Date(doc.expiryDate), new Date()) && (
                              <Clock className="w-3 h-3 text-red-500" />
                            )}
                          </div>
                          
                          <div className="flex space-x-1">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleViewDocument(doc)} 
                              className="flex-1 text-xs"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleEditDocument(doc)} 
                              className="text-xs"
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleFavorite(doc.id, !doc.isFavorite)} 
                              className="text-xs"
                            >
                              {doc.isFavorite ? <StarOff className="w-3 h-3 text-gray-500" /> : <Star className="w-3 h-3 text-yellow-500" />}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleArchive(doc.id, doc.status === 'archived')} 
                              className="text-xs"
                            >
                              {doc.status === 'archived' ? <Archive className="w-3 h-3 text-gray-500" /> : <Archive className="w-3 h-3 text-blue-500" />}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleDeleteDocument(doc.id)} 
                              className="text-xs"
                            >
                              <Trash2 className="w-3 h-3 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  /* Compact List View */
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">Document</TableHead>
                          <TableHead className="text-xs hidden sm:table-cell">Category</TableHead>
                          <TableHead className="text-xs">Status</TableHead>
                          <TableHead className="text-xs">Priority</TableHead>
                          <TableHead className="text-xs">Expiry</TableHead>
                          <TableHead className="text-xs">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedAndFilteredDocuments.map((doc) => (
                          <TableRow key={doc.id}>
                            <TableCell className="p-2">
                              <div className="flex items-center space-x-2">
                                {getFileIcon(doc.type)}
                                <div className="min-w-0">
                                  <p className="font-medium text-sm truncate">{doc.name}</p>
                                  <p className="text-xs text-gray-500">{doc.type} • {doc.size}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="p-2 hidden sm:table-cell text-xs capitalize">
                              {categories.find(c => c.id === doc.category)?.name || doc.category}
                            </TableCell>
                            <TableCell className="p-2">
                              {getStatusBadge(doc.status)}
                            </TableCell>
                            <TableCell className="p-2 text-xs">
                              {doc.priority}
                            </TableCell>
                            <TableCell className="p-2 text-xs text-gray-500">
                              {doc.expiryDate ? format(new Date(doc.expiryDate), 'MMM dd, yyyy') : 'N/A'}
                            </TableCell>
                            <TableCell className="p-2">
                              <div className="flex space-x-1">
                                <Button variant="outline" size="sm" onClick={() => handleViewDocument(doc)}>
                                  <Eye className="w-3 h-3" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleEditDocument(doc)}>
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleFavorite(doc.id, !doc.isFavorite)}>
                                  {doc.isFavorite ? <StarOff className="w-3 h-3 text-gray-500" /> : <Star className="w-3 h-3 text-yellow-500" />}
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleArchive(doc.id, doc.status === 'archived')}>
                                  {doc.status === 'archived' ? <Archive className="w-3 h-3 text-gray-500" /> : <Archive className="w-3 h-3 text-blue-500" />}
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleDeleteDocument(doc.id)}>
                                  <Trash2 className="w-3 h-3 text-red-500" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-3">
            <div className="grid grid-cols-1 gap-3">
              {categories.map((category) => (
                <Card key={category.id} className="p-3 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-gray-100">
                        <FolderOpen className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{category.name}</h3>
                        <p className="text-xs text-gray-600">{category.count} documents</p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button variant="outline" size="sm" className="text-xs">
                        View
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-blue-600 hover:bg-blue-700 text-xs"
                        onClick={() => handleUploadToCategory(category.id)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-3">
            <Card>
              <CardHeader className="p-3">
                <CardTitle className="flex items-center space-x-2 text-base">
                  <FileText className="w-4 h-4" />
                  <span>Document Reports</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="text-center py-6">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-base font-medium text-gray-900 mb-2">Generate Document Reports</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Create comprehensive reports on document compliance and usage analytics.
                  </p>
                  <div className="flex flex-col space-y-2">
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
      </div>

      {/* Compact Document View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle className="text-base">Document Details</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              View and manage document information, metadata, and actions.
            </DialogDescription>
          </DialogHeader>
          {selectedDocument && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-sm mb-2">Document Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium truncate">{selectedDocument.name}</span>
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
                      <span className="text-gray-600">Priority:</span>
                      <span>{selectedDocument.priority}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Department:</span>
                      <span>{selectedDocument.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Version:</span>
                      <span>{selectedDocument.version}</span>
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
                  <h3 className="font-semibold text-sm mb-2">Description</h3>
                  <p className="text-sm text-gray-800">{selectedDocument.description || 'No description available.'}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-1">
                    {selectedDocument.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-2">Actions</h3>
                  <div className="space-y-2">
                    <Button className="w-full" variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download Document
                    </Button>
                    <Button className="w-full" variant="outline" size="sm">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Document
                    </Button>
                    <Button className="w-full" variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Details
                    </Button>
                    <Button className="w-full" variant="outline" size="sm" onClick={() => handleDeleteDocument(selectedDocument.id)}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Document
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Compact Edit Document Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="text-base">Edit Document Details</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
    </div>
  );
};

export default Documents;
