import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, AlertTriangle, XCircle, Camera, Info, Upload, Circle } from 'lucide-react';
import { DVSAInspectionQuestion } from './DVSAInspectionData';

interface DVSAInspectionQuestionStepProps {
  question: DVSAInspectionQuestion;
  response?: {
    status: string;
    notes?: string;
    photoUrl?: string;
  };
  onResponse: (questionId: string, response: { status: string; notes?: string; photoUrl?: string }) => void;
  currentPosition: number;
  totalPositions: number;
}

const DVSAInspectionQuestionStep: React.FC<DVSAInspectionQuestionStepProps> = ({
  question,
  response,
  onResponse,
  currentPosition,
  totalPositions
}) => {
  const [selectedStatus, setSelectedStatus] = useState(response?.status || '');
  const [notes, setNotes] = useState(response?.notes || '');
  const [showGuidance, setShowGuidance] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const responseOptions = [
    { 
      value: 'pass', 
      label: 'Pass ✅', 
      icon: CheckCircle, 
      color: 'bg-green-600 hover:bg-green-700 text-white',
      description: 'No defects found - satisfactory condition'
    },
    { 
      value: 'advisory', 
      label: 'Advisory ⚠️', 
      icon: AlertTriangle, 
      color: 'bg-yellow-600 hover:bg-yellow-700 text-white',
      description: 'Minor defect - monitor but safe to continue'
    },
    { 
      value: 'fail', 
      label: 'Fail ❌', 
      icon: XCircle, 
      color: 'bg-red-600 hover:bg-red-700 text-white',
      description: 'Dangerous defect - must be repaired before use'
    },
    { 
      value: 'na', 
      label: 'N/A 🚫', 
      icon: Circle, 
      color: 'bg-gray-600 hover:bg-gray-700 text-white',
      description: 'Not applicable to this vehicle type'
    }
  ];

  const handleStatusSelect = (status: string) => {
    setSelectedStatus(status);
    onResponse(question.id, {
      status,
      notes,
      photoUrl: response?.photoUrl
    });
  };

  const handleNotesChange = (newNotes: string) => {
    setNotes(newNotes);
    if (selectedStatus) {
      onResponse(question.id, {
        status: selectedStatus,
        notes: newNotes,
        photoUrl: response?.photoUrl
      });
    }
  };

  const handlePhotoCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      // In a real implementation, you would upload this to storage
      const photoUrl = URL.createObjectURL(file);
      onResponse(question.id, {
        status: selectedStatus,
        notes,
        photoUrl
      });
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Progress indicator */}
      <div className="text-center text-sm text-gray-600">
        Position {currentPosition} of {totalPositions} • Walkaround Step {question.walkaroundPosition}
      </div>

      {/* Question Header */}
      <div className="text-center p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <div className="text-4xl sm:text-6xl mb-3">{question.guidanceImage}</div>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
          {question.title}
        </h3>
        <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-3">
          {question.description}
        </p>
        <div className="flex justify-center space-x-2">
          <Badge variant="outline" className="text-xs">
            {question.category}
          </Badge>
          {question.isRequired && (
            <Badge variant="destructive" className="text-xs">
              Required
            </Badge>
          )}
        </div>
      </div>

      {/* DVSA Guidance Card */}
      <Card className="border-gray-200">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 overflow-hidden">
            <h4 className="font-semibold text-gray-900 text-sm sm:text-base pr-2 whitespace-nowrap overflow-hidden text-ellipsis">
              DVSA Inspection Guidance
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowGuidance(!showGuidance)}
              className="flex-shrink-0"
            >
              <Info className="w-4 h-4 mr-1" />
              {showGuidance ? 'Hide' : 'Show'} Details
            </Button>
          </div>
          
          {showGuidance && (
            <div className="space-y-3">
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                {question.guidance}
              </p>
              {question.dvsaReference && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs font-medium text-blue-900">
                    DVSA Reference: {question.dvsaReference}
                  </p>
                </div>
              )}
              {question.legalConsequence && (
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-xs font-medium text-red-900">
                    ⚖️ Legal Consequence: {question.legalConsequence}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Response Options */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
          Select Inspection Result:
        </h4>
        <div className="grid grid-cols-1 gap-3">
          {responseOptions.map((option) => {
            const IconComponent = option.icon;
            const isSelected = selectedStatus === option.value;
            
            return (
              <Button
                key={option.value}
                onClick={() => handleStatusSelect(option.value)}
                className={`${option.color} h-auto p-4 justify-start text-left ${
                  isSelected ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                }`}
                variant={isSelected ? 'default' : 'outline'}
              >
                <div className="flex items-start space-x-3 w-full">
                  <IconComponent className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="font-semibold text-sm sm:text-base break-words">
                      {option.label}
                    </div>
                    <div className="text-xs opacity-90 mt-1 break-words whitespace-normal">
                      {option.description}
                    </div>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Notes Section */}
      {selectedStatus && selectedStatus !== 'na' && (
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
            Additional Notes {selectedStatus === 'fail' ? '(Required for failures)' : '(Optional)'}:
          </h4>
          <Textarea
            placeholder={
              selectedStatus === 'fail' 
                ? "Describe the defect and any safety concerns..."
                : "Add any additional observations..."
            }
            value={notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            className="min-h-20"
            required={selectedStatus === 'fail'}
          />
        </div>
      )}

      {/* Photo Evidence Section */}
      {question.hasPhotoOption && selectedStatus && selectedStatus !== 'na' && (
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
            Photo Evidence {selectedStatus === 'fail' ? '(Recommended)' : '(Optional)'}:
          </h4>
          <div className="flex flex-col sm:flex-row gap-3">
            <label className="flex-1">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoCapture}
                className="hidden"
              />
              <Button variant="outline" className="w-full" asChild>
                <div className="cursor-pointer">
                  <Camera className="w-4 h-4 mr-2" />
                  Take Photo
                </div>
              </Button>
            </label>
            <label className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoCapture}
                className="hidden"
              />
              <Button variant="outline" className="w-full" asChild>
                <div className="cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Photo
                </div>
              </Button>
            </label>
          </div>
          {(photoFile || response?.photoUrl) && (
            <div className="text-sm text-green-600 flex items-center">
              <CheckCircle className="w-4 h-4 mr-1" />
              Photo attached
            </div>
          )}
        </div>
      )}

      {/* Defect Warning */}
      {selectedStatus === 'fail' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-800">
              <div className="font-semibold mb-1">DANGEROUS DEFECT IDENTIFIED</div>
              <div>This vehicle must not be driven until the defect is repaired. A qualified mechanic must inspect and certify the repair before the vehicle returns to service.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DVSAInspectionQuestionStep;