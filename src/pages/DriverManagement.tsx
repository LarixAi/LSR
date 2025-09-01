import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  Search, 
  MoreHorizontal,
  Mail,
  Car,
  Globe,
  Shield,
  MapPin
} from 'lucide-react';
import { useDrivers, useUpdateDriver, useDeleteDriver } from '@/hooks/useDrivers';
import { toast } from 'sonner';

import { PasswordChangeDialog } from '@/components/admin/PasswordChangeDialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

export default function DriverManagement() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<{
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    organization_id?: string;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedDrivers, setSelectedDrivers] = useState<string[]>([]);
  const { data: drivers = [], isLoading, error, refetch } = useDrivers();

  // Sorting and pagination
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { mutateAsync: updateDriver } = useUpdateDriver();
  const { mutateAsync: deactivateDriver } = useDeleteDriver();

  // Test Supabase connection
  const [connectionStatus, setConnectionStatus] = React.useState<'testing' | 'connected' | 'error'>('testing');
  
  React.useEffect(() => {
    const testConnection = async () => {
      try {
        console.log('Testing Supabase connection...');
        setConnectionStatus('testing');
        const { data, error } = await supabase
          .from('profiles')
          .select('count')
          .limit(1);
        
        if (error) {
          console.error('Supabase connection test failed:', error);
          setConnectionStatus('error');
        } else {
          console.log('Supabase connection test successful:', data);
          setConnectionStatus('connected');
          
          // Test organization-specific query
          if (profile?.organization_id) {
            console.log('Testing organization query for org:', profile.organization_id);
            const { data: orgProfiles, error: orgError } = await supabase
              .from('profiles')
              .select('id, email, first_name, last_name, role, organization_id')
              .eq('organization_id', profile.organization_id);
            
            if (orgError) {
              console.error('Organization query failed:', orgError);
            } else {
              console.log('Organization profiles found:', orgProfiles);
              console.log('Drivers in organization:', orgProfiles?.filter(p => p.role === 'driver'));
            }
          }
        }
      } catch (err) {
        console.error('Supabase connection test error:', err);
        setConnectionStatus('error');
      }
    };

    testConnection();
  }, [profile?.organization_id]);

  const handleAddDriver = () => {
    navigate('/add-driver');
  };

  const handlePasswordChange = (driver: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
    organization_id?: string;
  }) => {
    setSelectedDriver(driver);
    setPasswordDialogOpen(true);
  };

  const handlePasswordDialogClose = () => {
    setPasswordDialogOpen(false);
    setSelectedDriver(null);
  };

  // Calculate driver stats
  const totalDrivers = drivers.length;
  const activeDrivers = drivers.filter(driver => driver.is_active).length;
  const inactiveDrivers = drivers.filter(driver => !driver.is_active).length;
  const newDrivers = drivers.filter(driver => {
    const hireDate = driver.created_at ? new Date(driver.created_at) : null;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return hireDate && hireDate > thirtyDaysAgo;
  }).length;

  // Filter drivers based on search and filters
  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = searchTerm === '' || 
      `${driver.first_name || ''} ${driver.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (driver.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && driver.is_active) ||
      (statusFilter === 'inactive' && !driver.is_active);
    
    const matchesType = typeFilter === 'all' || driver.role === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Sort by name
  const sortedDrivers = [...filteredDrivers].sort((a, b) => {
    const nameA = `${a.first_name || ''} ${a.last_name || ''}`.trim().toLowerCase();
    const nameB = `${b.first_name || ''} ${b.last_name || ''}`.trim().toLowerCase();
    if (nameA < nameB) return sortAsc ? -1 : 1;
    if (nameA > nameB) return sortAsc ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedDrivers.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedDrivers = sortedDrivers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDrivers(filteredDrivers.map(driver => driver.id));
    } else {
      setSelectedDrivers([]);
    }
  };

  const handleSelectDriver = (driverId: string, checked: boolean) => {
    if (checked) {
      setSelectedDrivers([...selectedDrivers, driverId]);
    } else {
      setSelectedDrivers(selectedDrivers.filter(id => id !== driverId));
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-500' : 'bg-gray-400';
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? 'Active' : 'No Access';
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-4 h-4" />;
      case 'driver':
        return <Car className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Account Owner';
      case 'driver':
        return 'Driver';
      default:
        return 'Employee';
    }
  };

  const handleDriverClick = (driverId: string) => {
    navigate(`/drivers/${driverId}`);
  };

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Driver Management</h1>
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <p className="text-destructive">Error loading drivers: {error.message}</p>
              <div className="mt-4 p-4 bg-gray-100 rounded text-left">
                <p><strong>Debug Info:</strong></p>
                <p>Organization ID: {selectedDriver?.organization_id || 'Not available'}</p>
                <p>Error details: {JSON.stringify(error, null, 2)}</p>
              </div>
              <Button onClick={() => refetch()} className="mt-4">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Driver Management</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-gray-600">Connection Status:</span>
            {connectionStatus === 'testing' && (
              <span className="text-sm text-yellow-600">Testing...</span>
            )}
            {connectionStatus === 'connected' && (
              <span className="text-sm text-green-600">Connected</span>
            )}
            {connectionStatus === 'error' && (
              <span className="text-sm text-red-600">Connection Error</span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleAddDriver}>
            <Plus className="w-4 h-4 mr-2" />
            Add Driver
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Drivers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDrivers}</div>
            {totalDrivers === 0 && !isLoading && (
              <div className="mt-2 p-2 bg-yellow-50 rounded text-xs text-yellow-800">
                No drivers found. Check console for debug info.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Drivers</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeDrivers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Drivers</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inactiveDrivers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Month</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newDrivers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="User Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">No Access</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="User Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="driver">Driver</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">Filters</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Drivers Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox 
                      checked={selectedDrivers.length === filteredDrivers.length && filteredDrivers.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => setSortAsc(!sortAsc)}>
                    <div className="flex items-center gap-1 select-none">
                      Name
                      <span className="text-gray-400">{sortAsc ? '▲' : '▼'}</span>
                    </div>
                  </TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>User Status</TableHead>
                  <TableHead>User Type</TableHead>
                  <TableHead>User Role</TableHead>
                  <TableHead>Login Count</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Group</TableHead>
                  <TableHead>Assigned Vehicles</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedDrivers.map((driver) => (
                  <TableRow 
                    key={driver.id}
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleDriverClick(driver.id)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox 
                        checked={selectedDrivers.includes(driver.id)}
                        onCheckedChange={(checked) => handleSelectDriver(driver.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-600">
                          {getInitials(driver.first_name, driver.last_name)}
                        </div>
                        <div>
                          <div className="font-medium hover:text-blue-600 transition-colors">{driver.first_name} {driver.last_name}</div>
                          <Badge variant="outline" className="text-xs">Sample</Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <a href={`mailto:${driver.email}`} className="text-green-600 hover:underline flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {driver.email}
                      </a>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(driver.is_active)}`}></div>
                        <button
                          className={`text-left ${driver.is_active ? 'underline hover:text-blue-600' : 'text-gray-600 hover:text-foreground'} cursor-pointer`}
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              if (driver.is_active) {
                                await deactivateDriver(driver.id);
                                toast.success('Driver deactivated');
                              } else {
                                await updateDriver({ id: driver.id, updates: { is_active: true } });
                                toast.success('Driver reactivated');
                              }
                            } catch (err) {
                              toast.error('Failed to update status');
                            }
                          }}
                        >
                          {getStatusText(driver.is_active)}
                        </button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getRoleIcon(driver.role)}
                        <span>{getRoleText(driver.role)}</span>
                      </div>
                    </TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Badge variant="secondary" className="text-xs">Employee</Badge>
                        {driver.role === 'driver' && (
                          <Badge variant="secondary" className="text-xs">Operator</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>Main Office</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Car className="w-3 h-3" />
                        <span className="text-green-600 hover:underline cursor-pointer">
                          {driver.role === 'driver' ? '1001 [2020 Ford Transit]' : '-'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {(!filteredDrivers || filteredDrivers.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      <div className="flex flex-col items-center space-y-2">
                        <UserX className="w-8 h-8 text-gray-400" />
                        <span className="text-gray-500">No drivers found</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          {filteredDrivers.length > 0 && (
            <div className="p-4 border-t">
              <div className="flex flex-col md:flex-row gap-3 md:justify-between md:items-center text-sm text-gray-600">
                <span>
                  Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredDrivers.length)} of {filteredDrivers.length}
                </span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</Button>
                  <span>Page {currentPage} / {totalPages}</span>
                  <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>



      {/* Password Change Dialog */}
      <PasswordChangeDialog
        isOpen={passwordDialogOpen}
        onClose={handlePasswordDialogClose}
        driver={selectedDriver}
      />
    </div>
  );
}