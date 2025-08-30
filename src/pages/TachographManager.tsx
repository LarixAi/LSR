import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Database, 
  Upload, 
  Folder, 
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
  BarChart3,
  Calendar,
  Users,
  Truck,
  Activity,
  CreditCard,
  Plus
} from 'lucide-react';
import TachographDataOutline from '@/components/tachograph/TachographDataOutline';
import TachographFolderManager from '@/components/tachograph/TachographFolderManager';
import TachographCardReader from '@/components/tachograph/TachographCardReader';
import AnalogTachographUpload from '@/components/tachograph/AnalogTachographUpload';
import { Button } from '@/components/ui/button';
import PageLayout from '@/components/layout/PageLayout';
import { useTachographData } from '@/hooks/useTachographData';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import ErrorBoundary from '@/components/ErrorBoundary';

const TachographManager = () => {
  // ALL HOOKS MUST BE CALLED AT THE TOP LEVEL - NO CONDITIONAL HOOKS
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewFilter, setViewFilter] = useState('all');

  // Fetch tachograph data
  const { 
    tachographRecords, 
    stats, 
    isLoading, 
    hasData, 
    isError, 
    error, 
    refetch 
  } = useTachographData();
  
  // Debug logging
  console.log('TachographManager Debug:', {
    tachographRecords: tachographRecords?.length || 0,
    stats,
    isLoading,
    hasData,
    profile: profile?.organization_id
  });
  
  // Filter records based on search and view filter
  const filteredRecords = tachographRecords.filter(record => {
    const matchesSearch = searchTerm === '' || 
      (record as any).driver?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record as any).driver?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record as any).vehicle?.vehicle_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record as any).vehicle?.license_plate?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = viewFilter === 'all' || 
      (viewFilter === 'digital' && record.card_type === 'driver') ||
      (viewFilter === 'analog' && record.card_type === 'company') ||
      (viewFilter === 'reports' && record.activity_type === 'driving');
    
    return matchesSearch && matchesFilter;
  });

  // Calculate real-time statistics
  const realStats = {
    totalFiles: stats.totalRecords,
    activeVehicles: typeof stats.vehicles === 'number' ? stats.vehicles : 0,
    drivers: typeof stats.drivers === 'number' ? stats.drivers : 0,
    violations: stats.violations,
    complianceScore: Math.max(0, 100 - (stats.violations * 10)),
    storageUsed: `${(stats.totalRecords * 0.002).toFixed(1)}GB` // Estimate 2MB per record
  };

  // PageLayout configuration
  const summaryCards = [
    {
      title: "Total Files",
      value: realStats.totalFiles.toString(),
      icon: <FileText className="h-4 w-4" />,
      color: "text-blue-600"
    },
    {
      title: "Active Vehicles",
      value: realStats.activeVehicles.toString(),
      icon: <Truck className="h-4 w-4" />,
      color: "text-green-600"
    },
    {
      title: "Drivers",
      value: realStats.drivers.toString(),
      icon: <Users className="h-4 w-4" />,
      color: "text-purple-600"
    },
    {
      title: "Violations",
      value: realStats.violations.toString(),
      icon: <AlertTriangle className="h-4 w-4" />,
      color: "text-orange-600"
    },
    {
      title: "Compliance Score",
      value: `${realStats.complianceScore}%`,
      icon: <Shield className="h-4 w-4" />,
      color: realStats.complianceScore >= 90 ? "text-green-600" : realStats.complianceScore >= 70 ? "text-orange-600" : "text-red-600"
    },
    {
      title: "Storage Used",
      value: realStats.storageUsed,
      icon: <HardDrive className="h-4 w-4" />,
      color: "text-indigo-600"
    }
  ];

  const filters = [
    {
      label: "File Type",
      value: viewFilter,
      options: [
        { value: "all", label: "All Files" },
        { value: "digital", label: "Digital Files" },
        { value: "analog", label: "Analog Files" },
        { value: "reports", label: "Reports" }
      ],
      onChange: setViewFilter
    }
  ];

  const tabs = [
    { value: "overview", label: "Overview" },
    { value: "card-reader", label: "Card Reader" },
    { value: "folders", label: "Folders" },
    { value: "upload", label: "Upload" },
    { value: "compliance", label: "Compliance" }
  ];

  const emptyState = {
    icon: <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />,
    title: "No Tachograph Data",
    description: "No tachograph files found. Upload your first tachograph data to get started.",
    action: {
      label: "Upload Data",
      onClick: () => setActiveTab('upload')
    }
  };

  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <TachographDataOutline 
            tachographRecords={tachographRecords}
            stats={stats}
            isLoading={isLoading}
            hasData={hasData}
            isError={isError}
            error={error}
            refetch={refetch}
          />
        );
      
      case 'card-reader':
        return (
          <div className="space-y-6">
            {/* Card Reader Header */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Tachograph Card Reader
                </CardTitle>
                <p className="text-muted-foreground">
                  Connect to tachograph card readers to download driver and vehicle data directly from tachograph cards
                </p>
              </CardHeader>
            </Card>

            {/* Card Reader Component */}
            <TachographCardReader 
              onDataDownloaded={(cardData) => {
                // Handle data downloaded callback
                console.log('Card data downloaded:', cardData);
              }}
            />
          </div>
        );
      
      case 'folders':
        return <TachographFolderManager />;
      
      case 'upload':
        return <AnalogTachographUpload />;
      
      case 'compliance':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Compliance Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Compliance Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-semibold text-green-800">Compliant</p>
                        <p className="text-2xl font-bold text-green-600">{realStats.complianceScore}%</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="font-semibold text-orange-800">Warnings</p>
                        <p className="text-2xl font-bold text-orange-600">{Math.max(0, realStats.violations - 1)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="font-semibold text-red-800">Violations</p>
                        <p className="text-2xl font-bold text-red-600">{Math.min(realStats.violations, 1)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Issues */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Recent Compliance Issues</h3>
                  {hasData && filteredRecords.length > 0 ? (
                    <div className="space-y-3">
                      {filteredRecords
                        .filter(record => record.violations && record.violations.length > 0)
                        .slice(0, 3)
                        .map((record, index) => (
                          <div key={record.id} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center gap-3">
                              <AlertTriangle className="h-4 w-4 text-red-600" />
                              <div>
                                <p className="font-medium">Tachograph Violation</p>
                                <p className="text-sm text-muted-foreground">
                                  {(record as any).vehicle?.vehicle_number || 'Unknown Vehicle'} | Driver: {(record as any).driver?.first_name} {(record as any).driver?.last_name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(record.record_date), 'MMM dd, yyyy')} • {record.violations.join(', ')}
                                </p>
                              </div>
                            </div>
                            <Badge variant="destructive">Critical</Badge>
                          </div>
                        ))}
                      {filteredRecords.filter(record => record.violations && record.violations.length > 0).length === 0 && (
                        <div className="text-center py-8">
                          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                          <p className="text-gray-600">No compliance issues found</p>
                          <p className="text-sm text-gray-500">All tachograph records are compliant</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No tachograph data available</p>
                      <p className="text-sm text-gray-500">Upload tachograph data to view compliance information</p>
                    </div>
                  )}
                </div>

                {/* Compliance Statistics */}
                {hasData && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Driving Time Compliance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Total Driving Hours</span>
                            <span className="font-medium">{Math.round(stats.totalDrivingTime)}h</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Average Daily</span>
                            <span className="font-medium">{stats.totalRecords > 0 ? Math.round(stats.totalDrivingTime / stats.totalRecords) : 0}h</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Data Quality</span>
                            <span className="font-medium">{Math.round(stats.averageDataQuality)}%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Distance & Activity</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Total Distance</span>
                            <span className="font-medium">{Math.round(stats.totalDistance)} km</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Active Drivers</span>
                            <span className="font-medium">{typeof stats.drivers === 'number' ? stats.drivers : 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Active Vehicles</span>
                            <span className="font-medium">{typeof stats.vehicles === 'number' ? stats.vehicles : 0}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Compliance Actions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h5 className="font-medium text-blue-800">Compliance Actions</h5>
                      <ul className="text-sm text-blue-700 mt-1 space-y-1">
                        <li>• Review and address violations within 24 hours</li>
                        <li>• Maintain 3-year retention of all tachograph data</li>
                        <li>• Regular compliance audits and reporting</li>
                        <li>• Driver training on tachograph regulations</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      
      default:
        return (
          <TachographDataOutline 
            tachographRecords={tachographRecords}
            stats={stats}
            isLoading={isLoading}
            hasData={hasData}
            isError={isError}
            error={error}
            refetch={refetch}
          />
        );
    }
  };

  return (
    <ErrorBoundary>
      <PageLayout
        title="Tachograph Manager"
        description="Manage digital and analog tachograph data, monitor compliance, and organize driver records"
        actionButton={{
          label: "Upload Data",
          onClick: () => setActiveTab('upload'),
          icon: <Upload className="w-4 h-4 mr-2" />
        }}
        summaryCards={summaryCards}
        searchPlaceholder="Search tachograph files..."
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        filters={filters}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isLoading={isLoading}
        emptyState={!hasData && !isLoading ? emptyState : undefined}
      >
        <div className="space-y-4">
          {renderTabContent()}
        </div>
      </PageLayout>
    </ErrorBoundary>
  );
};

export default TachographManager;