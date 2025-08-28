import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  FileX,
  Users,
  Send,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { format, isAfter, isBefore, addDays, differenceInDays } from 'date-fns';
import { 
  useAllDriverDocuments, 
  useCreateDriverDocumentRequest, 
  useReviewDriverDocument,
  useDocumentNotifications,
  useMarkNotificationRead,
  type DriverDocument 
} from '@/hooks/useDriverDocuments';
import { useDrivers } from '@/hooks/useDrivers';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const AdminDriverDocuments = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [driverFilter, setDriverFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [sortBy, setSortBy] = useState<'name' | 'dueDate' | 'status' | 'priority' | 'driver'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DriverDocument | null>(null);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Form state for requesting documents
  const [requestForm, setRequestForm] = useState({
    name: '',
    category: '',
    description: '',
    driver_id: '',
    due_date: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    is_urgent: false
  });

  // Form state for reviewing documents
  const [reviewForm, setReviewForm] = useState({
    status: 'approved' as 'approved' | 'rejected',
    notes: ''
  });

  // Fetch data
  const { data: documents = [], isLoading, error, refetch } = useAllDriverDocuments();
  const { data: drivers = [] } = useDrivers();
  const { data: notifications = [] } = useDocumentNotifications();
  const createRequest = useCreateDriverDocumentRequest();
  const reviewDocument = useReviewDriverDocument();
  const markRead = useMarkNotificationRead();

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         `${doc.driver?.first_name} ${doc.driver?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter;
    const matchesDriver = driverFilter === 'all' || doc.driver_id === driverFilter;
    
    return matchesSearch && matchesStatus && matchesCategory && matchesDriver;
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
      case 'driver':
        const driverA = `${a.driver?.first_name} ${a.driver?.last_name}`;
        const driverB = `${b.driver?.first_name} ${b.driver?.last_name}`;
        comparison = driverA.localeCompare(driverB);
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
      case 'expired': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle2 className="w-4 h-4" />;
      case 'uploaded': return <Upload className="w-4 h-4" />;
      case 'pending_review': return <Clock3 className="w-4 h-4" />;
      case 'required': return <AlertCircle className="w-4 h-4" />;
      case 'expired': return <FileX className="w-4 h-4" />;
      case 'rejected': return <FileX className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const handleRequestDocument = async () => {
    if (!requestForm.name || !requestForm.category || !requestForm.driver_id) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      await createRequest.mutateAsync({
        name: requestForm.name,
        category: requestForm.category,
        description: requestForm.description,
        driver_id: requestForm.driver_id,
        due_date: requestForm.due_date || undefined,
        priority: requestForm.priority,
        is_urgent: requestForm.is_urgent
      });
      
      setIsRequestDialogOpen(false);
      setRequestForm({
        name: '',
        category: '',
        description: '',
        driver_id: '',
        due_date: '',
        priority: 'medium',
        is_urgent: false
      });
    } catch (error) {
      console.error('Failed to request document:', error);
    }
  };

  const handleReviewDocument = async () => {
    if (!selectedDocument) return;

    try {
      await reviewDocument.mutateAsync({
        documentId: selectedDocument.id,
        status: reviewForm.status,
        notes: reviewForm.notes
      });
      
      setIsReviewDialogOpen(false);
      setReviewForm({ status: 'approved', notes: '' });
      setSelectedDocument(null);
    } catch (error) {
      console.error('Failed to review document:', error);
    }
  };

  const handleViewDocument = (document: DriverDocument) => {
    setSelectedDocument(document);
    setIsViewDialogOpen(true);
  };

  const handleReviewClick = (document: DriverDocument) => {
    setSelectedDocument(document);
    setIsReviewDialogOpen(true);
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
    { id: 'rejected', name: 'Rejected' },
    { id: 'expired', name: 'Expired' }
  ];

  const urgentDocuments = sortedDocuments.filter(doc => doc.is_urgent || doc.status === 'required');
  const regularDocuments = sortedDocuments.filter(doc => !doc.is_urgent && doc.status !== 'required');

  const unreadNotifications = notifications.filter(n => !n.is_read);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-600">Loading driver documents...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load driver documents.</p>
          <Button onClick={() => refetch()} className="mt-4">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Driver Documents Management</h1>
          <p className="text-gray-600">
            {documents.length} total documents • {urgentDocuments.length} require attention
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {unreadNotifications.length > 0 && (
            <Badge variant="destructive" className="flex items-center space-x-1">
              <MessageSquare className="w-3 h-3" />
              <span>{unreadNotifications.length}</span>
            </Badge>
          )}
          <Button onClick={() => setIsRequestDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Request Document
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search documents, drivers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
              >
                {viewMode === 'list' ? <Grid className="w-4 h-4" /> : <List className="w-4 h-4" />}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              </Button>
            </div>

            {/* Filter Options */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      {statuses.map(status => (
                        <SelectItem key={status.id} value={status.id}>
                          {status.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Driver</Label>
                  <Select value={driverFilter} onValueChange={setDriverFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Drivers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Drivers</SelectItem>
                      {drivers.map(driver => (
                        <SelectItem key={driver.id} value={driver.id}>
                          {driver.first_name} {driver.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Sort By</Label>
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="dueDate">Due Date</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                      <SelectItem value="priority">Priority</SelectItem>
                      <SelectItem value="driver">Driver</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Urgent Documents */}
      {urgentDocuments.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-red-700 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Requires Attention ({urgentDocuments.length})
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {urgentDocuments.map((document) => (
              <Card key={document.id} className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(document.priority)}`}></div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">
                            {document.name}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {document.category} • {document.description}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Driver: {document.driver?.first_name} {document.driver?.last_name}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge className={getStatusColor(document.status)}>
                              <div className="flex items-center space-x-1">
                                {getStatusIcon(document.status)}
                                <span className="text-xs">{document.status.replace('_', ' ')}</span>
                              </div>
                            </Badge>
                            {document.is_urgent && (
                              <Badge variant="destructive" className="text-xs">
                                Urgent
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
                            {document.due_date && (
                              <span className="flex items-center space-x-1">
                                <Calendar className="w-3 h-3" />
                                <span>Due: {format(new Date(document.due_date), 'MMM dd, yyyy')}</span>
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          {document.status === 'uploaded' && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleReviewClick(document)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDocument(document)}
                            className="p-1"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
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
        <h2 className="text-xl font-semibold">All Documents</h2>
        
        {regularDocuments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all' || driverFilter !== 'all'
                  ? 'No documents match your filters'
                  : 'No other documents available'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4' : 'space-y-4'}>
            {regularDocuments.map((document) => (
              <Card key={document.id}>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(document.priority)}`}></div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">
                            {document.name}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {document.category} • {document.description}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Driver: {document.driver?.first_name} {document.driver?.last_name}
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
                            {document.due_date && (
                              <span className="flex items-center space-x-1">
                                <Calendar className="w-3 h-3" />
                                <span>Due: {format(new Date(document.due_date), 'MMM dd, yyyy')}</span>
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          {document.status === 'uploaded' && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleReviewClick(document)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDocument(document)}
                            className="p-1"
                          >
                            <Eye className="w-4 h-4" />
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

      {/* Request Document Dialog */}
      <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request Document from Driver</DialogTitle>
            <DialogDescription>
              Create a new document request for a driver.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Document Name *</Label>
              <Input
                value={requestForm.name}
                onChange={(e) => setRequestForm({ ...requestForm, name: e.target.value })}
                placeholder="e.g., Driver License"
              />
            </div>
            
            <div>
              <Label>Category *</Label>
              <Select value={requestForm.category} onValueChange={(value) => setRequestForm({ ...requestForm, category: value })}>
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
            
            <div>
              <Label>Driver *</Label>
              <Select value={requestForm.driver_id} onValueChange={(value) => setRequestForm({ ...requestForm, driver_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select driver" />
                </SelectTrigger>
                <SelectContent>
                  {drivers.map(driver => (
                    <SelectItem key={driver.id} value={driver.id}>
                      {driver.first_name} {driver.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Description</Label>
              <Textarea
                value={requestForm.description}
                onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
                placeholder="Document description..."
                rows={3}
              />
            </div>
            
            <div>
              <Label>Due Date</Label>
              <Input
                type="date"
                value={requestForm.due_date}
                onChange={(e) => setRequestForm({ ...requestForm, due_date: e.target.value })}
              />
            </div>
            
            <div>
              <Label>Priority</Label>
              <Select value={requestForm.priority} onValueChange={(value: any) => setRequestForm({ ...requestForm, priority: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="urgent"
                checked={requestForm.is_urgent}
                onChange={(e) => setRequestForm({ ...requestForm, is_urgent: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="urgent">Mark as urgent</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRequestDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleRequestDocument}
              disabled={createRequest.isPending}
            >
              {createRequest.isPending ? 'Creating...' : 'Request Document'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Document Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Review Document</DialogTitle>
            <DialogDescription>
              Review and approve or reject the uploaded document.
            </DialogDescription>
          </DialogHeader>
          
          {selectedDocument && (
            <div className="space-y-4">
              <div>
                <p className="font-medium">{selectedDocument.name}</p>
                <p className="text-sm text-gray-600">
                  Driver: {selectedDocument.driver?.first_name} {selectedDocument.driver?.last_name}
                </p>
                <p className="text-sm text-gray-600">
                  Category: {selectedDocument.category}
                </p>
              </div>
              
              <div>
                <Label>Status</Label>
                <Select value={reviewForm.status} onValueChange={(value: any) => setReviewForm({ ...reviewForm, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">Approve</SelectItem>
                    <SelectItem value="rejected">Reject</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={reviewForm.notes}
                  onChange={(e) => setReviewForm({ ...reviewForm, notes: e.target.value })}
                  placeholder="Add review notes..."
                  rows={3}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleReviewDocument}
              disabled={reviewDocument.isPending}
            >
              {reviewDocument.isPending ? 'Reviewing...' : 'Submit Review'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Document Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Document Details</DialogTitle>
          </DialogHeader>
          
          {selectedDocument && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Document Name</Label>
                  <p className="text-sm">{selectedDocument.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Category</Label>
                  <p className="text-sm">{selectedDocument.category}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Driver</Label>
                  <p className="text-sm">{selectedDocument.driver?.first_name} {selectedDocument.driver?.last_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge className={getStatusColor(selectedDocument.status)}>
                    {selectedDocument.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Priority</Label>
                  <Badge variant="outline">{selectedDocument.priority}</Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Due Date</Label>
                  <p className="text-sm">
                    {selectedDocument.due_date ? format(new Date(selectedDocument.due_date), 'MMM dd, yyyy') : 'Not set'}
                  </p>
                </div>
              </div>
              
              {selectedDocument.description && (
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm">{selectedDocument.description}</p>
                </div>
              )}
              
              {selectedDocument.file_url && (
                <div>
                  <Label className="text-sm font-medium">File</Label>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(selectedDocument.file_url, '_blank')}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View File
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(selectedDocument.file_url, '_blank')}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              )}
              
              {selectedDocument.driver_notes && (
                <div>
                  <Label className="text-sm font-medium">Driver Notes</Label>
                  <p className="text-sm">{selectedDocument.driver_notes}</p>
                </div>
              )}
              
              {selectedDocument.admin_notes && (
                <div>
                  <Label className="text-sm font-medium">Admin Notes</Label>
                  <p className="text-sm">{selectedDocument.admin_notes}</p>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDriverDocuments;


