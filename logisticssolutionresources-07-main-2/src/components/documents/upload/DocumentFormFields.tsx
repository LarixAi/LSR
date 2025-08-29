
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface DocumentFormFieldsProps {
  documentName: string;
  onDocumentNameChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  expiryDate: Date | undefined;
  onExpiryDateChange: (date: Date | undefined) => void;
}

const DocumentFormFields = ({
  documentName,
  onDocumentNameChange,
  category,
  onCategoryChange,
  description,
  onDescriptionChange,
  expiryDate,
  onExpiryDateChange
}: DocumentFormFieldsProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="documentName">Document Name</Label>
        <Input
          id="documentName"
          value={documentName}
          onChange={(e) => onDocumentNameChange(e.target.value)}
          placeholder="Enter document name"
        />
      </div>

      <div>
        <Label htmlFor="category">Category</Label>
        <Input
          id="category"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          placeholder="Enter category"
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Enter description"
          rows={3}
        />
      </div>

      <div>
        <Label>Expiry Date (Optional)</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !expiryDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {expiryDate ? format(expiryDate, "PPP") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={expiryDate}
              onSelect={onExpiryDateChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default DocumentFormFields;
