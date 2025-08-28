
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useDocumentUploadForm } from '@/hooks/useDocumentUploadForm';
import FileUploadSection from '@/components/documents/upload/FileUploadSection';
import FolderSelectionSection from '@/components/documents/upload/FolderSelectionSection';
import DocumentFormFields from '@/components/documents/upload/DocumentFormFields';

interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentFolder?: string;
  folders: string[];
}

const DocumentUploadDialog = ({ open, onOpenChange, currentFolder, folders }: DocumentUploadDialogProps) => {
  const {
    files,
    documentName,
    setDocumentName,
    description,
    setDescription,
    category,
    setCategory,
    selectedFolder,
    setSelectedFolder,
    newFolder,
    setNewFolder,
    isCreatingFolder,
    setIsCreatingFolder,
    expiryDate,
    setExpiryDate,
    isUploading,
    handleFileUpload,
    removeFile,
    handleCreateFolder,
    handleSubmit,
    resetForm,
  } = useDocumentUploadForm(() => onOpenChange(false));

  // Set initial folder when dialog opens
  React.useEffect(() => {
    if (open && currentFolder) {
      setSelectedFolder(currentFolder);
    }
  }, [open, currentFolder, setSelectedFolder]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit();
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Documents</DialogTitle>
          <DialogDescription>
            Upload and organize your documents with folder support
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-6">
          <FileUploadSection
            files={files}
            onFileUpload={handleFileUpload}
            onRemoveFile={removeFile}
          />

          <DocumentFormFields
            documentName={documentName}
            onDocumentNameChange={setDocumentName}
            category={category}
            onCategoryChange={setCategory}
            description={description}
            onDescriptionChange={setDescription}
            expiryDate={expiryDate}
            onExpiryDateChange={setExpiryDate}
          />

          <FolderSelectionSection
            selectedFolder={selectedFolder}
            onFolderChange={setSelectedFolder}
            folders={folders}
            isCreatingFolder={isCreatingFolder}
            onToggleCreateFolder={setIsCreatingFolder}
            newFolder={newFolder}
            onNewFolderChange={setNewFolder}
            onCreateFolder={handleCreateFolder}
          />

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isUploading}>
              {isUploading ? 'Uploading...' : 'Upload Documents'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentUploadDialog;
