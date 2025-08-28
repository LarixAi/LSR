
import React from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import FolderBrowser from '@/components/documents/FolderBrowser';
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

interface BrowseTabProps {
  folders: string[];
  currentFolder: string;
  onFolderChange: (folder: string) => void;
  documentCounts: Record<string, number>;
  filteredDocuments: Document[];
}

const BrowseTab = ({
  folders,
  currentFolder,
  onFolderChange,
  documentCounts,
  filteredDocuments
}: BrowseTabProps) => {
  return (
    <TabsContent value="browse" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Browse by Folder</CardTitle>
          <CardDescription>
            Organize and navigate your documents by folders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FolderBrowser
            folders={folders}
            currentFolder={currentFolder}
            onFolderChange={onFolderChange}
            documentCounts={documentCounts}
          />
        </CardContent>
      </Card>

      <DocumentTable
        documents={filteredDocuments}
        currentFolder={currentFolder}
      />
    </TabsContent>
  );
};

export default BrowseTab;
