
import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ComplianceCheckItem } from '@/hooks/useComplianceCheckItems';

interface ComplianceCheckSectionProps {
  complianceItems: ComplianceCheckItem[];
  responses: Record<string, { value: string; notes: string; compliant: boolean }>;
  onResponseChange: (itemId: string, value: string, notes: string, isCompliant: boolean) => void;
}

const ComplianceCheckSection: React.FC<ComplianceCheckSectionProps> = ({
  complianceItems,
  responses,
  onResponseChange
}) => {
  const groupedItems = complianceItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ComplianceCheckItem[]>);

  const responseOptions = [
    { value: 'pass', label: 'Pass', compliant: true, color: 'bg-green-100 text-green-800' },
    { value: 'fail', label: 'Fail', compliant: false, color: 'bg-red-100 text-red-800' },
    { value: 'na', label: 'N/A', compliant: true, color: 'bg-gray-100 text-gray-800' },
    { value: 'partial', label: 'Partial', compliant: false, color: 'bg-yellow-100 text-yellow-800' },
  ];

  const handleResponseValueChange = (itemId: string, value: string) => {
    const option = responseOptions.find(opt => opt.value === value);
    const currentResponse = responses[itemId] || { value: '', notes: '', compliant: true };
    
    onResponseChange(
      itemId, 
      value, 
      currentResponse.notes, 
      option?.compliant ?? true
    );
  };

  const handleNotesChange = (itemId: string, notes: string) => {
    const currentResponse = responses[itemId] || { value: '', notes: '', compliant: true };
    onResponseChange(
      itemId, 
      currentResponse.value, 
      notes, 
      currentResponse.compliant
    );
  };

  const categoryEntries = Object.entries(groupedItems);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <h3 className="text-lg font-semibold">Compliance Check Items</h3>
        <Badge variant="outline">{complianceItems.length} items</Badge>
      </div>

      {categoryEntries.map(([category, items], categoryIndex) => (
        <div key={category} className="space-y-4">
          <h4 className="text-md font-semibold text-gray-900 border-b pb-2">{category}</h4>
          
          {items.map((item) => (
            <div key={item.id} className="space-y-3 p-4 border rounded-lg bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Label className="font-medium">{item.item_name}</Label>
                    {item.is_mandatory && (
                      <Badge variant="destructive" className="text-xs">Required</Badge>
                    )}
                    <Badge variant="outline" className="text-xs">{item.points_value} pts</Badge>
                  </div>
                  
                  {item.description && (
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  )}
                  
                  {item.regulatory_reference && (
                    <p className="text-xs text-blue-600 mt-1">
                      Reference: {item.regulatory_reference}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm">Compliance Status</Label>
                <RadioGroup 
                  value={responses[item.id]?.value || ''} 
                  onValueChange={(value) => handleResponseValueChange(item.id, value)}
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {responseOptions.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value} id={`${item.id}-${option.value}`} />
                        <Label htmlFor={`${item.id}-${option.value}`} className="cursor-pointer">
                          <Badge className={option.color} variant="outline">
                            {option.label}
                          </Badge>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor={`notes-${item.id}`} className="text-sm">Notes (optional)</Label>
                <Textarea
                  id={`notes-${item.id}`}
                  value={responses[item.id]?.notes || ''}
                  onChange={(e) => handleNotesChange(item.id, e.target.value)}
                  placeholder="Add any additional notes or observations..."
                  rows={2}
                  className="text-sm"
                />
              </div>
            </div>
          ))}
          
          {categoryIndex < categoryEntries.length - 1 && <Separator />}
        </div>
      ))}
    </div>
  );
};

export default ComplianceCheckSection;
