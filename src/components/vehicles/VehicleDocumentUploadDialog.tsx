import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Upload, 
  FileText, 
  X, 
  AlertCircle, 
  CheckCircle,
  Calendar,
  Tag,
  Building,
  Star
} from 'lucide-react';
import { useCreateVehicleDocument, type VehicleDocument } from '@/hooks/useVehicleDocuments';
import { useVehicles } from '@/hooks/useVehicles';
import { uploadFileToStorage } from '@/utils/fileUpload';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface VehicleDocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicleId?: string; // Optional - if not provided, user can select
  vehicleNumber?: string; // Optional - if not provided, user can select
  allowVehicleSelection?: boolean; // Whether to show vehicle selection dropdown
}

const VehicleDocumentUploadDialog = ({ 
  open, 
  onOpenChange, 
  vehicleId, 
  vehicleNumber,
  allowVehicleSelection = false
}: VehicleDocumentUploadDialogProps) => {
  const { profile } = useAuth();
  const createDocument = useCreateVehicleDocument();
  const { data: vehicles = [] } = useVehicles();
  
  // State for vehicle selection
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicleId || '');
  const [selectedVehicleNumber, setSelectedVehicleNumber] = useState<string>(vehicleNumber || '');
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    expiryDate: '',
    tags: '',
    isConfidential: false,
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    department: '',
    version: '1.0',
    isFavorite: false
  });

  const documentCategories = [
    'Vehicle Registration',
    'Vehicle Insurance',
    'MOT Certificate',
    'Service History',
    'Maintenance Records',
    'Safety Certificate',
    'Compliance Documents',
    'Inspection Reports',
    'Repair Records',
    'Warranty Documents',
    'Other'
  ];

  const departments = [
    'Fleet Management',
    'Maintenance',
    'Compliance',
    'Operations',
    'Safety',
    'Administration',
    'Other'
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        toast.error('File size must be less than 50MB');
        return;
      }

      setSelectedFile(file);
      
      // Auto-fill name if empty
      if (!formData.name) {
        setFormData(prev => ({ 
          ...prev, 
          name: file.name.split('.')[0] 
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile || !profile?.organization_id) {
      toast.error('Please select a file to upload');
      return;
    }

    if (!formData.name || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Check if vehicle is selected when vehicle selection is allowed
    if (allowVehicleSelection && !selectedVehicleId) {
      toast.error('Please select a vehicle for this document');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Upload file to storage
      setUploadProgress(25);
      const uploadResult = await uploadFileToStorage(
        selectedFile,
        'documents',
        'vehicle-documents',
        profile.organization_id,
        profile.id
      );

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'File upload failed');
      }

      setUploadProgress(75);

      // Create document record
      const documentData: Partial<VehicleDocument> = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        expiry_date: formData.expiryDate || undefined,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        is_public: !formData.isConfidential,
        file_name: selectedFile.name,
        file_path: uploadResult.storagePath!,
        file_type: selectedFile.type,
        file_size: selectedFile.size,
        status: 'active',
        priority: formData.priority,
        department: formData.department,
        version: formData.version,
        is_favorite: formData.isFavorite,
        vehicle_id: selectedVehicleId || vehicleId,
        organization_id: profile.organization_id,
        uploaded_by: profile.id
      };

      await createDocument.mutateAsync(documentData);

      setUploadProgress(100);
      
      // Reset form
      setSelectedFile(null);
      setFormData({
        name: '',
        category: '',
        description: '',
        expiryDate: '',
        tags: '',
        isConfidential: false,
        priority: 'medium',
        department: '',
        version: '1.0',
        isFavorite: false
      });
      if (allowVehicleSelection) {
        setSelectedVehicleId('');
        setSelectedVehicleNumber('');
      }
      setUploadProgress(0);
      onOpenChange(false);
      
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setSelectedFile(null);
      setFormData({
        name: '',
        category: '',
        description: '',
        expiryDate: '',
        tags: '',
        isConfidential: false,
        priority: 'medium',
        department: '',
        version: '1.0',
        isFavorite: false
      });
      if (allowVehicleSelection) {
        setSelectedVehicleId('');
        setSelectedVehicleNumber('');
      }
      setUploadProgress(0);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {allowVehicleSelection ? 'Upload Vehicle Document' : `Upload Document for ${vehicleNumber}`}
          </DialogTitle>
          <DialogDescription>
            {allowVehicleSelection 
              ? 'Upload a document and select which vehicle it belongs to'
              : `Upload a document for vehicle ${vehicleNumber}`
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload Section */}
          <div className="space-y-4">
            <Label htmlFor="file">Document File *</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                id="file"
                type="file"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt"
                className="hidden"
                disabled={isUploading}
              />
              <label htmlFor="file" className="cursor-pointer">
                {selectedFile ? (
                  <div className="space-y-2">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                      disabled={isUploading}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remove File
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                    <p className="font-medium">Click to select file</p>
                    <p className="text-sm text-gray-500">
                      PDF, DOC, XLS, Images, or Text files up to 50MB
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {/* Vehicle Selection (if allowed) */}
          {allowVehicleSelection && (
            <div className="col-span-full">
              <Label htmlFor="vehicle">Select Vehicle *</Label>
              <Select
                value={selectedVehicleId}
                onValueChange={(value) => {
                  setSelectedVehicleId(value);
                  const vehicle = vehicles.find(v => v.id === value);
                  setSelectedVehicleNumber(vehicle?.vehicle_number || '');
                }}
                disabled={isUploading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.vehicle_number} - {vehicle.make} {vehicle.model} ({vehicle.license_plate})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedVehicleNumber && (
                <p className="text-sm text-muted-foreground mt-1">
                  Selected: {selectedVehicleNumber}
                </p>
              )}
            </div>
          )}

          {/* Document Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Document Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter document name"
                disabled={isUploading}
              />
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                disabled={isUploading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {documentCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: 'low' | 'medium' | 'high' | 'critical') => 
                  setFormData(prev => ({ ...prev, priority: value }))
                }
                disabled={isUploading}
              >
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

            <div>
              <Label htmlFor="department">Department</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
                disabled={isUploading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                disabled={isUploading}
              />
            </div>

            <div>
              <Label htmlFor="version">Version</Label>
              <Input
                id="version"
                value={formData.version}
                onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                placeholder="1.0"
                disabled={isUploading}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="Enter tags separated by commas"
              disabled={isUploading}
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter document description"
              rows={3}
              disabled={isUploading}
            />
          </div>

          {/* Options */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isConfidential"
                checked={formData.isConfidential}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, isConfidential: checked as boolean }))
                }
                disabled={isUploading}
              />
              <Label htmlFor="isConfidential">Mark as confidential</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isFavorite"
                checked={formData.isFavorite}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, isFavorite: checked as boolean }))
                }
                disabled={isUploading}
              />
              <Label htmlFor="isFavorite">Mark as favorite</Label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!selectedFile || !formData.name || !formData.category || isUploading}
            >
              {isUploading ? 'Uploading...' : 'Upload Document'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default VehicleDocumentUploadDialog;
