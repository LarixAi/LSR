import { useMemo } from 'react';

interface Document {
  id: string;
  name: string;
  type: string;
  category: string;
  file_size?: string;
  upload_date: string;
  expiry_date?: string;
  status?: string;
  profiles?: { first_name: string; last_name: string } | null;
}

interface UseDocumentFiltersProps {
  documents: Document[];
  currentFolder: string;
  searchTerm: string;
  statusFilter: string;
  categoryFilter: string;
  dateRange: string;
}

export const useDocumentFilters = ({
  documents,
  currentFolder,
  searchTerm,
  statusFilter,
  categoryFilter,
  dateRange
}: UseDocumentFiltersProps) => {
  return useMemo(() => {
    return documents.filter(doc => {
      // Folder filter
      const docFolder = doc.category?.split(' - ')[0] || 'General';
      const folderMatch = !currentFolder || docFolder === currentFolder;
      
      // Search filter
      const searchMatch = !searchTerm || 
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Status filter
      const statusMatch = statusFilter === 'all' || doc.status === statusFilter;
      
      // Category filter
      const categoryMatch = categoryFilter === 'all' || docFolder === categoryFilter;
      
      // Date range filter (simplified for now)
      const dateMatch = dateRange === 'all'; // Can be enhanced with actual date filtering
      
      return folderMatch && searchMatch && statusMatch && categoryMatch && dateMatch;
    });
  }, [documents, currentFolder, searchTerm, statusFilter, categoryFilter, dateRange]);
};
