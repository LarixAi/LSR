
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import ComplianceDocumentCategories from '@/components/documents/ComplianceDocumentCategories';
import EnhancedDocumentSearch from '@/components/documents/EnhancedDocumentSearch';
import DocumentTable from '@/components/documents/DocumentTable';

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

interface OverviewTabProps {
  folders: string[];
  currentFolder: string;
  onFolderChange: (folder: string) => void;
  documentCounts: Record<string, number>;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  dateRange: string;
  onDateRangeChange: (value: string) => void;
  onUploadClick: () => void;
  onExportClick: () => void;
  onRefresh: () => void;
  showNewCategory: boolean;
  onNewCategoryClick?: () => void;
  filteredDocuments: Document[];
}

const OverviewTab = ({
  folders,
  currentFolder,
  onFolderChange,
  documentCounts,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  dateRange,
  onDateRangeChange,
  onUploadClick,
  onExportClick,
  onRefresh,
  showNewCategory,
  onNewCategoryClick,
  filteredDocuments
}: OverviewTabProps) => {
  return (
    <TabsContent value="overview" className="space-y-6">
      <ComplianceDocumentCategories
        categories={folders}
        selectedCategory={currentFolder}
        onCategoryChange={onFolderChange}
        documentCounts={documentCounts}
      />

      <EnhancedDocumentSearch
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        statusFilter={statusFilter}
        onStatusFilterChange={onStatusFilterChange}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={onCategoryFilterChange}
        dateRange={dateRange}
        onDateRangeChange={onDateRangeChange}
        onUploadClick={onUploadClick}
        onExportClick={onExportClick}
        onRefresh={onRefresh}
        showNewCategory={showNewCategory}
        onNewCategoryClick={onNewCategoryClick}
      />

      <DocumentTable
        documents={filteredDocuments}
        currentFolder={currentFolder}
      />
    </TabsContent>
  );
};

export default OverviewTab;
