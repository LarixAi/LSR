
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Calendar, User } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getStatusColor, getCategoryColor, formatUploaderName } from '@/utils/documentUtils';

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

interface DocumentTableProps {
  documents: Document[];
  currentFolder: string;
}

const DocumentTable = ({ documents, currentFolder }: DocumentTableProps) => {
  if (documents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {currentFolder ? `${currentFolder} Documents` : 'Document Library'}
          </CardTitle>
          <CardDescription>
            {currentFolder 
              ? `Documents in the ${currentFolder} folder`
              : 'Centralized storage for all transport-related documents'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">
              {currentFolder 
                ? `No documents found in the ${currentFolder} folder.`
                : 'No documents found matching your search.'
              }
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {currentFolder ? `${currentFolder} Documents` : 'Document Library'}
        </CardTitle>
        <CardDescription>
          {currentFolder 
            ? `Documents in the ${currentFolder} folder`
            : 'Centralized storage for all transport-related documents'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Uploaded By</TableHead>
              <TableHead>Upload Date</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((document) => (
              <TableRow key={document.id}>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="font-medium">{document.name}</div>
                      <div className="text-sm text-gray-500">
                        {document.type} {document.file_size && `• ${document.file_size}`}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getCategoryColor(document.category)}>
                    {document.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{formatUploaderName(document.profiles)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{document.upload_date}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{document.expiry_date || 'No expiry'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(document.status || 'valid')}>
                    {document.status === 'expiring_soon' ? 'Expiring Soon' : 
                     document.status || 'Valid'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default DocumentTable;
