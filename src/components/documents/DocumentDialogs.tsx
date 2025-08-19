
import React from 'react';
import DocumentUploadDialog from '@/components/documents/DocumentUploadDialog';
import NewFolderDialog from '@/components/documents/NewFolderDialog';

interface DocumentDialogsProps {
  showUploadDialog: boolean;
  onUploadDialogChange: (open: boolean) => void;
  showNewFolderDialog: boolean;
  onNewFolderDialogChange: (open: boolean) => void;
  currentFolder: string;
  folders: string[];
  onFolderCreated: (folderName: string) => void;
}

const DocumentDialogs = ({
  showUploadDialog,
  onUploadDialogChange,
  showNewFolderDialog,
  onNewFolderDialogChange,
  currentFolder,
  folders,
  onFolderCreated
}: DocumentDialogsProps) => {
  return (
    <>
      <DocumentUploadDialog
        open={showUploadDialog}
        onOpenChange={onUploadDialogChange}
        currentFolder={currentFolder}
        folders={folders}
      />

      <NewFolderDialog
        open={showNewFolderDialog}
        onOpenChange={onNewFolderDialogChange}
        existingFolders={folders}
        onFolderCreated={onFolderCreated}
      />
    </>
  );
};

export default DocumentDialogs;
