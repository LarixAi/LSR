
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Folder } from 'lucide-react';

interface FolderSelectionSectionProps {
  selectedFolder: string;
  onFolderChange: (value: string) => void;
  folders: string[];
  isCreatingFolder: boolean;
  onToggleCreateFolder: (creating: boolean) => void;
  newFolder: string;
  onNewFolderChange: (value: string) => void;
  onCreateFolder: () => void;
}

const FolderSelectionSection = ({
  selectedFolder,
  onFolderChange,
  folders,
  isCreatingFolder,
  onToggleCreateFolder,
  newFolder,
  onNewFolderChange,
  onCreateFolder,
}: FolderSelectionSectionProps) => {
  return (
    <div className="space-y-2">
      <Label className="flex items-center space-x-2">
        <Folder className="w-4 h-4" />
        <span>Folder</span>
      </Label>
      {!isCreatingFolder ? (
        <div className="flex space-x-2">
          <Select value={selectedFolder} onValueChange={onFolderChange}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select or create folder" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="General">General</SelectItem>
              {folders.map((folder) => (
                <SelectItem key={folder} value={folder}>
                  {folder}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            onClick={() => onToggleCreateFolder(true)}
          >
            New Folder
          </Button>
        </div>
      ) : (
        <div className="flex space-x-2">
          <Input
            value={newFolder}
            onChange={(e) => onNewFolderChange(e.target.value)}
            placeholder="Enter folder name"
          />
          <Button type="button" onClick={onCreateFolder}>
            Create
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onToggleCreateFolder(false)}
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
};

export default FolderSelectionSection;
