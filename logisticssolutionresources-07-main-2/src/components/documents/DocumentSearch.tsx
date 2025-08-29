
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Upload, Plus } from 'lucide-react';

interface DocumentSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onUploadClick: () => void;
  showNewCategory?: boolean;
  onNewCategoryClick?: () => void;
}

const DocumentSearch = ({ 
  searchTerm, 
  onSearchChange, 
  onUploadClick,
  showNewCategory = false,
  onNewCategoryClick 
}: DocumentSearchProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search documents..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          className="flex items-center space-x-2"
          onClick={onUploadClick}
        >
          <Upload className="w-4 h-4" />
          <span>Upload Document</span>
        </Button>
        {showNewCategory && onNewCategoryClick && (
          <Button className="flex items-center space-x-2" onClick={onNewCategoryClick}>
            <Plus className="w-4 h-4" />
            <span>New Folder</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default DocumentSearch;
