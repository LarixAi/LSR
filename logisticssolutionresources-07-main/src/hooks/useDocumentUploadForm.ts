
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export const useDocumentUploadForm = (onSuccess?: () => void) => {
  const [files, setFiles] = useState<File[]>([]);
  const [documentName, setDocumentName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('General');
  const [newFolder, setNewFolder] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined);

  const { toast } = useToast();

  const documentUploadMutation = useMutation({
    mutationFn: async (documentData: any) => {
      // Mock document upload for now
      console.log('Uploading document:', documentData);
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Document uploaded successfully',
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: 'Failed to upload document',
        variant: 'destructive',
      });
    }
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateFolder = () => {
    if (newFolder.trim()) {
      setSelectedFolder(newFolder.trim());
      setNewFolder('');
      setIsCreatingFolder(false);
    }
  };

  const handleSubmit = async () => {
    if (files.length === 0) return;

    const documentData = {
      type: files[0].type,
      category: selectedFolder || 'General',
      related_entity_id: 'temp-id',
      related_entity_type: 'general',
      status: 'pending'
    };

    await documentUploadMutation.mutateAsync(documentData);
    resetForm();
  };

  const resetForm = () => {
    setFiles([]);
    setDocumentName('');
    setDescription('');
    setCategory('');
    setSelectedFolder('General');
    setNewFolder('');
    setIsCreatingFolder(false);
    setExpiryDate(undefined);
  };

  return {
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
    handleFileUpload,
    removeFile,
    handleCreateFolder,
    handleSubmit,
    resetForm,
    isUploading: documentUploadMutation.isPending,
  };
};
