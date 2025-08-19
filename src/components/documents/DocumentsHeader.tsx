
import React from 'react';

interface DocumentsHeaderProps {
  totalDocuments: number;
  totalFolders: number;
}

const DocumentsHeader = ({ totalDocuments, totalFolders }: DocumentsHeaderProps) => {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Document Management</h1>
      <p className="text-gray-600">
        Comprehensive compliance-focused document management - {totalDocuments} documents across {totalFolders} folders
      </p>
    </div>
  );
};

export default DocumentsHeader;
