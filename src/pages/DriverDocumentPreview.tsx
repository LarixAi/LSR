import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, ArrowLeft, Home } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function DriverDocumentPreview() {
  const { driverId } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [name, setName] = useState<string>('Document Preview');
  const [fileType, setFileType] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [filePath, setFilePath] = useState<string | null>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const n = params.get('name') || 'Document Preview';
    const t = params.get('type') || '';
    const fn = params.get('fileName') || '';
    const url = params.get('url');
    const path = params.get('path');
    setName(n);
    setFileType(t);
    setFileName(fn);
    setFileUrl(url);
    setFilePath(path);
  }, [params]);

  useEffect(() => {
    const createSigned = async () => {
      if (fileUrl) { setSignedUrl(fileUrl); setLoading(false); return; }
      if (filePath) {
        const { data } = await supabase.storage.from('documents').createSignedUrl(filePath, 60 * 30);
        setSignedUrl(data?.signedUrl || null);
      }
      setLoading(false);
    };
    createSigned();
  }, [fileUrl, filePath]);

  const handleDownload = async () => {
    if (fileUrl) { window.open(fileUrl, '_blank'); return; }
    if (filePath) {
      const { data } = await supabase.storage.from('documents').createSignedUrl(filePath, 60 * 10);
      if (data?.signedUrl) window.open(data.signedUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header to match AddDriver layout */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/drivers/${driverId}`)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Driver
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">View Document</h1>
                <p className="text-gray-600">Preview and download driver document</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
          <div className="text-sm text-muted-foreground truncate">
            <span className="font-medium">{name}</span>
            <span className="mx-2">•</span>
            <span>{fileType.toUpperCase()}</span>
            {fileName && <span className="mx-2 text-gray-500">{fileName}</span>}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate(`/drivers/${driverId}`)}>Close</Button>
            <Button onClick={handleDownload}><Download className="w-4 h-4 mr-2" />Download</Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{name}</CardTitle>
            <CardDescription>{fileType.toUpperCase()} {fileName ? `• ${fileName}` : ''}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-[70vh]">Loading…</div>
            ) : signedUrl ? (
              fileType.includes('pdf') ? (
                <iframe src={signedUrl} className="w-full h-[80vh]" />
              ) : (
                <img src={signedUrl} alt={name} className="max-h-[80vh] object-contain mx-auto" />
              )
            ) : (
              <div className="text-sm text-gray-600">Preview unavailable. Use Download.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
