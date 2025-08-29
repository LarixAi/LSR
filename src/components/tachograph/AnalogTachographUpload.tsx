import React, { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  FileText, 
  Calendar, 
  User, 
  Truck, 
  Trash2, 
  Download, 
  Eye, 
  Search,
  Filter,
  SortAsc,
  SortDesc,
  HardDrive,
  AlertTriangle,
  CheckCircle,
  Clock,
  Archive,
  FolderOpen,
  BarChart3,
  Settings
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AnalogTachographFile {
  id: string;
  filename: string;
  original_name: string;
  file_size: number;
  file_type: string;
  upload_date: string;
  driver_id?: string;
  vehicle_id?: string;
  chart_date: string;
  chart_type: 'analog' | 'digital';
  status: 'uploaded' | 'processed' | 'analyzed' | 'archived';
  storage_path: string;
  analysis_data?: any;
  notes?: string;
  organization_id: string;
  uploaded_by: string;
}

interface StorageStats {
  total_files: number;
  total_size: number;
  used_space: number;
  available_space: number;
  oldest_file: string;
  newest_file: string;
  file_types: { [key: string]: number };
}

const AnalogTachographUpload: React.FC = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedDriver, setSelectedDriver] = useState<string>('');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [chartDate, setChartDate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Fetch drivers
  const { data: drivers = [] } = useQuery({
    queryKey: ['drivers', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data, error } = await supabase
        .from('drivers')
        .select('id, first_name, last_name, employee_id')
        .eq('organization_id', profile.organization_id)
        .eq('status', 'active');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id
  });

  // Fetch vehicles
  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data, error } = await supabase
        .from('vehicles')
        .select('id, registration_number, make, model')
        .eq('organization_id', profile.organization_id)
        .eq('status', 'active');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id
  });

  // Fetch uploaded files
  const { data: uploadedFiles = [], isLoading: filesLoading } = useQuery({
    queryKey: ['analog-tachograph-files', profile?.organization_id, searchTerm, filterStatus, sortBy, sortOrder],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      let query = supabase
        .from('analog_tachograph_files')
        .select('*')
        .eq('organization_id', profile.organization_id);

      if (searchTerm) {
        query = query.ilike('original_name', `%${searchTerm}%`);
      }

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      // Add sorting
      const orderBy = sortBy === 'date' ? 'upload_date' : sortBy === 'name' ? 'original_name' : 'file_size';
      query = query.order(orderBy, { ascending: sortOrder === 'asc' });

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.organization_id
  });

  // Fetch storage statistics
  const { data: storageStats } = useQuery({
    queryKey: ['tachograph-storage-stats', profile?.organization_id],
    queryFn: async (): Promise<StorageStats> => {
      if (!profile?.organization_id) {
        return {
          total_files: 0,
          total_size: 0,
          used_space: 0,
          available_space: 10737418240, // 10GB default
          oldest_file: '',
          newest_file: '',
          file_types: {}
        };
      }

      const { data, error } = await supabase
        .from('analog_tachograph_files')
        .select('file_size, upload_date, file_type')
        .eq('organization_id', profile.organization_id);

      if (error) throw error;

      const files = data || [];
      const totalSize = files.reduce((sum, file) => sum + (file.file_size || 0), 0);
      const fileTypes = files.reduce((acc, file) => {
        acc[file.file_type] = (acc[file.file_type] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });

      const dates = files.map(f => f.upload_date).filter(Boolean).sort();
      
      return {
        total_files: files.length,
        total_size: totalSize,
        used_space: totalSize,
        available_space: 10737418240, // 10GB
        oldest_file: dates[0] || '',
        newest_file: dates[dates.length - 1] || '',
        file_types: fileTypes
      };
    },
    enabled: !!profile?.organization_id
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const uploadedFiles: AnalogTachographFile[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(((i + 1) / files.length) * 100);

        // Generate unique filename
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileExtension = file.name.split('.').pop();
        const uniqueFilename = `analog_tachograph_${timestamp}_${Math.random().toString(36).substr(2, 9)}.${fileExtension}`;

        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('tachograph-files')
          .upload(`${profile?.organization_id}/${uniqueFilename}`, file);

        if (uploadError) throw uploadError;

        // Save file metadata to database
        const fileRecord = {
          filename: uniqueFilename,
          original_name: file.name,
          file_size: file.size,
          file_type: fileExtension?.toLowerCase() || 'unknown',
          upload_date: new Date().toISOString(),
          driver_id: selectedDriver || null,
          vehicle_id: selectedVehicle || null,
          chart_date: chartDate || new Date().toISOString().split('T')[0],
          chart_type: 'analog' as const,
          status: 'uploaded' as const,
          storage_path: uploadData.path,
          organization_id: profile?.organization_id,
          uploaded_by: profile?.id
        };

        const { data: dbData, error: dbError } = await supabase
          .from('analog_tachograph_files')
          .insert(fileRecord)
          .select()
          .single();

        if (dbError) throw dbError;
        uploadedFiles.push(dbData);
      }

      return uploadedFiles;
    },
    onSuccess: (uploadedFiles) => {
      toast({
        title: "Upload Successful",
        description: `Successfully uploaded ${uploadedFiles.length} tachograph file(s)`
      });
      setSelectedFiles([]);
      setUploadProgress(0);
      setUploading(false);
      queryClient.invalidateQueries({ queryKey: ['analog-tachograph-files'] });
      queryClient.invalidateQueries({ queryKey: ['tachograph-storage-stats'] });
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: "Failed to upload tachograph files",
        variant: "destructive"
      });
      setUploading(false);
      setUploadProgress(0);
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (fileId: string) => {
      // Get file info first
      const { data: file, error: fetchError } = await supabase
        .from('analog_tachograph_files')
        .select('filename, storage_path')
        .eq('id', fileId)
        .single();

      if (fetchError) throw fetchError;

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('tachograph-files')
        .remove([file.storage_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('analog_tachograph_files')
        .delete()
        .eq('id', fileId);

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      toast({
        title: "File Deleted",
        description: "Tachograph file deleted successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['analog-tachograph-files'] });
      queryClient.invalidateQueries({ queryKey: ['tachograph-storage-stats'] });
    },
    onError: () => {
      toast({
        title: "Delete Failed",
        description: "Failed to delete tachograph file",
        variant: "destructive"
      });
    }
  });

  // Dropzone configuration
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setSelectedFiles(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.tiff', '.bmp'],
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt', '.csv']
    },
    maxSize: 50 * 1024 * 1024, // 50MB max
    multiple: true
  });

  // Handle file upload
  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select files to upload",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    uploadMutation.mutate(selectedFiles);
  };

  // Handle file deletion
  const handleDelete = async (fileId: string, filename: string) => {
    if (!confirm(`Are you sure you want to delete "${filename}"? This action cannot be undone.`)) {
      return;
    }
    deleteMutation.mutate(fileId);
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get storage usage percentage
  const storageUsagePercent = storageStats ? (storageStats.used_space / storageStats.available_space) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Storage Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Storage Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-semibold text-blue-800">Total Files</p>
                  <p className="text-2xl font-bold text-blue-600">{storageStats?.total_files || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-semibold text-green-800">Used Space</p>
                  <p className="text-2xl font-bold text-green-600">{formatFileSize(storageStats?.used_space || 0)}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-semibold text-orange-800">Available</p>
                  <p className="text-2xl font-bold text-orange-600">{formatFileSize(storageStats?.available_space || 0)}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-semibold text-purple-800">Usage</p>
                  <p className="text-2xl font-bold text-purple-600">{storageUsagePercent.toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <Progress value={storageUsagePercent} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              {formatFileSize(storageStats?.used_space || 0)} of {formatFileSize(storageStats?.available_space || 0)} used
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Analog Tachograph Files
          </CardTitle>
          <CardDescription>
            Upload analog tachograph charts, photos, or scanned documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* File Selection */}
            <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'
            }`}>
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
              </h3>
              <p className="text-muted-foreground mb-4">
                or click to browse files
              </p>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Choose Files
              </Button>
            </div>

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold">Selected Files ({selectedFiles.length})</h4>
                <div className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedFiles(files => files.filter((_, i) => i !== index))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="driver">Driver</Label>
                <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select driver" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No driver assigned</SelectItem>
                    {drivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.first_name} {driver.last_name} ({driver.employee_id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="vehicle">Vehicle</Label>
                <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No vehicle assigned</SelectItem>
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.registration_number} ({vehicle.make} {vehicle.model})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="chartDate">Chart Date</Label>
                <Input
                  type="date"
                  value={chartDate}
                  onChange={(e) => setChartDate(e.target.value)}
                  placeholder="Select date"
                />
              </div>
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading files...</span>
                  <span>{uploadProgress.toFixed(0)}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {/* Upload Button */}
            <Button 
              onClick={handleUpload} 
              disabled={selectedFiles.length === 0 || uploading}
              className="w-full"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload {selectedFiles.length} File{selectedFiles.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>

            {/* Supported Formats */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Supported formats:</strong> JPG, PNG, TIFF, BMP, PDF, TXT, CSV (Max 50MB per file)
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* File Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            File Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search files..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="uploaded">Uploaded</SelectItem>
                  <SelectItem value="processed">Processed</SelectItem>
                  <SelectItem value="analyzed">Analyzed</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value: 'date' | 'name' | 'size') => setSortBy(value)}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="size">Size</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setSortOrder(order => order === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>
            </div>

            {/* Files List */}
            {filesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : uploadedFiles.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No tachograph files uploaded yet</p>
                <p className="text-sm text-gray-500 mt-2">Upload your first analog tachograph file to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{file.original_name}</p>
                          <Badge variant={
                            file.status === 'uploaded' ? 'secondary' :
                            file.status === 'processed' ? 'default' :
                            file.status === 'analyzed' ? 'default' :
                            'outline'
                          }>
                            {file.status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(file.upload_date).toLocaleDateString()}
                          </span>
                          <span>{formatFileSize(file.file_size)}</span>
                          {file.driver_id && (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {drivers.find(d => d.id === file.driver_id)?.first_name} {drivers.find(d => d.id === file.driver_id)?.last_name}
                            </span>
                          )}
                          {file.vehicle_id && (
                            <span className="flex items-center gap-1">
                              <Truck className="h-3 w-3" />
                              {vehicles.find(v => v.id === file.vehicle_id)?.registration_number}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(file.id, file.original_name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalogTachographUpload;
