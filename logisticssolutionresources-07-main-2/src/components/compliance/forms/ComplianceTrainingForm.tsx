import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, AlertTriangle, Clock, ArrowLeft, ArrowRight } from 'lucide-react';
import { trainingModules, TrainingModule } from '@/data/trainingModules';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ComplianceTrainingFormProps {
  moduleId: string;
  onComplete: (moduleId: string, score: number) => void;
  onClose: () => void;
}

const ComplianceTrainingForm: React.FC<ComplianceTrainingFormProps> = ({
  moduleId,
  onComplete,
  onClose
}) => {
  const module = trainingModules.find(m => m.id === moduleId);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState('');
  const [isCompleting, setIsCompleting] = useState(false);

  if (!module) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Module Not Found</h3>
          <p className="text-gray-600 mb-4">The requested training module could not be found.</p>
          <Button onClick={onClose}>Close</Button>
        </CardContent>
      </Card>
    );
  }

  const isContentStep = currentStep < module.content.length;
  const isAssessmentStep = currentStep >= module.content.length && currentStep < module.content.length + module.assessment.length;
  const isNotesStep = currentStep === module.content.length + module.assessment.length;
  const isReviewStep = currentStep === module.content.length + module.assessment.length + 1;

  const totalSteps = module.content.length + module.assessment.length + 2; // +2 for notes and review
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const calculateScore = () => {
    let correct = 0;
    module.assessment.forEach(question => {
      const userAnswer = parseInt(answers[question.id]);
      if (userAnswer === question.correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / module.assessment.length) * 100);
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      const score = calculateScore();
      
      // Call the edge function to save training completion
      const { data, error } = await supabase.functions.invoke('complete-training', {
        body: {
          moduleId,
          score,
          moduleName: module.name
        }
      });

      if (error) {
        throw error;
      }

      if (data.passed) {
        toast.success(
          `Training completed successfully! Score: ${score}%${data.certificate ? ' - Certificate generated!' : ''}`
        );
        onComplete(moduleId, score);
      } else {
        toast.error(`Training failed. Score: ${score}% (Required: ${module.passScore}%)`);
        // Still call onComplete to refresh the data
        onComplete(moduleId, score);
      }
    } catch (error: any) {
      console.error('Failed to complete training:', error);
      toast.error(error.message || 'Failed to complete training');
    } finally {
      setIsCompleting(false);
    }
  };

  const renderContentStep = () => {
    const content = module.content[currentStep];
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{content.title}</h2>
          <Badge className="bg-blue-100 text-blue-800">{module.category}</Badge>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="prose max-w-none">
              {content.content.split('\n').map((paragraph, index) => {
                if (paragraph.startsWith('□')) {
                  return (
                    <div key={index} className="flex items-start space-x-2 my-2">
                      <div className="w-4 h-4 border border-gray-300 rounded mt-1"></div>
                      <span className="text-sm">{paragraph.substring(2)}</span>
                    </div>
                  );
                }
                return paragraph && (
                  <p key={index} className="mb-4 whitespace-pre-line">{paragraph}</p>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderAssessmentStep = () => {
    const questionIndex = currentStep - module.content.length;
    const question = module.assessment[questionIndex];
    const userAnswer = answers[question.id];
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Assessment Question {questionIndex + 1}</h2>
          <Badge className="bg-orange-100 text-orange-800">Question {questionIndex + 1} of {module.assessment.length}</Badge>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-4">{question.question}</h3>
            
            <RadioGroup
              value={userAnswer}
              onValueChange={(value) => handleAnswerChange(question.id, value)}
            >
              {question.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="cursor-pointer flex-1">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            
            {userAnswer !== undefined && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Explanation:</strong> {question.explanation}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderNotesStep = () => {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Training Notes</h2>
          <Badge className="bg-green-100 text-green-800">Optional</Badge>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
            <CardDescription>
              Add any additional notes or observations about this training module (optional)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Enter your notes here..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[120px]"
            />
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderReviewStep = () => {
    const score = calculateScore();
    const passed = score >= module.passScore;
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Training Review</h2>
          <Badge className={passed ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
            {passed ? 'Passed' : 'Failed'}
          </Badge>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center mb-6">
              {passed ? (
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              ) : (
                <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
              )}
              <h3 className="text-xl font-semibold mb-2">
                Your Score: {score}%
              </h3>
              <p className="text-gray-600">
                Required Score: {module.passScore}%
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">Assessment Results:</h4>
              {module.assessment.map((question, index) => {
                const userAnswer = parseInt(answers[question.id]);
                const isCorrect = userAnswer === question.correctAnswer;
                
                return (
                  <div key={question.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-medium">Question {index + 1}</span>
                      {isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{question.question}</p>
                    <p className="text-sm">
                      <strong>Your answer:</strong> {question.options[userAnswer]}
                    </p>
                    {!isCorrect && (
                      <p className="text-sm text-green-600">
                        <strong>Correct answer:</strong> {question.options[question.correctAnswer]}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            
            {notes && (
              <div className="mt-6">
                <h4 className="font-medium mb-2">Your Notes:</h4>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm">{notes}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{module.name}</h1>
            <p className="text-gray-600 flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {module.duration} minutes
            </p>
          </div>
          <Button variant="outline" onClick={onClose}>
            Exit Training
          </Button>
        </div>

        {/* Progress */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Step {currentStep + 1} of {totalSteps}</span>
              <span>
                {isContentStep && 'Content'}
                {isAssessmentStep && 'Assessment'}
                {isNotesStep && 'Notes'}
                {isReviewStep && 'Review'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        {isContentStep && renderContentStep()}
        {isAssessmentStep && renderAssessmentStep()}
        {isNotesStep && renderNotesStep()}
        {isReviewStep && renderReviewStep()}

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          
          {isReviewStep ? (
            <Button
              onClick={handleComplete}
              disabled={isCompleting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isCompleting ? 'Completing...' : 'Complete Training'}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={isAssessmentStep && !answers[module.assessment[currentStep - module.content.length]?.id]}
            >
              Next
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplianceTrainingForm;