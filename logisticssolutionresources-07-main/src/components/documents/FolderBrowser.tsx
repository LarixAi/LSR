
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Folder, FolderOpen, ChevronRight, Home } from 'lucide-react';

interface FolderBrowserProps {
  folders: string[];
  currentFolder: string;
  onFolderChange: (folder: string) => void;
  documentCounts: Record<string, number>;
}

const FolderBrowser = ({ folders, currentFolder, onFolderChange, documentCounts }: FolderBrowserProps) => {
  const folderHierarchy = currentFolder ? currentFolder.split('/') : [];

  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) {
      onFolderChange('');
    } else {
      const newPath = folderHierarchy.slice(0, index + 1).join('/');
      onFolderChange(newPath);
    }
  };

  return (
    <div className="space-y-4">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-2 text-sm">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleBreadcrumbClick(-1)}
          className="flex items-center space-x-1"
        >
          <Home className="w-4 h-4" />
          <span>All Documents</span>
        </Button>
        
        {folderHierarchy.map((folder, index) => (
          <React.Fragment key={index}>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleBreadcrumbClick(index)}
              className="flex items-center space-x-1"
            >
              <Folder className="w-4 h-4" />
              <span>{folder}</span>
            </Button>
          </React.Fragment>
        ))}
      </div>

      {/* Folder Grid */}
      {!currentFolder && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {folders.map((folder) => (
            <Button
              key={folder}
              variant="outline"
              onClick={() => onFolderChange(folder)}
              className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-accent"
            >
              <div className="flex items-center space-x-2">
                {currentFolder === folder ? (
                  <FolderOpen className="w-6 h-6 text-blue-500" />
                ) : (
                  <Folder className="w-6 h-6 text-blue-500" />
                )}
              </div>
              <div className="text-center">
                <div className="font-medium text-sm">{folder}</div>
                <Badge variant="secondary" className="text-xs">
                  {documentCounts[folder] || 0} docs
                </Badge>
              </div>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FolderBrowser;
