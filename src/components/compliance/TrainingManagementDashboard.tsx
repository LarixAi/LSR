import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  FileText,
  Award,
  Calendar,
  Play,
  Download
} from 'lucide-react';
import { format } from 'date-fns';
import { trainingModules, complianceDocuments } from '@/data/trainingModules';
import { useAuth } from '@/contexts/AuthContext';
import ComplianceTrainingForm from '@/components/compliance/forms/ComplianceTrainingForm';

interface TrainingProgress {
  moduleId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progress: number;
  score?: number;
  completedAt?: string;
  expiresAt?: string;
}

export const TrainingManagementDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('modules');
  const [showTrainingForm, setShowTrainingForm] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  
  // Mock training progress - in real app this would come from backend
  const [trainingProgress] = useState<TrainingProgress[]>([
    {
      moduleId: 'driver-safety-fundamentals',
      status: 'completed',
      progress: 100,
      score: 92,
      completedAt: '2024-01-15T10:30:00Z',
      expiresAt: '2025-01-15T10:30:00Z'
    },
    {
      moduleId: 'vehicle-inspection-training',
      status: 'in_progress',
      progress: 65,
    },
    {
      moduleId: 'emergency-procedures',
      status: 'not_started',
      progress: 0,
    },
    {
      moduleId: 'legal-compliance',
      status: 'not_started',
      progress: 0,
    },
    {
      moduleId: 'passenger-assistance',
      status: 'not_started',
      progress: 0,
    }
  ]);

  const getProgressForModule = (moduleId: string) => {
    return trainingProgress.find(p => p.moduleId === moduleId) || {
      moduleId,
      status: 'not_started' as const,
      progress: 0
    };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case 'not_started':
        return <Badge className="bg-gray-100 text-gray-800">Not Started</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'safety':
        return <AlertTriangle className="w-4 h-4" />;
      case 'legal':
        return <FileText className="w-4 h-4" />;
      case 'operational':
        return <BookOpen className="w-4 h-4" />;
      case 'emergency':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  const completedModules = trainingProgress.filter(p => p.status === 'completed').length;
  const totalModules = trainingModules.length;
  const overallProgress = Math.round((completedModules / totalModules) * 100);

  const handleStartTraining = (moduleId: string) => {
    setSelectedModuleId(moduleId);
    setShowTrainingForm(true);
  };

  const handleTrainingComplete = (moduleId: string, score: number) => {
    console.log(`Training completed for module ${moduleId} with score ${score}`);
    setShowTrainingForm(false);
    setSelectedModuleId(null);
    // Here you would typically update the training progress in the backend
  };

  const handleCloseTraining = () => {
    setShowTrainingForm(false);
    setSelectedModuleId(null);
  };

  // Show training form if selected
  if (showTrainingForm && selectedModuleId) {
    return (
      <ComplianceTrainingForm
        moduleId={selectedModuleId}
        onComplete={handleTrainingComplete}
        onClose={handleCloseTraining}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Training Management</h1>
          <p className="text-gray-600">Complete your mandatory training modules and stay compliant</p>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Overall Progress</p>
                  <p className="text-2xl font-bold text-blue-600">{overallProgress}%</p>
                  <Progress value={overallProgress} className="w-full mt-2" />
                </div>
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{completedModules}/{totalModules}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {trainingProgress.filter(p => p.status === 'in_progress').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Certifications</p>
                  <p className="text-2xl font-bold text-purple-600">{completedModules}</p>
                </div>
                <Award className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Training Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="modules">Training Modules</TabsTrigger>
            <TabsTrigger value="documents">Compliance Documents</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
          </TabsList>

          <TabsContent value="modules" className="space-y-4">
            <div className="grid gap-4">
              {trainingModules.map((module) => {
                const progress = getProgressForModule(module.id);
                return (
                  <Card key={module.id} className="bg-white shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="p-2 bg-blue-50 rounded-lg">
                            {getCategoryIcon(module.category)}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">{module.name}</h3>
                            <p className="text-gray-600 text-sm mb-2">{module.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                              <span className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {module.duration} minutes
                              </span>
                              <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                Valid {module.validityPeriod} months
                              </span>
                              {module.mandatory && (
                                <Badge variant="destructive" className="text-xs">Mandatory</Badge>
                              )}
                            </div>
                            {progress.progress > 0 && (
                              <div className="mb-3">
                                <div className="flex justify-between text-sm mb-1">
                                  <span>Progress</span>
                                  <span>{progress.progress}%</span>
                                </div>
                                <Progress value={progress.progress} className="h-2" />
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          {getStatusBadge(progress.status)}
                          {progress.status === 'completed' && progress.score && (
                            <div className="text-sm text-green-600 font-medium">
                              Score: {progress.score}%
                            </div>
                          )}
                          {progress.status === 'completed' ? (
                            <Button size="sm" variant="outline">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Review
                            </Button>
                          ) : (
                            <Button 
                              size="sm"
                              onClick={() => handleStartTraining(module.id)}
                            >
                              <Play className="w-4 h-4 mr-1" />
                              {progress.status === 'in_progress' ? 'Continue' : 'Start'}
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      {progress.status === 'completed' && progress.expiresAt && (
                        <div className="border-t pt-3 mt-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                              Completed: {format(new Date(progress.completedAt!), 'MMM dd, yyyy')}
                            </span>
                            <span className="text-gray-600">
                              Expires: {format(new Date(progress.expiresAt), 'MMM dd, yyyy')}
                            </span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <div className="grid gap-4">
              {complianceDocuments.map((doc) => (
                <Card key={doc.id} className="bg-white shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gray-50 rounded-lg">
                          <FileText className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{doc.title}</h3>
                          <p className="text-gray-600 text-sm mb-1">{doc.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Updated: {format(new Date(doc.lastUpdated), 'MMM dd, yyyy')}</span>
                            {doc.mandatory && (
                              <Badge variant="destructive" className="text-xs">Mandatory</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                        <Button size="sm">View</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="certificates" className="space-y-4">
            <div className="grid gap-4">
              {trainingProgress
                .filter(p => p.status === 'completed')
                .map((progress) => {
                  const module = trainingModules.find(m => m.id === progress.moduleId);
                  if (!module) return null;
                  
                  return (
                    <Card key={progress.moduleId} className="bg-white shadow-lg">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="p-3 bg-green-50 rounded-lg">
                              <Award className="w-8 h-8 text-green-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{module.name}</h3>
                              <p className="text-gray-600 text-sm">
                                Completed: {format(new Date(progress.completedAt!), 'MMM dd, yyyy')}
                              </p>
                              <p className="text-green-600 text-sm font-medium">
                                Score: {progress.score}% (Pass: {module.passScore}%)
                              </p>
                              <p className="text-gray-500 text-sm">
                                Valid until: {format(new Date(progress.expiresAt!), 'MMM dd, yyyy')}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Download className="w-4 h-4 mr-1" />
                              Download Certificate
                            </Button>
                            <Button size="sm">View Details</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              
              {trainingProgress.filter(p => p.status === 'completed').length === 0 && (
                <Card className="bg-white shadow-lg">
                  <CardContent className="p-8 text-center">
                    <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Certificates Yet</h3>
                    <p className="text-gray-600">Complete training modules to earn certificates</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TrainingManagementDashboard;