
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';

interface ComplianceDocumentCategoriesProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  documentCounts: Record<string, number>;
}

const ComplianceDocumentCategories = ({ 
  categories, 
  selectedCategory, 
  onCategoryChange,
  documentCounts 
}: ComplianceDocumentCategoriesProps) => {
  const complianceCategories = [
    {
      id: 'Driver Documents',
      name: 'Driver Documents',
      icon: Shield,
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      description: 'Driver licenses, certifications, and personal documents'
    },
    {
      id: 'Vehicle Documents',
      name: 'Vehicle Documents', 
      icon: AlertTriangle,
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      description: 'Vehicle registration, insurance, and inspection certificates'
    },
    {
      id: 'Compliance',
      name: 'Compliance Documents',
      icon: CheckCircle,
      color: 'bg-green-100 text-green-800 border-green-200',
      description: 'Regulatory compliance, safety protocols, and audit documents'
    },
    {
      id: 'Safety Documents',
      name: 'Safety Documents',
      icon: Shield,
      color: 'bg-red-100 text-red-800 border-red-200',
      description: 'Safety training, incident reports, and emergency procedures'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {complianceCategories.map((category) => {
        const Icon = category.icon;
        const count = documentCounts[category.id] || 0;
        const isSelected = selectedCategory === category.id;
        
        return (
          <div
            key={category.id}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
              isSelected 
                ? 'border-blue-500 bg-blue-50 shadow-md' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onCategoryChange(isSelected ? '' : category.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
              <Badge className={category.color}>
                {count}
              </Badge>
            </div>
            <h3 className={`font-semibold text-sm mb-1 ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
              {category.name}
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              {category.description}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default ComplianceDocumentCategories;
