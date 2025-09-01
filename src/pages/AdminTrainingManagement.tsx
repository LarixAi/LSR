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
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import StandardPageLayout, { NavigationTab, MetricCard, ActionButton, TableColumn, FilterOption } from '@/components/layout/StandardPageLayout';

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
  const [activeTab, setActiveTab] = useState<'assignments' | 'courses'>('assignments');
  const [modules, setModules] = useState<any[]>([]);
  const [modulesLoading, setModulesLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'not_started' | 'in_progress' | 'completed' | 'overdue'>('all');

  useEffect(() => {
    if (profile?.organization_id) {
      fetchTrainingRecords();
      fetchModules();
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

  const fetchModules = async () => {
    setModulesLoading(true);
    try {
      const { data, error } = await supabase
        .from('training_modules')
        .select('*')
        .eq('organization_id', profile?.organization_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching training modules:', error);
        toast.error('Failed to load training courses');
        return;
      }

      setModules(data || []);
    } catch (e) {
      console.error('Error fetching training modules:', e);
      toast.error('Failed to load training courses');
    } finally {
      setModulesLoading(false);
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
    if (!driver) return 'Unknown driver';
    const first = driver.first_name?.trim();
    const last = driver.last_name?.trim();
    if (first && last) return `${first} ${last}`;
    return driver.email || 'Unknown driver';
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

  // Build StandardPageLayout configs
  const navigationTabs: NavigationTab[] = [
    { value: 'assignments', label: 'Assignments', badge: trainingRecords.length },
    { value: 'courses', label: 'Courses', badge: modules.length },
  ];

  const secondaryActions: ActionButton[] = [
    {
      label: 'Refresh Data',
      onClick: () => { fetchTrainingRecords(); fetchModules(); },
      icon: <RefreshCw className="w-4 h-4" />, 
      variant: 'outline'
    },
    {
      label: 'Assign Training',
      onClick: () => {},
      icon: <Plus className="w-4 h-4" />
    }
  ];

  const metricsCards: MetricCard[] = [
    { title: 'Total Assignments', value: stats.total, icon: <Users className="w-5 h-5" /> },
    { title: 'Completed', value: stats.completed, icon: <CheckCircle className="w-5 h-5" /> },
    { title: 'In Progress', value: stats.inProgress, icon: <Clock className="w-5 h-5" /> },
    { title: 'Overdue', value: stats.overdue, icon: <AlertTriangle className="w-5 h-5" /> },
  ];

  const filters: FilterOption[] = [
    {
      label: 'Status',
      value: statusFilter,
      options: [
        { value: 'all', label: 'All' },
        { value: 'not_started', label: 'Not Started' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' },
        { value: 'overdue', label: 'Overdue' },
      ],
      placeholder: 'Filter status',
      width: 'w-[180px]'
    }
  ];

  const assignmentsTableData = trainingRecords.filter((r) => {
    const name = getDriverName(r.driver).toLowerCase();
    const training = (r.training_name || '').toLowerCase();
    const term = searchTerm.toLowerCase();
    const matchesSearch = !term || name.includes(term) || training.includes(term);
    const isOverdue = getDaysUntilDue(r.due_date) < 0 && r.status !== 'completed';
    const matchesStatus = statusFilter === 'all' ? true : statusFilter === 'overdue' ? isOverdue : r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const assignmentsTableColumns: TableColumn[] = [
    { key: 'driver', label: 'Driver', render: (item: TrainingRecord) => (
      <div className="flex items-center gap-2">
        <User className="w-4 h-4 text-gray-500" />
        <span className="font-medium text-gray-900">{getDriverName(item.driver)}</span>
      </div>
    ) },
    { key: 'training_name', label: 'Training', render: (item: TrainingRecord) => (
      <a className="text-blue-600 hover:underline" href={`/admin/training/assignment/${item.id}`}>{item.training_name}</a>
    ) },
    { key: 'created_at', label: 'Submitted', render: (item: TrainingRecord) => (
      <span className="text-gray-700">{item.created_at ? format(new Date(item.created_at), 'MMM dd, yyyy p') : '—'}</span>
    ) },
    { key: 'due_date', label: 'Due', render: (item: TrainingRecord) => {
      const isOverdue = getDaysUntilDue(item.due_date) < 0 && item.status !== 'completed';
      return (
        <div className="flex items-center gap-2">
          {isOverdue && <AlertTriangle className="w-4 h-4 text-orange-500" />}
          <span className={isOverdue ? 'text-red-600' : 'text-gray-800'}>{format(new Date(item.due_date), 'MMM dd, yyyy p')}</span>
        </div>
      );
    } },
    { key: 'status', label: 'Status', render: (item: TrainingRecord) => getStatusBadge(item.status, item.due_date) },
    { key: 'progress', label: 'Progress', render: (item: TrainingRecord) => (
      <div className="flex items-center gap-2 justify-end">
        <span className="text-sm text-gray-600">{item.progress}%</span>
        <Progress value={item.progress} className="w-24" />
      </div>
    ), align: 'right' },
  ];

  return (
    <StandardPageLayout
      title="Training Management"
      description="Manage driver training assignments and courses"
      secondaryActions={secondaryActions}
      metricsCards={metricsCards}
      showMetricsDashboard={true}
      navigationTabs={navigationTabs}
      activeTab={activeTab}
      onTabChange={(val) => setActiveTab(val as 'assignments' | 'courses')}
      searchConfig={{ placeholder: 'Search driver or training...', value: searchTerm, onChange: setSearchTerm, showSearch: true }}
      filters={filters}
      onFilterChange={(key, val) => { if (key === 'Status') setStatusFilter(val as any); }}
      showTable={activeTab === 'assignments'}
      tableData={activeTab === 'assignments' ? assignmentsTableData : []}
      tableColumns={activeTab === 'assignments' ? assignmentsTableColumns : []}
      isLoading={loading || modulesLoading}
      loadingText="Loading training data..."
      customHeaderContent={
        <div className={`flex items-center gap-2 ${isMobile ? 'w-full' : ''}`}>
          <AssignTrainingDialog onTrainingAssigned={fetchTrainingRecords} />
        </div>
      }
    >
      {activeTab === 'courses' && (
        <Card>
          <CardHeader>
            <CardTitle>Training Courses</CardTitle>
          </CardHeader>
          <CardContent>
            {modulesLoading ? (
              <div className="text-center py-8">Loading courses...</div>
            ) : modules.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-2">No courses found for your organization.</p>
                <p className="text-gray-500 text-sm">Courses will appear here once configured.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {modules.map((m: any) => (
                  <a key={m.id} href={`/admin/training/module/${m.id}`} className="block">
                    <Card className="border hover:bg-gray-50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">{m.name}</h3>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{m.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="secondary">{m.category || 'General'}</Badge>
                              <span className="text-xs text-gray-500">{m.duration || 0} min</span>
                            </div>
                          </div>
                          <div className="text-right space-y-1">
                            {m.is_required && (
                              <div>
                                <Badge className="bg-blue-100 text-blue-800">Required</Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </a>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </StandardPageLayout>
  );
};

export default AdminTrainingManagement;
