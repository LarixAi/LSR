import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
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
  Archive,
  Copy,
  ExternalLink,
  Shield,
  AlertCircle,
  FileCheck,
  FileX,
  FileClock,
  FolderPlus,
  BarChart3,
  PieChart,
  TrendingUp,
  DownloadCloud,
  UploadCloud,
  Tag,
  Bookmark,
  Pin,
  PinOff,
  Folder,
  FolderTree,
  Layers,
  Workflow,
  Zap,
  Target,
  Award,
  TrendingDown,
  Activity,
  Bell,
  Mail,
  MessageSquare,
  Phone,
  MapPin,
  Globe,
  Database,
  Cloud,
  HardDrive,
  Smartphone,
  Tablet,
  Monitor,
  Printer,
  Scanner,
  Camera,
  Video,
  Music,
  Volume2,
  Mic,
  Headphones,
  Wifi,
  Bluetooth,
  Battery,
  Power,
  Wrench,
  Tool,
  Hammer,
  Screwdriver,
  Cog,
  Sliders,
  ToggleLeft,
  ToggleRight,
  CheckSquare,
  Square,
  Circle,
  Minus,
  PlusCircle,
  MinusCircle,
  XCircle,
  HelpCircle,
  Info,
  Lightbulb,
  Gift,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Smile,
  Frown,
  Meh,
  Laugh,
  Cry,
  Angry,
  Surprise,
  Wink,
  EyeOff,
  EyeOn,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Key,
  Unlock,
  UserCheck,
  UserX,
  UserPlus,
  UserMinus,
  Users2,
  User,
  UserCog,
  UserEdit,
  UserSearch,
  UserShield,
  UserVoice,
  UserWarning,
  UserCheck2,
  UserX2,
  UserPlus2,
  UserMinus2,
  Users3,
  User2,
  UserCog2,
  UserEdit2,
  UserSearch2,
  UserShield2,
  UserVoice2,
  UserWarning2
} from 'lucide-react';
import { useDocuments, useCreateDocument, useUpdateDocument, useDeleteDocument } from '@/hooks/useDocuments';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { uploadFileToStorage } from '@/utils/fileUpload';

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
  isPinned?: boolean;
  isStarred?: boolean;
  description?: string;
  version?: string;
  approvalDate?: string;
  approvedBy?: string;
  rejectionReason?: string;
}

interface DocumentStats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  expired: number;
  archived: number;
  confidential: number;
  expiringSoon: number;
  totalSize: number;
  categories: Record<string, number>;
}

