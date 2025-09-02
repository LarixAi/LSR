import React, { useState } from 'react';
import { Folder, Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { useLicenseFolders, LicenseFolder } from '@/hooks/useLicenseFolders';

interface FolderManagerProps {
  organizationId: string;
  onFolderSelect?: (folder: LicenseFolder | null) => void;
  selectedFolder?: LicenseFolder | null;
}

const FolderManager: React.FC<FolderManagerProps> = ({
  organizationId,
  onFolderSelect,
  selectedFolder
}) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const { folders, createFolder, deleteFolder, isCreating, isDeleting } = useLicenseFolders(organizationId);

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createFolder({ name: newFolderName.trim() });
      setNewFolderName('');
      setIsCreateDialogOpen(false);
    }
  };

  const handleDeleteFolder = (folderId: string) => {
    if (window.confirm('Are you sure you want to delete this folder? This action cannot be undone.')) {
      deleteFolder(folderId);
      if (selectedFolder?.id === folderId) {
        onFolderSelect?.(null);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Document Folders</h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Folder
            </Button>
          </DialogTrigger>
          <DialogContent aria-describedby="create-folder-desc">
            <DialogHeader>
              <DialogTitle>Create New Folder</DialogTitle>
              <DialogDescription id="create-folder-desc">
                Create a new folder to organize your documents
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
              />
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateFolder}
                  disabled={!newFolderName.trim() || isCreating}
                >
                  {isCreating ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {/* All Documents folder */}
        <Card 
          className={`cursor-pointer transition-colors ${
            !selectedFolder ? 'ring-2 ring-primary' : 'hover:bg-accent'
          }`}
          onClick={() => onFolderSelect?.(null)}
        >
          <CardContent className="p-4 text-center">
            <Folder className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <p className="text-sm font-medium">All Documents</p>
          </CardContent>
        </Card>

        {/* Dynamic folders */}
        {folders.map((folder) => (
          <Card 
            key={folder.id}
            className={`cursor-pointer transition-colors group ${
              selectedFolder?.id === folder.id ? 'ring-2 ring-primary' : 'hover:bg-accent'
            }`}
            onClick={() => onFolderSelect?.(folder)}
          >
            <CardContent className="p-4 text-center relative">
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteFolder(folder.id);
                }}
                disabled={isDeleting}
              >
                <Trash2 className="w-3 h-3 text-red-500" />
              </Button>
              <Folder className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
              <p className="text-sm font-medium truncate" title={folder.name}>
                {folder.name}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FolderManager;