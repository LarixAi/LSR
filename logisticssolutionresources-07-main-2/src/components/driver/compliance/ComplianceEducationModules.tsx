
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Play, CheckCircle, Clock, Award, Download } from 'lucide-react';
import { format } from 'date-fns';

interface ComplianceEducationModulesProps {
  driverId: string;
}

const ComplianceEducationModules: React.FC<ComplianceEducationModulesProps> = ({ driverId }) => {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  // Mock education modules data
  const educationModules = [
    {
      id: '1',
      title: 'Vehicle Safety Inspection',
      description: 'Learn proper vehicle inspection procedures and safety protocols',
      category: 'Safety',
      duration: '45 minutes',
      status: 'completed',
      progress: 100,
      completedDate: '2024-06-15',
      certification: true,
      requiredBy: '2024-07-01'
    },
    {
      id: '2',
      title: 'Traffic Regulations Update',
      description: 'Latest traffic laws and regulations for commercial drivers',
      category: 'Regulations',
      duration: '30 minutes',
      status: 'in_progress',
      progress: 60,
      completedDate: null,
      certification: false,
      requiredBy: '2024-07-15'
    },
    {
      id: '3',
      title: 'Emergency Response Procedures',
      description: 'How to handle emergency situations and incident reporting',
      category: 'Safety',
      duration: '60 minutes',
      status: 'pending',
      progress: 0,
      completedDate: null,
      certification: true,
      requiredBy: '2024-08-01'
    },
    {
      id: '4',
      title: 'Defensive Driving Techniques',
      description: 'Advanced driving techniques for safe operation',
      category: 'Driving',
      duration: '90 minutes',
      status: 'pending',
      progress: 0,
      completedDate: null,
      certification: true,
      requiredBy: '2024-08-15'
    },
    {
      id: '5',
      title: 'Customer Service Excellence',
      description: 'Providing excellent service to passengers and stakeholders',
      category: 'Service',
      duration: '40 minutes',
      status: 'completed',
      progress: 100,
      completedDate: '2024-06-10',
      certification: false,
      requiredBy: '2024-07-01'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case 'pending':
        return <Badge className="bg-gray-100 text-gray-800">Pending</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Safety': return 'text-red-600';
      case 'Regulations': return 'text-blue-600';
      case 'Driving': return 'text-green-600';
      case 'Service': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const handleStartModule = (moduleId: string) => {
    console.log('Starting module:', moduleId);
    // In real implementation, this would navigate to the training module
  };

  const handleDownloadCertificate = (moduleId: string) => {
    console.log('Downloading certificate for module:', moduleId);
    // In real implementation, this would download the certificate
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Education Modules</h3>
          <p className="text-gray-600">Complete training modules to maintain compliance</p>
        </div>
        <div className="text-sm text-gray-500">
          {educationModules.filter(m => m.status === 'completed').length} of {educationModules.length} completed
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {educationModules.map((module) => (
          <Card key={module.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {module.description}
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  {getStatusBadge(module.status)}
                  {module.certification && (
                    <Badge variant="outline" className="text-xs">
                      <Award className="w-3 h-3 mr-1" />
                      Certificate
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Module Details */}
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-4">
                    <span className={`font-medium ${getCategoryColor(module.category)}`}>
                      {module.category}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {module.duration}
                    </span>
                  </div>
                  <span>Due: {format(new Date(module.requiredBy), 'MMM dd')}</span>
                </div>

                {/* Progress */}
                {module.status !== 'pending' && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{module.progress}%</span>
                    </div>
                    <Progress value={module.progress} className="h-2" />
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex space-x-2">
                    {module.status === 'pending' && (
                      <Button 
                        size="sm" 
                        onClick={() => handleStartModule(module.id)}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Start
                      </Button>
                    )}
                    
                    {module.status === 'in_progress' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleStartModule(module.id)}
                      >
                        <BookOpen className="w-4 h-4 mr-1" />
                        Continue
                      </Button>
                    )}

                    {module.status === 'completed' && module.certification && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDownloadCertificate(module.id)}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Certificate
                      </Button>
                    )}
                  </div>

                  {module.status === 'completed' && (
                    <div className="flex items-center text-green-600 text-sm">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Completed {format(new Date(module.completedDate!), 'MMM dd')}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle>Training Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {educationModules.filter(m => m.status === 'completed').length}
              </p>
              <p className="text-sm text-gray-600">Completed Modules</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {educationModules.filter(m => m.status === 'in_progress').length}
              </p>
              <p className="text-sm text-gray-600">In Progress</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {educationModules.filter(m => m.certification && m.status === 'completed').length}
              </p>
              <p className="text-sm text-gray-600">Certificates Earned</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComplianceEducationModules;
