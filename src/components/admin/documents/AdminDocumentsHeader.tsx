
import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Building } from 'lucide-react';

interface AdminDocumentsHeaderProps {
  organizationName?: string;
  onUploadClick: () => void;
}

const AdminDocumentsHeader = ({ organizationName, onUploadClick }: AdminDocumentsHeaderProps) => {
  return (
    <div className="flex justify-between items-start">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Document Management</h1>
        <p className="text-gray-600">Manage and review all organizational documents</p>
        {organizationName && (
          <div className="flex items-center mt-2 text-sm text-gray-500">
            <Building className="w-4 h-4 mr-1" />
            <span>{organizationName}</span>
          </div>
        )}
      </div>
      <Button onClick={onUploadClick}>
        <Upload className="w-4 h-4 mr-2" />
        Upload Document
      </Button>
    </div>
  );
};

export default AdminDocumentsHeader;
