import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Database, 
  Upload, 
  Folder, 
  FolderPlus, 
  FileText, 
  Server, 
  Shield, 
  Clock, 
  Settings, 
  CheckCircle,
  AlertTriangle,
  Info,
  ChevronRight,
  HardDrive,
  Cloud,
  Lock,
  Users,
  Truck,
  Activity,
  Calendar,
  MapPin,
  RefreshCw,
  ChevronDown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { TachographRecord, TachographStats } from '@/hooks/useTachographData';

interface TachographDataOutlineProps {
  onCreateFolder?: (folderName: string, parentFolder?: string) => void;
  tachographRecords?: TachographRecord[];
  stats?: TachographStats;
  isLoading?: boolean;
  hasData?: boolean;
  isError?: boolean;
  error?: Error | null;
  refetch?: () => void;
}

const TachographDataOutline: React.FC<TachographDataOutlineProps> = ({ 
  onCreateFolder, 
  tachographRecords = [], 
  stats = {
    totalRecords: 0,
    totalDrivingTime: 0,
    totalDistance: 0,
    violations: 0,
    averageDataQuality: 0,
    drivers: 0,
    vehicles: 0,
  }, 
  isLoading = false, 
  hasData = false,
  isError = false,
  error = null,
  refetch
}) => {
  const navigate = useNavigate();
  const [newFolderName, setNewFolderName] = useState('');
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const { toast } = useToast();

  // Memoize the recent records to prevent unnecessary re-renders
  const recentRecords = useMemo(() => {
    return tachographRecords.slice(0, 5);
  }, [tachographRecords]);

  // Debug logging with more detailed information
  console.log('TachographDataOutline Debug:', {
    tachographRecords: tachographRecords?.length || 0,
    stats,
    isLoading,
    hasData,
    isError,
    error: error?.message,
    records: tachographRecords?.slice(0, 2), // Log first 2 records for debugging
    firstRecord: tachographRecords?.[0], // Log first record details
    shouldShowData: tachographRecords && tachographRecords.length > 0,
    recentRecordsLength: recentRecords?.length || 0
  });

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) {
      toast({
        title: "Invalid Folder Name",
        description: "Please enter a valid folder name.",
        variant: "destructive"
      });
      return;
    }

    onCreateFolder?.(newFolderName.trim());
    setNewFolderName('');
    setFolderDialogOpen(false);
    
    toast({
      title: "Folder Created",
      description: `Folder "${newFolderName}" has been created successfully.`,
    });
  };

  const handleRetry = () => {
    if (refetch) {
      refetch();
      toast({
        title: "Refreshing Data",
        description: "Attempting to fetch tachograph data again.",
      });
    }
  };

  const handleRecordClick = (record: TachographRecord) => {
    // Check if the record has violations
    if (record.violations && record.violations.length > 0) {
      // Navigate to Infringement Management page with record details
      navigate('/admin/infringement-management', {
        state: {
          selectedRecord: record,
          source: 'tachograph',
          violations: record.violations,
          driverId: record.driver_id,
          vehicleId: record.vehicle_id,
          recordDate: record.record_date
        }
      });
      
      toast({
        title: "Infringement Details",
        description: `Viewing violations for ${record.driver?.first_name} ${record.driver?.last_name}`,
      });
    } else {
      // Show a toast for records without violations
      toast({
        title: "No Violations",
        description: "This record has no violations to review.",
      });
    }
  };

  // Error state
  if (isError) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Error Loading Tachograph Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load Data</h3>
              <p className="text-gray-500 mb-4">
                {error?.message || 'An error occurred while loading tachograph data.'}
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={handleRetry} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
                <Button>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Data
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Tachograph Data Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="ml-2">Loading tachograph data...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Recent Records Table */}
      {recentRecords && recentRecords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Tachograph Records
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Latest tachograph data with driver and vehicle details
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-3 font-medium text-sm">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        Vehicle
                      </div>
                    </th>
                    <th className="text-left p-3 font-medium text-sm">Driver</th>
                    <th className="text-left p-3 font-medium text-sm">
                      <div className="flex items-center gap-1">
                        Record Date
                        <ChevronDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="text-left p-3 font-medium text-sm">Duration</th>
                    <th className="text-left p-3 font-medium text-sm">Activity Type</th>
                    <th className="text-left p-3 font-medium text-sm">Card Type</th>
                    <th className="text-left p-3 font-medium text-sm">Distance</th>
                    <th className="text-left p-3 font-medium text-sm">Violations</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRecords.map((record, index) => (
                    <tr 
                      key={record.id} 
                      className={`border-b hover:bg-gray-50 transition-colors cursor-pointer ${
                        record.violations && record.violations.length > 0 ? 'border-l-4 border-l-red-500' : ''
                      }`}
                      onClick={() => handleRecordClick(record)}
                      title={record.violations && record.violations.length > 0 ? 
                        `Click to view ${record.violations.length} violation(s)` : 
                        'Click to view record details'
                      }
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <input type="checkbox" className="rounded" />
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                              <Truck className="h-4 w-4 text-gray-600" />
                            </div>
                            <div>
                              <div className="font-medium text-sm underline cursor-pointer">
                                {record.vehicle?.vehicle_number || 'Unknown'} [{record.vehicle?.make} {record.vehicle?.model}]
                              </div>
                              <div className="text-xs text-gray-500">
                                {record.vehicle?.license_plate || 'No Plate'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {record.driver?.avatar_url ? (
                            <img 
                              src={record.driver.avatar_url} 
                              alt={`${record.driver.first_name} ${record.driver.last_name}`}
                              className="w-6 h-6 rounded-full object-cover border border-gray-200"
                              onError={(e) => {
                                // Fallback to initials if image fails to load
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={`w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-medium ${
                            record.driver?.avatar_url ? 'hidden' : ''
                          }`}>
                            {record.driver?.first_name?.[0]}{record.driver?.last_name?.[0]}
                          </div>
                          <span className="text-sm underline cursor-pointer">
                            {record.driver?.first_name} {record.driver?.last_name}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span className="underline cursor-pointer">
                            {format(new Date(record.record_date), 'EEE, MMM dd, yyyy h:mma')}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-sm">
                        {record.start_time && record.end_time ? (
                          (() => {
                            try {
                              const start = new Date(record.start_time);
                              const end = new Date(record.end_time);
                              const durationMinutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
                              return `${durationMinutes}m`;
                            } catch {
                              return '—';
                            }
                          })()
                        ) : '—'}
                      </td>
                      <td className="p-3 text-sm">
                        {record.activity_type || '—'}
                      </td>
                      <td className="p-3 text-sm">
                        {record.card_type || '—'}
                      </td>
                      <td className="p-3 text-sm">
                        {record.distance_km ? `${Math.round(record.distance_km)}km` : '—'}
                      </td>
                      <td className="p-3">
                        {record.violations && record.violations.length > 0 ? (
                          <div className="flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3 text-yellow-500" />
                            <span className="text-sm text-red-600">
                              {record.violations.length} violation{record.violations.length > 1 ? 's' : ''}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Quality Metrics */}
      {tachographRecords && tachographRecords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Data Quality & Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{Math.round(stats.averageDataQuality)}%</div>
                <div className="text-sm text-muted-foreground">Average Data Quality</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{Math.round(stats.totalDrivingTime)}h</div>
                <div className="text-sm text-muted-foreground">Total Driving Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{Math.round(stats.totalDistance)}km</div>
                <div className="text-sm text-muted-foreground">Total Distance</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-auto p-4 flex flex-col items-center gap-2">
              <Upload className="h-6 w-6" />
              <span>Upload New Data</span>
            </Button>
            
            <Dialog open={folderDialogOpen} onOpenChange={setFolderDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <FolderPlus className="h-6 w-6" />
                  <span>Create Folder</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Folder</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="folder-name">Folder Name</Label>
                    <Input
                      id="folder-name"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder="Enter folder name..."
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setFolderDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateFolder}>
                      Create Folder
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
              <Shield className="h-6 w-6" />
              <span>View Compliance</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TachographDataOutline;