
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Shield, 
  Heart, 
  CreditCard, 
  DollarSign, 
  Phone, 
  IdCard,
  CheckCircle,
  XCircle
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface DocumentStatusIconsProps {
  missingDocuments?: string[];
  completedDocuments?: string[];
}

const DocumentStatusIcons = ({ missingDocuments = [], completedDocuments = [] }: DocumentStatusIconsProps) => {
  const documentConfig = {
    driver_license: { icon: IdCard, label: 'Driver License' },
    medical_certificate: { icon: Heart, label: 'Medical Certificate' },
    insurance: { icon: Shield, label: 'Insurance Documents' },
    emergency_contact: { icon: Phone, label: 'Emergency Contact' },
    tax_forms: { icon: FileText, label: 'Tax Forms (W-4)' },
    direct_deposit: { icon: DollarSign, label: 'Direct Deposit Form' },
    photo_id: { icon: CreditCard, label: 'Photo ID Badge' }
  };

  const allDocuments = Object.keys(documentConfig);
  
  return (
    <TooltipProvider>
      <div className="flex flex-wrap gap-1">
        {allDocuments.map((docType) => {
          const config = documentConfig[docType as keyof typeof documentConfig];
          const Icon = config.icon;
          const isCompleted = completedDocuments.includes(docType);
          const isMissing = missingDocuments.includes(docType);
          
          return (
            <Tooltip key={docType}>
              <TooltipTrigger asChild>
                <div className="relative">
                  <Icon 
                    className={`w-4 h-4 ${
                      isCompleted 
                        ? 'text-green-600' 
                        : isMissing 
                        ? 'text-red-500' 
                        : 'text-gray-400'
                    }`}
                  />
                  {isCompleted && (
                    <CheckCircle className="w-2 h-2 text-green-600 absolute -top-1 -right-1 bg-white rounded-full" />
                  )}
                  {isMissing && (
                    <XCircle className="w-2 h-2 text-red-500 absolute -top-1 -right-1 bg-white rounded-full" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {config.label}: {
                    isCompleted ? 'Completed' : 
                    isMissing ? 'Missing' : 
                    'Not Required'
                  }
                </p>
              </TooltipContent>
            </Tooltip>
          );
        })}
        
        {missingDocuments.length > 0 && (
          <Badge variant="destructive" className="ml-2 text-xs">
            {missingDocuments.length} missing
          </Badge>
        )}
      </div>
    </TooltipProvider>
  );
};

export default DocumentStatusIcons;
