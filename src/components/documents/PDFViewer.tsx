import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye, Download, X, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PDFViewerProps {
  fileName: string;
  filePath: string;
  title: string;
  children?: React.ReactNode;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({ fileName, filePath, title, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loadError, setLoadError] = useState(false);

  console.log('PDFViewer props:', { fileName, filePath, title });

  // Check if this is a valid URL
  const isValidUrl = filePath && (filePath.startsWith('http') || filePath.startsWith('/') || filePath.startsWith('blob:'));
  
  const handleDownload = () => {
    if (!isValidUrl) {
      console.warn('Invalid file path for download:', filePath);
      return;
    }

    try {
      const link = document.createElement('a');
      link.href = filePath;
      link.download = fileName;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleObjectError = () => {
    console.error(`Failed to load PDF: ${filePath}`);
    setLoadError(true);
  };

  const handleObjectLoad = () => {
    console.log(`Successfully loaded PDF: ${filePath}`);
    setLoadError(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            View PDF
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl w-[90vw] h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </DialogHeader>
        <div className="flex-1 border rounded-md overflow-hidden bg-muted/20">
          {!isValidUrl ? (
            <div className="flex flex-col items-center justify-center h-full p-8 space-y-4">
              <Alert className="max-w-md">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  File not available. This document may not have been properly uploaded or the file path is invalid.
                </AlertDescription>
              </Alert>
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">Path: {filePath || 'No file path'}</p>
                <p className="text-xs text-muted-foreground">Please contact your administrator if this document should be available.</p>
              </div>
            </div>
          ) : loadError ? (
            <div className="flex flex-col items-center justify-center h-full p-8 space-y-4">
              <Alert className="max-w-md">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Unable to display file in browser. The file might not exist or there may be a browser compatibility issue.
                </AlertDescription>
              </Alert>
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">File path: {filePath}</p>
                <Button onClick={handleDownload} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Try Download Instead
                </Button>
              </div>
            </div>
          ) : fileName.toLowerCase().includes('.pdf') ? (
            <object
              data={filePath}
              type="application/pdf"
              className="w-full h-full border-0"
              style={{ minHeight: '600px' }}
              onError={handleObjectError}
              onLoad={handleObjectLoad}
            >
              <div className="flex flex-col items-center justify-center h-full p-8 space-y-4">
                <Alert className="max-w-md">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Your browser doesn't support PDF viewing. Please download the file to view it.
                  </AlertDescription>
                </Alert>
                <Button onClick={handleDownload} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </object>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 space-y-4">
              <Alert className="max-w-md">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This file type cannot be previewed in the browser. Click download to view the file.
                </AlertDescription>
              </Alert>
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">File: {fileName}</p>
                <Button onClick={handleDownload} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download File
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};