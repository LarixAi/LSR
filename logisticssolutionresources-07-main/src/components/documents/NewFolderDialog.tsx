
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Folder } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NewFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingFolders: string[];
  onFolderCreated: (folderName: string) => void;
}

const NewFolderDialog = ({ open, onOpenChange, existingFolders, onFolderCreated }: NewFolderDialogProps) => {
  const [folderName, setFolderName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!folderName.trim()) {
      toast({
        title: "Invalid Name",
        description: "Please enter a folder name.",
        variant: "destructive",
      });
      return;
    }

    const trimmedName = folderName.trim();
    
    if (existingFolders.includes(trimmedName)) {
      toast({
        title: "Folder Exists",
        description: "A folder with this name already exists.",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      // Call the parent function to handle folder creation
      onFolderCreated(trimmedName);
      
      toast({
        title: "Folder Created",
        description: `Folder "${trimmedName}" has been created successfully.`,
      });

      // Reset form and close dialog
      setFolderName('');
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: "Failed to create folder. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Folder className="w-5 h-5" />
            <span>Create New Folder</span>
          </DialogTitle>
          <DialogDescription>
            Create a new folder to organize your documents
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="folderName">Folder Name *</Label>
            <Input
              id="folderName"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Enter folder name"
              required
              autoFocus
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating || !folderName.trim()}>
              {isCreating ? 'Creating...' : 'Create Folder'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewFolderDialog;
