import React, { useState } from 'react';
import DriverLayout from '@/components/layout/DriverLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  FileText,
  Calendar,
  Award,
  Upload,
  Download,
  Eye,
  RefreshCw,
  XCircle
} from 'lucide-react';
import { useDriverCompliance } from '@/hooks/useDriverCompliance';
import { format } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileOptimizedLayout from '@/components/mobile/MobileOptimizedLayout';
import { toast } from 'sonner';
import ComplianceDebugPanel from '@/components/compliance/ComplianceDebugPanel';

const DriverCompliance = () => {
  const { user, profile, session, loading: authLoading } = useAuth();
  const isMobile = useIsMobile();
  const { 
    complianceData, 
    trainingModules, 
    violations, 
    complianceHistory, 
    recentActivity, 
    driverLicenses,
    loading: complianceLoading, 
    error, 
    refreshData 
  } = useDriverCompliance();

  const updateTrainingProgress = async (trainingId: string, progress: number) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-training-progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
        },
        body: JSON.stringify({
          training_id: trainingId,
          progress,
          status: progress === 100 ? 'completed' : 'in_progress'
        }),
        mode: 'cors',
        credentials: 'omit',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      toast.success('Training progress updated!');
      refreshData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update training progress');
    }
  };

  const completeTraining = async (trainingId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/update-training-progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
        },
        body: JSON.stringify({
          training_id: trainingId,
          progress: 100,
          status: 'completed',
          completion_date: new Date().toISOString()
        }),
        mode: 'cors',
        credentials: 'omit',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      toast.success('Training completed successfully!');
      refreshData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to complete training');
    }
  };

  if (authLoading || complianceLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-lg">Loading compliance dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/auth" replace />;
  }

  // Only drivers can access
  if (profile.role !== 'driver') {
    return <Navigate to="/dashboard" replace />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Compliance Data</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <Button onClick={refreshData} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string, daysUntilExpiry?: number) => {
    if (status === 'expired' || daysUntilExpiry! < 0) {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Expired</Badge>;
    }
    if (status === 'due_soon' || (daysUntilExpiry! <= 30 && daysUntilExpiry! > 0)) {
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Due Soon</Badge>;
    }
    if (status === 'valid') {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Valid</Badge>;
    }
    if (status === 'completed') {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>;
    }
    if (status === 'in_progress') {
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">In Progress</Badge>;
    }
    if (status === 'due') {
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Due</Badge>;
    }
    return <Badge variant="secondary">{status}</Badge>;
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'license':
        return <Shield className="w-5 h-5 text-blue-600" />;
      case 'medical':
        return <FileText className="w-5 h-5 text-green-600" />;
      case 'training':
        return <Award className="w-5 h-5 text-purple-600" />;
      case 'background':
        return <CheckCircle className="w-5 h-5 text-orange-600" />;
      case 'inspection':
        return <CheckCircle className="w-5 h-5 text-red-600" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Transform driver licenses to match the expected format
  const documents = driverLicenses.map(license => {
    const expiryDate = new Date(license.expiry_date);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      id: license.id,
      name: `${license.license_type} License`,
      type: 'license',
      status: daysUntilExpiry > 0 ? 'valid' : 'expired',
      expiryDate: license.expiry_date,
      daysUntilExpiry,
      lastUpdated: license.created_at,
      documentUrl: '#',
      licenseNumber: license.license_number,
      issuingAuthority: license.issuing_authority
    };
  });

  const validDocuments = documents.filter(doc => 
    doc.status === 'valid' && doc.daysUntilExpiry > 0
  );

  const expiredDocuments = documents.filter(doc => 
    doc.status === 'expired' || doc.daysUntilExpiry <= 0
  );

  const dueSoonDocuments = documents.filter(doc => 
    doc.status === 'valid' && doc.daysUntilExpiry <= 30 && doc.daysUntilExpiry > 0
  );

  // Check if we have any data to display
  const hasAnyData = documents.length > 0 || trainingModules.length > 0 || violations.length > 0 || complianceHistory.length > 0;

  const content = (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className={`${isMobile ? 'space-y-3' : 'flex justify-between items-center'}`}>
        <div>
          <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-gray-900 flex items-center gap-2 sm:gap-3`}>
            <Shield className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-green-600`} />
            Driver Compliance
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Track your compliance status and certifications</p>
        </div>
        <div className={`flex items-center gap-2 ${isMobile ? 'w-full' : 'space-x-2'}`}>
          <Button 
            onClick={refreshData} 
            variant="outline" 
            disabled={complianceLoading}
            size={isMobile ? "sm" : "default"}
            className={isMobile ? 'flex-1' : ''}
          >
            <RefreshCw className={`w-4 h-4 ${isMobile ? 'mr-1' : 'mr-2'} ${complianceLoading ? 'animate-spin' : ''}`} />
            {isMobile ? 'Refresh' : 'Refresh Data'}
          </Button>
          <Button 
            className={`bg-green-600 hover:bg-green-700 ${isMobile ? 'flex-1' : ''}`}
            size={isMobile ? "sm" : "default"}
          >
            <Upload className={`w-4 h-4 ${isMobile ? 'mr-1' : 'mr-2'}`} />
            {isMobile ? 'Update' : 'Update Documents'}
          </Button>
        </div>
      </div>

      {/* Empty State */}
      {!hasAnyData && !complianceLoading && (
        <Card className="bg-gradient-to-r from-blue-50 to-green-50">
          <CardContent className={`${isMobile ? 'p-6' : 'p-8'} text-center`}>
            <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome to Your Compliance Dashboard</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Your compliance dashboard is ready! Once you have licenses, training records, or compliance data, 
              it will appear here for easy tracking and management.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Upload className="w-4 h-4 mr-2" />
                Upload Documents
              </Button>
              <Button variant="outline">
                <Award className="w-4 h-4 mr-2" />
                View Training
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Compliance Score */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50">
        <CardContent className={`${isMobile ? 'p-4' : 'p-6'}`}>
          <div className={`${isMobile ? 'flex flex-col space-y-4' : 'flex items-center justify-between'}`}>
            <div className={isMobile ? 'text-center' : ''}>
              <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold mb-2`}>Overall Compliance Score</h2>
              <div className={`${isMobile ? 'text-3xl' : 'text-4xl'} font-bold ${getComplianceColor(complianceData.overallScore)}`}>
                {complianceData.overallScore}%
              </div>
              <p className={`text-gray-600 mt-2 ${isMobile ? 'text-sm' : ''}`}>
                {complianceData.overallScore >= 90 ? 'Excellent compliance status' :
                 complianceData.overallScore >= 75 ? 'Good compliance status' :
                 'Compliance attention needed'}
              </p>
            </div>
            <div className={`${isMobile ? 'flex justify-center' : 'text-right'}`}>
              <div className={`${isMobile ? 'w-24 h-24' : 'w-32 h-32'} relative`}>
                <svg className={`${isMobile ? 'w-24 h-24' : 'w-32 h-32'} transform -rotate-90`} viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="2"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    strokeDasharray={`${complianceData.overallScore}, 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <CheckCircle className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-green-600`} />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className={`grid ${isMobile ? 'grid-cols-2 gap-3' : 'grid-cols-1 md:grid-cols-4 gap-6'}`}>
        <Card>
          <CardContent className={`${isMobile ? 'p-3' : 'p-6'}`}>
            <div className={`flex items-center ${isMobile ? 'gap-2' : 'gap-3'}`}>
              <CheckCircle className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-green-600`} />
              <div>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>Valid Documents</p>
                <p className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-green-600`}>{validDocuments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className={`${isMobile ? 'p-3' : 'p-6'}`}>
            <div className={`flex items-center ${isMobile ? 'gap-2' : 'gap-3'}`}>
              <AlertTriangle className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-yellow-600`} />
              <div>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>Due Soon</p>
                <p className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-yellow-600`}>{dueSoonDocuments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className={`${isMobile ? 'p-3' : 'p-6'}`}>
            <div className={`flex items-center ${isMobile ? 'gap-2' : 'gap-3'}`}>
              <AlertTriangle className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-red-600`} />
              <div>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>Expired</p>
                <p className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-red-600`}>{expiredDocuments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className={`${isMobile ? 'p-3' : 'p-6'}`}>
            <div className={`flex items-center ${isMobile ? 'gap-2' : 'gap-3'}`}>
              <Award className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-blue-600`} />
              <div>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>Active Violations</p>
                <p className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold`}>{violations.filter(v => v.status === 'active' || v.status === 'pending').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="documents" className={`${isMobile ? 'space-y-4' : 'space-y-6'}`}>
        <TabsList className={`grid w-full ${isMobile ? 'grid-cols-2 gap-1' : 'grid-cols-4'}`}>
          <TabsTrigger value="documents" className={isMobile ? 'text-xs px-2' : ''}>
            {isMobile ? 'Docs' : 'Documents'}
          </TabsTrigger>
          <TabsTrigger value="training" className={isMobile ? 'text-xs px-2' : ''}>
            Training
          </TabsTrigger>
          <TabsTrigger value="driving-record" className={isMobile ? 'text-xs px-2' : ''}>
            {isMobile ? 'Record' : 'Driving Record'}
          </TabsTrigger>
          <TabsTrigger value="reminders" className={isMobile ? 'text-xs px-2' : ''}>
            Reminders
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Required Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents Found</h3>
                  <p className="text-gray-600 mb-4">Upload your licenses and certifications to track compliance</p>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Documents
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {documents.map((doc) => (
                  <div key={doc.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getDocumentIcon(doc.type)}
                        <div>
                          <h3 className="font-semibold">{doc.name}</h3>
                          <p className="text-sm text-gray-600">
                            Expires: {format(new Date(doc.expiryDate), 'MM/dd/yyyy')} 
                            {doc.daysUntilExpiry > 0 
                              ? ` (${doc.daysUntilExpiry} days remaining)`
                              : ` (Expired ${Math.abs(doc.daysUntilExpiry)} days ago)`
                            }
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(doc.status, doc.daysUntilExpiry)}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent aria-describedby="doc-details-desc">
                            <DialogHeader>
                              <DialogTitle>{doc.name} Details</DialogTitle>
                              <DialogDescription id="doc-details-desc">
                                View detailed information about this compliance document.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium mb-2">Document Information</h4>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Status:</span>
                                      <span>{getStatusBadge(doc.status, doc.daysUntilExpiry)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Expires:</span>
                                      <span>{format(new Date(doc.expiryDate), 'MM/dd/yyyy')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Last Updated:</span>
                                      <span>{format(new Date(doc.lastUpdated), 'MM/dd/yyyy')}</span>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-2">Actions</h4>
                                  <div className="space-y-2">
                                    <Button variant="outline" size="sm" className="w-full">
                                      <Download className="w-4 h-4 mr-2" />
                                      Download
                                    </Button>
                                    <Button variant="outline" size="sm" className="w-full">
                                      <Upload className="w-4 h-4 mr-2" />
                                      Update
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                    
                    {doc.daysUntilExpiry <= 30 && doc.daysUntilExpiry > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
                        <div className="flex items-center gap-2 text-yellow-800">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="font-medium">Renewal Required</span>
                        </div>
                        <p className="text-yellow-700 mt-1">
                          This document expires in {doc.daysUntilExpiry} days. Please renew to maintain compliance.
                        </p>
                      </div>
                    )}
                    
                    {doc.daysUntilExpiry < 0 && (
                      <div className="bg-red-50 border border-red-200 rounded p-3 text-sm">
                        <div className="flex items-center gap-2 text-red-800">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="font-medium">Document Expired</span>
                        </div>
                        <p className="text-red-700 mt-1">
                          This document expired {Math.abs(doc.daysUntilExpiry)} days ago. 
                          Immediate renewal required to maintain driving privileges.
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
                )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Training & Certifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {trainingModules.length === 0 ? (
                <div className="text-center py-8">
                  <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Training Records</h3>
                  <p className="text-gray-600 mb-4">Complete training modules to improve your compliance score</p>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Award className="w-4 h-4 mr-2" />
                    Start Training
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {trainingModules.map((training) => (
                  <div key={training.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{training.name}</h3>
                        <p className="text-sm text-gray-600">Training Module</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(training.status)}
                        {training.status === 'completed' && (
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-1" />
                            Certificate
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      {training.status === 'completed' && (
                        <p>Completed: 100% | Progress: {training.progress}%</p>
                      )}
                      {training.status === 'in_progress' && (
                        <div>
                          <p>Due: {training.dueDate ? format(new Date(training.dueDate), 'MM/dd/yyyy') : 'No due date'}</p>
                          <Progress value={training.progress} className="mt-2" />
                          <p className="text-xs mt-1">{training.progress}% complete</p>
                          <div className="flex gap-2 mt-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => updateTrainingProgress(training.id, Math.min(training.progress + 25, 100))}
                            >
                              Update Progress
                            </Button>
                            {training.progress >= 100 && (
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => completeTraining(training.id)}
                              >
                                Mark Complete
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                      {training.status === 'not_started' && (
                        <p>Due: {training.dueDate ? format(new Date(training.dueDate), 'MM/dd/yyyy') : 'No due date'}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
                )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="driving-record" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Compliance Violations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">Active Violations</h3>
                  <div className="text-3xl font-bold text-blue-600">
                    {violations.filter(v => v.status === 'active' || v.status === 'pending').length}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Current active violations
                  </p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">Resolved Violations</h3>
                  <div className="text-3xl font-bold text-green-600">
                    {violations.filter(v => v.status === 'resolved' || v.status === 'closed').length}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Successfully resolved violations
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-4">Recent Violations</h3>
                {violations.length === 0 ? (
                  <div className="text-center py-8">
                    <Shield className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-green-900 mb-2">Clean Record</h3>
                    <p className="text-green-700">No compliance violations found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {violations.slice(0, 5).map((violation) => (
                      <div key={violation.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{violation.violationType}</h4>
                            <p className="text-sm text-gray-600">
                              {format(new Date(violation.violationDate), 'MM/dd/yyyy')} • {violation.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge className={`${
                              violation.severity === 'critical' ? 'bg-red-100 text-red-800' :
                              violation.severity === 'major' ? 'bg-orange-100 text-orange-800' :
                              violation.severity === 'minor' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            } hover:bg-opacity-80 mt-1`}>
                              {violation.severity}
                            </Badge>
                            <div className="text-sm text-gray-600 mt-1">
                              {violation.status}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reminders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Upcoming Reminders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {documents
                  .filter(doc => doc.daysUntilExpiry <= 60 && doc.daysUntilExpiry > 0)
                  .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry)
                  .map((doc) => (
                    <div key={doc.id} className="border rounded-lg p-4 bg-yellow-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-yellow-600" />
                          <div>
                            <h3 className="font-semibold">{doc.name} Renewal</h3>
                            <p className="text-sm text-gray-600">
                              Due: {format(new Date(doc.expiryDate), 'MM/dd/yyyy')} ({doc.daysUntilExpiry} days)
                            </p>
                          </div>
                        </div>
                        <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                          Set Reminder
                        </Button>
                      </div>
                    </div>
                  ))}
                
                {trainingModules
                  .filter(training => training.status === 'not_started')
                  .map((training) => (
                    <div key={training.id} className="border rounded-lg p-4 bg-blue-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Award className="w-5 h-5 text-blue-600" />
                          <div>
                            <h3 className="font-semibold">{training.name} Training</h3>
                            <p className="text-sm text-gray-600">
                              Due: {format(new Date(training.dueDate), 'MM/dd/yyyy')}
                            </p>
                          </div>
                        </div>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          Schedule Training
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  return (
    <DriverLayout title="Driver Compliance" description="Track your compliance status and certifications">
      {isMobile ? (
        <MobileOptimizedLayout>
          {content}
        </MobileOptimizedLayout>
      ) : content}
      <ComplianceDebugPanel />
    </DriverLayout>
  );
};

export default DriverCompliance;
