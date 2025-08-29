import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X, File, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { uploadFileToStorage, validateFile, formatFileSize } from '@/utils/fileUpload';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
}

const DocumentUploadModal = ({ isOpen, onClose, organizationId }: DocumentUploadModalProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    type: '',
    expiry_date: '',
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileError, setFileError] = useState<string | null>(null);

  const categories = [
    'Driver Documents - License',
    'Driver Documents - Insurance', 
    'Driver Documents - Medical',
    'Vehicle Documents - Registration',
    'Vehicle Documents - Insurance',
    'Vehicle Documents - MOT',
    'Compliance - Safety Certificate',
    'Compliance - Training Record',
    'Route Documents - Schedule',
    'Route Documents - Risk Assessment',
    'Safety Documents - Emergency Procedures',
    'General'
  ];

  const documentTypes = [
    'PDF',
    'DOC', 
    'DOCX',
    'JPG',
    'PNG',
    'XLS',
    'XLSX'
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file
      const validation = validateFile(file, 10); // 10MB limit
      if (!validation.valid) {
        setFileError(validation.error || 'Invalid file');
        setSelectedFile(null);
        return;
      }

      setFileError(null);
      setSelectedFile(file);
      
      if (!formData.name) {
        setFormData(prev => ({ ...prev, name: file.name.split('.')[0] }));
      }
      const extension = file.name.split('.').pop()?.toUpperCase();
      if (extension && !formData.type) {
        setFormData(prev => ({ ...prev, type: extension }));
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    if (!formData.name || !formData.category || !formData.type) {
      toast.error('Please fill in all required fields');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Upload file to Supabase Storage
      setUploadProgress(25);
      const uploadResult = await uploadFileToStorage(
        selectedFile,
        'documents',
        'uploads',
        organizationId,
        user.id
      );

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'File upload failed');
      }

      setUploadProgress(75);

      // Mock document save (table doesn't exist yet)
      console.log('Document would be saved:', formData);

      setUploadProgress(100);
      toast.success('Document uploaded successfully!');
      
      // Refresh the documents list
      queryClient.invalidateQueries({ queryKey: ['admin-documents'] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      
      // Reset form
      setSelectedFile(null);
      setFormData({ name: '', category: '', type: '', expiry_date: '' });
      setFileError(null);
      setUploadProgress(0);
      onClose();
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Add a new document to your organization's document library.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Upload */}
          <div>
            <Label>Document File *</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
              {selectedFile ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-muted rounded">
                    <div className="flex items-center space-x-2">
                      <File className="w-4 h-4" />
                      <div className="text-left">
                        <span className="text-sm font-medium block">{selectedFile.name}</span>
                        <span className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</span>
                      </div>
                    </div>
                    <Button 
                      type="button"
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setSelectedFile(null);
                        setFileError(null);
                      }}
                      disabled={uploading}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  {uploading && (
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    PDF, DOC, DOCX, JPG, PNG, XLS, XLSX (max 10MB)
                  </p>
                  <Input
                    type="file"
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.xls,.xlsx"
                    className="cursor-pointer"
                    disabled={uploading}
                  />
                </div>
              )}
            </div>
            {fileError && (
              <Alert className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{fileError}</AlertDescription>
              </Alert>
            )}
          </div>

          {/* Document Name */}
          <div>
            <Label htmlFor="name">Document Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter document name"
              required
            />
          </div>

          {/* Category */}
          <div>
            <Label>Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleInputChange('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Document Type */}
          <div>
            <Label>Document Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleInputChange('type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Expiry Date */}
          <div>
            <Label htmlFor="expiry_date">Expiry Date (Optional)</Label>
            <Input
              id="expiry_date"
              type="date"
              value={formData.expiry_date}
              onChange={(e) => handleInputChange('expiry_date', e.target.value)}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={uploading || !selectedFile || !!fileError}>
              {uploading ? `Uploading... ${uploadProgress}%` : 'Upload Document'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentUploadModal;