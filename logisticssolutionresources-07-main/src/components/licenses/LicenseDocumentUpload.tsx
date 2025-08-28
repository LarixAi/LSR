
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LicenseDocumentUploadProps {
  onUploadComplete?: (files: { frontUrl: string; backUrl: string }) => void;
  existingFrontUrl?: string;
  existingBackUrl?: string;
  label?: string;
  required?: boolean; // defaults to true
}

const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
const maxSizeBytes = 5 * 1024 * 1024; // 5MB

const LicenseDocumentUpload: React.FC<LicenseDocumentUploadProps> = ({
  onUploadComplete,
  existingFrontUrl,
  existingBackUrl,
  label = "License Document",
  required = true,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [frontUrl, setFrontUrl] = useState<string | null>(existingFrontUrl || null);
  const [backUrl, setBackUrl] = useState<string | null>(existingBackUrl || null);
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateFile = (file: File) => {
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a JPG or PNG image.',
        variant: 'destructive',
      });
      return false;
    }
    if (file.size > maxSizeBytes) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 5MB.',
        variant: 'destructive',
      });
      return false;
    }
    return true;
  };

  const simulateUpload = async (side: 'front' | 'back', file: File) => {
    // Simulate upload delay; replace with Supabase Storage when ready
    const mockUrl = `driver-documents/${side}_${Date.now()}_${file.name}`;
    await new Promise((r) => setTimeout(r, 900));
    return mockUrl;
  };

  const handleFileSelect = async (side: 'front' | 'back', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!validateFile(file)) return;

    setIsUploading(true);
    try {
      const url = await simulateUpload(side, file);
      if (side === 'front') setFrontUrl(url);
      if (side === 'back') setBackUrl(url);

      const next = {
        frontUrl: side === 'front' ? url : frontUrl || '',
        backUrl: side === 'back' ? url : backUrl || '',
      };

      // Only fire callback when both sides are present (or when not required)
      if ((!required && (next.frontUrl || next.backUrl)) || (next.frontUrl && next.backUrl)) {
        onUploadComplete?.(next as { frontUrl: string; backUrl: string });
        toast({ title: 'Upload complete', description: `${label} ${side} uploaded.` });
      } else {
        toast({ title: 'Partial upload saved', description: `Please upload the ${side === 'front' ? 'back' : 'front'} side.` });
      }
    } catch (err) {
      toast({ title: 'Upload failed', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const removeSide = (side: 'front' | 'back') => {
    if (side === 'front') setFrontUrl(null);
    if (side === 'back') setBackUrl(null);
    // Do not call onUploadComplete here to avoid clearing parent state prematurely
    (side === 'front' ? frontInputRef : backInputRef).current && ((side === 'front' ? frontInputRef : backInputRef).current!.value = '');
  };

  const canSubmit = !!frontUrl && !!backUrl;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <h4 className="font-medium">{label} (Front and Back{required ? ' required' : ''})</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Front side */}
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              {!frontUrl ? (
                <div>
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">Upload front side</p>
                  <p className="text-xs text-muted-foreground">JPG or PNG, max 5MB</p>
                  <Button
                    variant="outline"
                    onClick={() => frontInputRef.current?.click()}
                    disabled={isUploading}
                    className="mt-4"
                  >
                    {isUploading ? 'Uploading...' : 'Choose File'}
                  </Button>
                  <input
                    ref={frontInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={(e) => handleFileSelect('front', e)}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-emerald-50 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-emerald-100 rounded-full">
                      <Check className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Front uploaded</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">{frontUrl.split('/').pop()}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => frontInputRef.current?.click()}>Replace</Button>
                    <Button variant="outline" size="sm" onClick={() => removeSide('front')}><X className="w-4 h-4" /></Button>
                  </div>
                  <input
                    ref={frontInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={(e) => handleFileSelect('front', e)}
                    className="hidden"
                  />
                </div>
              )}
            </div>

            {/* Back side */}
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              {!backUrl ? (
                <div>
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">Upload back side</p>
                  <p className="text-xs text-muted-foreground">JPG or PNG, max 5MB</p>
                  <Button
                    variant="outline"
                    onClick={() => backInputRef.current?.click()}
                    disabled={isUploading}
                    className="mt-4"
                  >
                    {isUploading ? 'Uploading...' : 'Choose File'}
                  </Button>
                  <input
                    ref={backInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={(e) => handleFileSelect('back', e)}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-emerald-50 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-emerald-100 rounded-full">
                      <Check className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Back uploaded</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">{backUrl.split('/').pop()}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => backInputRef.current?.click()}>Replace</Button>
                    <Button variant="outline" size="sm" onClick={() => removeSide('back')}><X className="w-4 h-4" /></Button>
                  </div>
                  <input
                    ref={backInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={(e) => handleFileSelect('back', e)}
                    className="hidden"
                  />
                </div>
              )}
            </div>
          </div>

          {!canSubmit && required && (
            <p className="text-xs text-muted-foreground">Please upload both front and back images.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LicenseDocumentUpload;
