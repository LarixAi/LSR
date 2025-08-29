
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X } from 'lucide-react';

interface IncidentAttachmentsSectionProps {
  attachments: File[];
  setAttachments: (attachments: File[]) => void;
}

const IncidentAttachmentsSection: React.FC<IncidentAttachmentsSectionProps> = ({
  attachments,
  setAttachments,
}) => {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments([...attachments, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <Label className="flex items-center space-x-2">
        <Upload className="w-4 h-4" />
        <span>Attachments</span>
      </Label>
      <Input
        type="file"
        multiple
        accept="image/*,application/pdf,.doc,.docx"
        onChange={handleFileUpload}
      />
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-2 border rounded">
              <span className="text-sm">{file.name}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeAttachment(index)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IncidentAttachmentsSection;
