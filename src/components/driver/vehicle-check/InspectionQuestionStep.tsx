
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

interface InspectionQuestion {
  id: string;
  title: string;
  description: string;
  guidanceImage: string;
  guidance: string;
  category: string;
}

interface InspectionQuestionStepProps {
  question: InspectionQuestion;
  response?: string;
  onResponse: (response: string) => void;
}

const InspectionQuestionStep: React.FC<InspectionQuestionStepProps> = ({
  question,
  response,
  onResponse
}) => {
  const responseOptions = [
    { 
      value: 'good', 
      label: 'Good', 
      icon: CheckCircle, 
      color: 'bg-green-500 hover:bg-green-600 text-white',
      description: 'No issues found'
    },
    { 
      value: 'poor', 
      label: 'Poor', 
      icon: AlertTriangle, 
      color: 'bg-yellow-500 hover:bg-yellow-600 text-white',
      description: 'Minor issues present'
    },
    { 
      value: 'defective', 
      label: 'Defective', 
      icon: XCircle, 
      color: 'bg-red-500 hover:bg-red-600 text-white',
      description: 'Serious issues - needs attention'
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Question Header */}
      <div className="text-center p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <div className="text-4xl sm:text-6xl mb-3">{question.guidanceImage}</div>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
          {question.title}
        </h3>
        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
          {question.description}
        </p>
        <Badge variant="outline" className="mt-2 text-xs">
          {question.category}
        </Badge>
      </div>

      {/* Guidance Card */}
      <Card className="border-gray-200">
        <CardContent className="p-4 sm:p-6">
          <h4 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">
            Inspection Guidance
          </h4>
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
            {question.guidance}
          </p>
        </CardContent>
      </Card>

      {/* Response Options */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
          Select Condition:
        </h4>
        <div className="grid grid-cols-1 gap-3">
          {responseOptions.map((option) => {
            const IconComponent = option.icon;
            const isSelected = response === option.value;
            
            return (
              <Button
                key={option.value}
                onClick={() => onResponse(option.value)}
                className={`${option.color} h-auto p-4 justify-start text-left ${
                  isSelected ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                }`}
                variant={isSelected ? 'default' : 'outline'}
              >
                <div className="flex items-center space-x-3 w-full">
                  <IconComponent className="w-5 h-5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm sm:text-base">
                      {option.label}
                    </div>
                    <div className="text-xs opacity-90 mt-1">
                      {option.description}
                    </div>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default InspectionQuestionStep;
