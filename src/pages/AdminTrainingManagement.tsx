import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Award, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Plus,
  RefreshCw,
  Eye,
  Calendar,
  User
} from 'lucide-react';
import { format } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';
import { AssignTrainingDialog } from '@/components/admin/AssignTrainingDialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TrainingRecord {
  id: string;
  driver_id: string;
  training_type: string;
  training_name: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'expired';
  progress: number;
  due_date: string;
  completion_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  driver: {
    email: string;
    first_name?: string;
    last_name?: string;
  };
}

const AdminTrainingManagement = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(true);
  const [trainingRecords, setTrainingRecords] = useState<TrainingRecord[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    overdue: 0,
    notStarted: 0
  });

  useEffect(() => {
    if (profile?.organization_id) {
      fetchTrainingRecords();
    }
  }, [profile?.organization_id]);

  const fetchTrainingRecords = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('training_completions')
        .select(`
          *,
          driver:profiles!training_completions_driver_id_fkey(
            email,
            first_name,
            last_name
          )
        `)
        .eq('organization_id', profile?.organization_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching training records:', error);
        toast.error('Failed to load training records');
        return;
      }

      setTrainingRecords(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Error fetching training records:', error);
      toast.error('Failed to load training records');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (records: TrainingRecord[]) => {
    const now = new Date();
    const stats = {
      total: records.length,
      completed: records.filter(r => r.status === 'completed').length,
      inProgress: records.filter(r => r.status === 'in_progress').length,
      overdue: records.filter(r => {
        const dueDate = new Date(r.due_date);
        return dueDate < now && r.status !== 'completed';
      }).length,
      notStarted: records.filter(r => r.status === 'not_started').length
    };
    setStats(stats);
  };

  const getStatusBadge = (status: string, dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const isOverdue = due < now && status !== 'completed';

    if (isOverdue) {
      return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
    }

    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case 'not_started':
        return <Badge className="bg-gray-100 text-gray-800">Not Started</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getDriverName = (driver: any) => {
    if (driver.first_name && driver.last_name) {
      return `${driver.first_name} ${driver.last_name}`;
    }
    return driver.email;
  };

  const getDaysUntilDue = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-lg">Loading training management...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/auth" replace />;
  }

  if (!['admin', 'council'].includes(profile.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  const content = (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className={`${isMobile ? 'space-y-3' : 'flex justify-between items-center'}`}>
        <div>
          <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-gray-900 flex items-center gap-2 sm:gap-3`}>
            <Award className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-blue-600`} />
            Training Management
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage driver training assignments and track progress</p>
        </div>
        <div className={`flex items-center gap-2 ${isMobile ? 'w-full' : 'space-x-2'}`}>
          <Button 
            onClick={fetchTrainingRecords} 
            variant="outline" 
            disabled={loading}
            size={isMobile ? "sm" : "default"}
            className={isMobile ? 'flex-1' : ''}
          >
            <RefreshCw className={`w-4 h-4 ${isMobile ? 'mr-1' : 'mr-2'} ${loading ? 'animate-spin' : ''}`} />
            {isMobile ? 'Refresh' : 'Refresh Data'}
          </Button>
          <AssignTrainingDialog onTrainingAssigned={fetchTrainingRecords} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Assignments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Award className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Not Started</p>
                <p className="text-2xl font-bold text-gray-600">{stats.notStarted}</p>
              </div>
              <User className="w-8 h-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Training Records */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Training Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {trainingRecords.length === 0 ? (
            <div className="text-center py-8">
              <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Training Assignments</h3>
              <p className="text-gray-600 mb-4">Start by assigning training to your drivers</p>
              <AssignTrainingDialog onTrainingAssigned={fetchTrainingRecords} />
            </div>
          ) : (
            <div className="space-y-4">
              {trainingRecords.map((record) => {
                const daysUntilDue = getDaysUntilDue(record.due_date);
                const isOverdue = daysUntilDue < 0 && record.status !== 'completed';
                
                return (
                  <div key={record.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          <User className="w-8 h-8 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {getDriverName(record.driver)}
                          </h3>
                          <p className="text-sm text-gray-600">{record.training_name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(record.status, record.due_date)}
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          Due: {format(new Date(record.due_date), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className={`text-sm ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
                          {isOverdue 
                            ? `${Math.abs(daysUntilDue)} days overdue`
                            : `${daysUntilDue} days remaining`
                          }
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          Progress: {record.progress}%
                        </span>
                      </div>
                    </div>
                    
                    <Progress value={record.progress} className="mb-2" />
                    
                    {record.notes && (
                      <p className="text-sm text-gray-600 mt-2">
                        <strong>Notes:</strong> {record.notes}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return isMobile ? (
    <div className="container mx-auto px-4 py-6">
      {content}
    </div>
  ) : (
    <div className="container mx-auto px-6 py-8">
      {content}
    </div>
  );
};

export default AdminTrainingManagement;
