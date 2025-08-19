
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X } from 'lucide-react';

interface FileUploadSectionProps {
  files: File[];
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (index: number) => void;
}

const FileUploadSection = ({ files, onFileUpload, onRemoveFile }: FileUploadSectionProps) => {
  return (
    <div className="space-y-4">
      <Label className="flex items-center space-x-2">
        <Upload className="w-4 h-4" />
        <span>Select Files *</span>
      </Label>
      <Input
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
        onChange={onFileUpload}
        required
      />
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-2 border rounded">
              <div className="flex-1">
                <span className="text-sm font-medium">{file.name}</span>
                <span className="text-xs text-gray-500 ml-2">
                  ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onRemoveFile(index)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUploadSection;