export default function DocumentsEnhanced() {
  const { user, profile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  // State management
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'kanban' | 'analytics'>('list');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'status' | 'category'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [isBulkActionsOpen, setIsBulkActionsOpen] = useState<boolean>(false);
  const [showAnalytics, setShowAnalytics] = useState<boolean>(false);
  const [showWorkflow, setShowWorkflow] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'documents' | 'analytics' | 'workflow' | 'templates'>('documents');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y' | 'all'>('30d');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
  const [documentTemplates, setDocumentTemplates] = useState<any[]>([]);
  const [workflowSteps, setWorkflowSteps] = useState<any[]>([]);
  
  // Dialog states
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState<boolean>(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState<boolean>(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  
  // Upload form state
  const [uploadFormData, setUploadFormData] = useState({
    name: '',
    category: '',
    description: '',
    expiryDate: '',
    tags: '',
    isConfidential: false,
    isPinned: false,
    isStarred: false
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Fetch data
  const { data: documents = [], isLoading: documentsLoading, error, refetch } = useDocuments();
  const createDocument = useCreateDocument();
  const updateDocument = useUpdateDocument();
  const deleteDocument = useDeleteDocument();

  // Calculate document statistics
  const documentStats: DocumentStats = React.useMemo(() => {
    const stats: DocumentStats = {
      total: documents.length,
      approved: 0,
      pending: 0,
      rejected: 0,
      expired: 0,
      archived: 0,
      confidential: 0,
      expiringSoon: 0,
      totalSize: 0,
      categories: {}
    };

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    documents.forEach(doc => {
      // Status counts
      stats[doc.status as keyof DocumentStats]++;
      
      // Confidential count
      if (!doc.is_public) stats.confidential++;
      
      // Expiring soon count
      if (doc.expiry_date && new Date(doc.expiry_date) <= thirtyDaysFromNow) {
        stats.expiringSoon++;
      }
      
      // Category counts
      const category = doc.category || 'other';
      stats.categories[category] = (stats.categories[category] || 0) + 1;
      
      // Total size
      stats.totalSize += doc.file_size || 0;
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
    isPinned: doc.is_pinned || false,
    isStarred: doc.is_starred || false,
    description: doc.description,
    version: doc.version,
    approvalDate: doc.approval_date,
    approvedBy: doc.approved_by,
    rejectionReason: doc.rejection_reason
  }));

  // Categories with enhanced information
  const categories = [
    { id: 'compliance', name: 'Compliance Documents', icon: Shield, color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { id: 'insurance', name: 'Insurance & Certificates', icon: FileCheck, color: 'text-green-600', bgColor: 'bg-green-50' },
    { id: 'vehicle', name: 'Vehicle Documents', icon: File, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { id: 'driver', name: 'Driver Documents', icon: Users, color: 'text-orange-600', bgColor: 'bg-orange-50' },
    { id: 'operational', name: 'Operational Documents', icon: Settings, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
    { id: 'financial', name: 'Financial Documents', icon: BarChart3, color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
    { id: 'other', name: 'Other Documents', icon: FileText, color: 'text-gray-600', bgColor: 'bg-gray-50' }
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      approved: { className: 'bg-green-100 text-green-800', icon: CheckCircle },
      pending: { className: 'bg-yellow-100 text-yellow-800', icon: Clock },
      rejected: { className: 'bg-red-100 text-red-800', icon: FileX },
      expired: { className: 'bg-gray-100 text-gray-800', icon: AlertCircle },
      active: { className: 'bg-blue-100 text-blue-800', icon: FileCheck },
      archived: { className: 'bg-slate-100 text-slate-800', icon: Archive }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const IconComponent = config.icon;
    
    return (
      <Badge className={`${config.className} flex items-center gap-1`}>
        <IconComponent className="w-3 h-3" />
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
      case 'doc':
      case 'docx':
        return <FileText className="w-4 h-4 text-blue-600" />;
      default:
        return <File className="w-4 h-4 text-gray-600" />;
    }
  };

  // Sort and filter documents
  const sortedAndFilteredDocuments = transformedDocuments
    .filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      // Sort by pinned/starred first
      if (a.isPinned && !b.isPinned) comparison = -1;
      else if (!a.isPinned && b.isPinned) comparison = 1;
      else if (a.isStarred && !b.isStarred) comparison = -1;
      else if (!a.isStarred && b.isStarred) comparison = 1;
      
      if (comparison !== 0) return comparison;
      
      // Then sort by selected criteria
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
          break;
        case 'size':
          comparison = parseInt(a.size) - parseInt(b.size);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        default:
          comparison = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Handle document selection
  const handleDocumentSelect = (documentId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(documentId) 
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedDocuments.length === sortedAndFilteredDocuments.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(sortedAndFilteredDocuments.map(doc => doc.id));
    }
  };

  // Handle document actions
  const handleViewDocument = (document: Document) => {
    setSelectedDocument(document);
    setIsViewDialogOpen(true);
  };

  const handleEditDocument = (document: Document) => {
    setSelectedDocument(document);
    setUploadFormData({
      name: document.name,
      category: document.category,
      description: document.description || '',
      expiryDate: document.expiryDate || '',
      tags: document.tags.join(', '),
      isConfidential: document.isConfidential,
      isPinned: document.isPinned || false,
      isStarred: document.isStarred || false
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      await deleteDocument.mutateAsync(documentId);
      toast({
        title: "Document deleted",
        description: "The document has been successfully deleted.",
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete document. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedDocuments.map(id => deleteDocument.mutateAsync(id)));
      toast({
        title: "Documents deleted",
        description: `${selectedDocuments.length} documents have been successfully deleted.`,
      });
      setSelectedDocuments([]);
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete some documents. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Document Management</h1>
          <p className="text-muted-foreground">Organize, track, and manage all your transport documents</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
          <Button onClick={() => setIsUploadDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documentStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(documentStats.totalSize)} total size
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documentStats.approved}</div>
            <p className="text-xs text-muted-foreground">
              {documentStats.total > 0 ? Math.round((documentStats.approved / documentStats.total) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documentStats.pending}</div>
            <p className="text-xs text-muted-foreground">
              {documentStats.expiringSoon} expiring soon
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confidential</CardTitle>
            <Lock className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documentStats.confidential}</div>
            <p className="text-xs text-muted-foreground">
              Secure documents
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="workflow" className="flex items-center gap-2">
            <Workflow className="w-4 h-4" />
            Workflow
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FolderTree className="w-4 h-4" />
            Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          {/* Filters and Search */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search documents by name, description, or tags..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name} ({documentStats.categories[category.id] || 0})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>

                {/* Date Range Filter */}
                <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Date Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                    <SelectItem value="1y">Last year</SelectItem>
                    <SelectItem value="all">All time</SelectItem>
                  </SelectContent>
                </Select>

                {/* Sort */}
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="size">Size</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                  </SelectContent>
                </Select>

                {/* Sort Order */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                </Button>

                {/* View Mode */}
                <div className="flex border rounded-md">
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('kanban')}
                  >
                    <Layers className="w-4 h-4" />
                  </Button>
                </div>

                {/* Advanced Filters Toggle */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Advanced
                </Button>
              </div>

              {/* Advanced Filters */}
              {showAdvancedFilters && (
                <div className="mt-4 pt-4 border-t space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium">File Size Range</Label>
                      <div className="flex gap-2 mt-1">
                        <Input placeholder="Min size (KB)" className="text-xs" />
                        <Input placeholder="Max size (MB)" className="text-xs" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Upload Date Range</Label>
                      <div className="flex gap-2 mt-1">
                        <Input type="date" className="text-xs" />
                        <Input type="date" className="text-xs" />
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Document Owner</Label>
                      <Select>
                        <SelectTrigger className="text-xs">
                          <SelectValue placeholder="Select owner" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Users</SelectItem>
                          <SelectItem value="me">My Documents</SelectItem>
                          <SelectItem value="team">Team Documents</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Zap className="w-4 h-4 mr-2" />
                      Apply Filters
                    </Button>
                    <Button variant="ghost" size="sm">
                      Clear All
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

      {/* Bulk Actions */}
      {selectedDocuments.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">
                  {selectedDocuments.length} document(s) selected
                </span>
                <Button variant="outline" size="sm" onClick={handleSelectAll}>
                  Select All
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsBulkActionsOpen(true)}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsShareDialogOpen(true)}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documents List/Grid */}
      {viewMode === 'list' ? (
        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedDocuments.length === sortedAndFilteredDocuments.length && sortedAndFilteredDocuments.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Document</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Downloads</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedAndFilteredDocuments.map((document) => (
                  <TableRow key={document.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedDocuments.includes(document.id)}
                        onCheckedChange={() => handleDocumentSelect(document.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {document.isPinned && <Pin className="w-4 h-4 text-blue-600" />}
                        {document.isStarred && <Star className="w-4 h-4 text-yellow-600" />}
                        {getFileIcon(document.type)}
                        <div>
                          <div className="font-medium">{document.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {document.uploadedBy} • {format(new Date(document.uploadedAt), 'MMM dd, yyyy')}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{document.category}</Badge>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(document.status)}
                    </TableCell>
                    <TableCell>{document.size}</TableCell>
                    <TableCell>{format(new Date(document.uploadedAt), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>{document.downloadCount}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDocument(document)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditDocument(document)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteDocument(document.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedAndFilteredDocuments.map((document) => (
            <Card key={document.id} className="relative group hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getFileIcon(document.type)}
                    <div>
                      <div className="font-medium text-sm truncate">{document.name}</div>
                      <div className="text-xs text-muted-foreground">{document.size}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {document.isPinned && <Pin className="w-4 h-4 text-blue-600" />}
                    {document.isStarred && <Star className="w-4 h-4 text-yellow-600" />}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">{document.category}</Badge>
                    {getStatusBadge(document.status)}
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    <div>Uploaded by {document.uploadedBy}</div>
                    <div>{format(new Date(document.uploadedAt), 'MMM dd, yyyy')}</div>
                    <div>{document.downloadCount} downloads</div>
                  </div>
                  
                  <div className="flex gap-1 pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleViewDocument(document)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEditDocument(document)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {sortedAndFilteredDocuments.length === 0 && (
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No documents found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Get started by uploading your first document'
                }
              </p>
              <Button onClick={() => setIsUploadDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
        </TabsContent>
      </Tabs>

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload a new document to your organization's document library.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* File Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <UploadCloud className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground mb-2">
                Drag and drop files here, or click to select
              </p>
              <Button variant="outline" onClick={() => document.getElementById('file-upload')?.click()}>
                Choose Files
              </Button>
              <input
                id="file-upload"
                type="file"
                multiple
                className="hidden"
                onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
              />
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <Label>Selected Files:</Label>
                <div className="space-y-1">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Document Details Form */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Document Name</Label>
                <Input
                  id="name"
                  value={uploadFormData.name}
                  onChange={(e) => setUploadFormData({...uploadFormData, name: e.target.value})}
                  placeholder="Enter document name"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={uploadFormData.category} onValueChange={(value) => setUploadFormData({...uploadFormData, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={uploadFormData.description}
                onChange={(e) => setUploadFormData({...uploadFormData, description: e.target.value})}
                placeholder="Enter document description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={uploadFormData.expiryDate}
                  onChange={(e) => setUploadFormData({...uploadFormData, expiryDate: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="tags">Tags (Optional)</Label>
                <Input
                  id="tags"
                  value={uploadFormData.tags}
                  onChange={(e) => setUploadFormData({...uploadFormData, tags: e.target.value})}
                  placeholder="Enter tags separated by commas"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="confidential"
                  checked={uploadFormData.isConfidential}
                  onCheckedChange={(checked) => setUploadFormData({...uploadFormData, isConfidential: checked as boolean})}
                />
                <Label htmlFor="confidential">Mark as confidential</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pinned"
                  checked={uploadFormData.isPinned}
                  onCheckedChange={(checked) => setUploadFormData({...uploadFormData, isPinned: checked as boolean})}
                />
                <Label htmlFor="pinned">Pin document</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="starred"
                  checked={uploadFormData.isStarred}
                  onCheckedChange={(checked) => setUploadFormData({...uploadFormData, isStarred: checked as boolean})}
                />
                <Label htmlFor="starred">Star document</Label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={async () => {
                // Handle file upload logic here
                setIsUploading(true);
                setUploadProgress(0);
                
                try {
                  // Simulate upload progress
                  for (let i = 0; i <= 100; i += 10) {
                    setUploadProgress(i);
                    await new Promise(resolve => setTimeout(resolve, 100));
                  }
                  
                  // Create document record
                  await createDocument.mutateAsync({
                    name: uploadFormData.name,
                    category: uploadFormData.category,
                    description: uploadFormData.description,
                    expiry_date: uploadFormData.expiryDate || null,
                    tags: uploadFormData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
                    is_public: !uploadFormData.isConfidential,
                    is_pinned: uploadFormData.isPinned,
                    is_starred: uploadFormData.isStarred,
                    file_type: selectedFiles[0]?.type || 'application/octet-stream',
                    file_size: selectedFiles[0]?.size || 0
                  });
                  
                  toast({
                    title: "Document uploaded",
                    description: "Your document has been successfully uploaded.",
                  });
                  
                  setIsUploadDialogOpen(false);
                  setSelectedFiles([]);
                  setUploadFormData({
                    name: '',
                    category: '',
                    description: '',
                    expiryDate: '',
                    tags: '',
                    isConfidential: false,
                    isPinned: false,
                    isStarred: false
                  });
                  refetch();
                } catch (error) {
                  toast({
                    title: "Upload failed",
                    description: "Failed to upload document. Please try again.",
                    variant: "destructive",
                  });
                } finally {
                  setIsUploading(false);
                  setUploadProgress(0);
                }
              }}
              disabled={isUploading || selectedFiles.length === 0 || !uploadFormData.name || !uploadFormData.category}
            >
              {isUploading ? 'Uploading...' : 'Upload Document'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Document Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Document Details</DialogTitle>
          </DialogHeader>
          
          {selectedDocument && (
            <div className="space-y-6">
              {/* Document Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getFileIcon(selectedDocument.type)}
                  <div>
                    <h3 className="text-lg font-semibold">{selectedDocument.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedDocument.type} • {selectedDocument.size}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>

              {/* Document Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Category</Label>
                  <p className="text-sm">{selectedDocument.category}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedDocument.status)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Uploaded By</Label>
                  <p className="text-sm">{selectedDocument.uploadedBy}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Upload Date</Label>
                  <p className="text-sm">{format(new Date(selectedDocument.uploadedAt), 'MMM dd, yyyy HH:mm')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Downloads</Label>
                  <p className="text-sm">{selectedDocument.downloadCount}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Confidential</Label>
                  <p className="text-sm">{selectedDocument.isConfidential ? 'Yes' : 'No'}</p>
                </div>
                {selectedDocument.expiryDate && (
                  <div>
                    <Label className="text-sm font-medium">Expiry Date</Label>
                    <p className="text-sm">{format(new Date(selectedDocument.expiryDate), 'MMM dd, yyyy')}</p>
                  </div>
                )}
                {selectedDocument.approvalDate && (
                  <div>
                    <Label className="text-sm font-medium">Approved On</Label>
                    <p className="text-sm">{format(new Date(selectedDocument.approvalDate), 'MMM dd, yyyy')}</p>
                  </div>
                )}
              </div>

              {/* Description */}
              {selectedDocument.description && (
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm mt-1">{selectedDocument.description}</p>
                </div>
              )}

              {/* Tags */}
              {selectedDocument.tags.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Tags</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedDocument.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Rejection Reason */}
              {selectedDocument.rejectionReason && (
                <div>
                  <Label className="text-sm font-medium text-red-600">Rejection Reason</Label>
                  <p className="text-sm mt-1 text-red-600">{selectedDocument.rejectionReason}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
