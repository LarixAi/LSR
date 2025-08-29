import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface FileUploadResult {
  success: boolean;
  fileUrl?: string;
  storagePath?: string;
  error?: string;
}

export const uploadFileToStorage = async (
  file: File,
  bucket: string,
  folder: string,
  organizationId: string,
  userId: string
): Promise<FileUploadResult> => {
  try {
    // Create unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    const storagePath = `${folder}/${organizationId}/${userId}/${fileName}`;

    console.log('Uploading file:', { bucket, storagePath, fileSize: file.size });

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return { success: false, error: uploadError.message };
    }

    // Get public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(storagePath);

    console.log('File uploaded successfully:', { storagePath, publicUrl });

    return {
      success: true,
      fileUrl: publicUrl,
      storagePath: storagePath
    };
  } catch (error) {
    console.error('File upload failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
};

export const deleteFileFromStorage = async (
  bucket: string,
  storagePath: string
): Promise<boolean> => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([storagePath]);

    if (error) {
      console.error('Delete error:', error);
      return false;
    }

    console.log('File deleted successfully:', storagePath);
    return true;
  } catch (error) {
    console.error('File deletion failed:', error);
    return false;
  }
};

export const getFileUrl = (bucket: string, storagePath: string): string => {
  if (!storagePath) return '';
  
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(storagePath);
  
  return publicUrl;
};

export const validateFile = (file: File, maxSizeMB: number = 10): { valid: boolean; error?: string } => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  if (!allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: 'File type not supported. Please upload PDF, DOC, DOCX, JPG, PNG, GIF, XLS, or XLSX files.' 
    };
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { 
      valid: false, 
      error: `File size too large. Maximum size is ${maxSizeMB}MB.` 
    };
  }

  return { valid: true };
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};