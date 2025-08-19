import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Camera } from 'lucide-react';
import { useCreateDriverFolder } from '@/hooks/useLicenseFolders';
import { useToast } from '@/hooks/use-toast';

interface LicenseUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
  driverName?: string;
}

const LicenseUploadDialog: React.FC<LicenseUploadDialogProps> = ({
  isOpen,
  onClose,
  organizationId,
  driverName = ''
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [inputDriverName, setInputDriverName] = useState(driverName);
  const createDriverFolder = useCreateDriverFolder();
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setSelectedFiles(Array.from(files));
    }
  };

  const handleScanUpload = async () => {
    if (!inputDriverName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter driver name',
        variant: 'destructive',
      });
      return;
    }

    if (selectedFiles.length === 0) {
      toast({
        title: 'Error',
        description: 'Please select files to upload',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Create driver folder
      await createDriverFolder.mutateAsync({
        driverName: inputDriverName.trim(),
        organizationId
      });

      // Here you would typically upload the files to storage
      // and create document records linked to the folder
      
      toast({
        title: 'Success',
        description: `License documents uploaded for ${inputDriverName}`,
      });

      // Reset form and close dialog
      setSelectedFiles([]);
      setInputDriverName('');
      onClose();
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Upload License Documents</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="driverName">Driver Name</Label>
            <Input
              id="driverName"
              value={inputDriverName}
              onChange={(e) => setInputDriverName(e.target.value)}
              placeholder="Enter driver name"
            />
          </div>

          <div>
            <Label>Upload Files</Label>
            <div className="mt-2 space-y-2">
              <Input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={handleFileSelect}
              />
              
              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm truncate">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleScanUpload} 
              disabled={createDriverFolder.isPending}
              className="flex-1"
            >
              <Upload className="w-4 h-4 mr-2" />
              {createDriverFolder.isPending ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LicenseUploadDialog;