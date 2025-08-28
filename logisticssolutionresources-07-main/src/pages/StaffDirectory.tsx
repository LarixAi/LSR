import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Users, Search, Phone, Mail, MapPin, Filter, UserCheck, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import UserAuthorizationDialog from '@/components/admin/UserAuthorizationDialog';

interface StaffMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: string;
  employment_status: string;
  avatar_url?: string;
  city?: string;
  state?: string;
}

const StaffDirectory = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('active');
  const [selectedUser, setSelectedUser] = useState<StaffMember | null>(null);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  // Check if current user is admin
  const isAdmin = profile?.role === 'admin' || profile?.role === 'council';

  // Fetch staff members from the organization with real-time updates
  const { data: staffMembers = [], isLoading, refetch } = useQuery({
    queryKey: ['staff-directory', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, phone, role, employment_status, avatar_url, city, state')
        .eq('organization_id', profile.organization_id)
        .eq('is_active', true)
        .order('first_name');

      if (error) throw error;
      return data as StaffMember[];
    },
    enabled: !!profile?.organization_id
  });

  // Set up real-time subscription for staff changes
  useEffect(() => {
    if (!profile?.organization_id) return;

    const channel = supabase
      .channel('staff-directory-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `organization_id=eq.${profile.organization_id}`
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.organization_id, refetch]);

  // Filter and search logic
  const filteredStaff = useMemo(() => {
    return staffMembers.filter(member => {
      const matchesSearch = searchTerm === '' || 
        `${member.first_name} ${member.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.role.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter === 'all' || member.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || member.employment_status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [staffMembers, searchTerm, roleFilter, statusFilter]);

  // Get available roles for filtering
  const availableRoles = useMemo(() => {
    const roles = [...new Set(staffMembers.map(member => member.role))];
    return roles.sort();
  }, [staffMembers]);

  const getRoleColor = (role: string) => {
    const roleColors: Record<string, string> = {
      'admin': 'bg-red-500/10 text-red-700 border border-red-200',
      'council': 'bg-purple-500/10 text-purple-700 border border-purple-200',
      'driver': 'bg-blue-500/10 text-blue-700 border border-blue-200',
      'mechanic': 'bg-green-500/10 text-green-700 border border-green-200',
      'parent': 'bg-gray-500/10 text-gray-700 border border-gray-200',
      'support': 'bg-orange-500/10 text-orange-700 border border-orange-200'
    };
    return roleColors[role] || 'bg-gray-500/10 text-gray-700 border border-gray-200';
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      'active': 'bg-green-500/10 text-green-700 border border-green-200',
      'pending': 'bg-yellow-500/10 text-yellow-700 border border-yellow-200',
      'inactive': 'bg-gray-500/10 text-gray-700 border border-gray-200',
      'terminated': 'bg-red-500/10 text-red-700 border border-red-200'
    };
    return statusColors[status] || 'bg-gray-500/10 text-gray-700 border border-gray-200';
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const formatRole = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const shouldShowContactInfo = (memberRole: string) => {
    // Only show contact info for certain roles or if user is admin
    return profile?.role === 'admin' || profile?.role === 'council' || 
           memberRole === 'admin' || memberRole === 'council';
  };

  const handleUserClick = (member: StaffMember) => {
    if (isAdmin) {
      setSelectedUser(member);
      setAuthDialogOpen(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-gray-600">Loading staff directory...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-6">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/settings')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Settings</span>
          </Button>
        </div>

        <div className="text-center mb-6">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Users className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Staff Directory</h1>
          </div>
          <p className="text-gray-600">Connect with your team members and colleagues</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{staffMembers.length}</div>
                <div className="text-sm text-gray-500">Total Staff</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {staffMembers.filter(s => s.employment_status === 'active').length}
                </div>
                <div className="text-sm text-gray-500">Active</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {availableRoles.length}
                </div>
                <div className="text-sm text-gray-500">Roles</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{filteredStaff.length}</div>
                <div className="text-sm text-gray-500">Showing</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="w-5 h-5" />
              <span>Search & Filter</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search Staff</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, email, or role..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Filter by Role</label>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {availableRoles.map(role => (
                      <SelectItem key={role} value={role}>
                        {formatRole(role)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Filter by Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Staff List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {filteredStaff.map((member) => (
            <Card 
              key={member.id} 
              className="bg-white shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-gray-300"
            >
              <CardContent className="p-4 md:p-6">
                <div className="space-y-4">
                  {/* Avatar and Settings */}
                  <div className="flex items-start justify-between">
                    <Avatar className="w-12 h-12 md:w-16 md:h-16">
                      <AvatarImage src={member.avatar_url} alt={`${member.first_name} ${member.last_name}`} />
                      <AvatarFallback className="bg-blue-100 text-blue-800 text-sm md:text-lg font-semibold">
                        {getInitials(member.first_name, member.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUserClick(member)}
                        className="p-1 h-8 w-8 hover:bg-gray-100"
                      >
                        <Settings className="w-4 h-4 text-gray-400 hover:text-blue-600" />
                      </Button>
                    )}
                  </div>
                  
                  {/* Name */}
                  <div>
                    <h3 
                      className={`font-semibold text-base md:text-lg text-gray-900 leading-tight ${
                        isAdmin ? 'cursor-pointer hover:text-blue-600 transition-colors' : ''
                      }`}
                      onClick={() => isAdmin && handleUserClick(member)}
                    >
                      {member.first_name} {member.last_name}
                    </h3>
                  </div>
                  
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    <Badge className={`${getRoleColor(member.role)} text-xs font-medium px-2 py-1`}>
                      {formatRole(member.role)}
                    </Badge>
                    <Badge className={`${getStatusColor(member.employment_status)} text-xs font-medium px-2 py-1`}>
                      {member.employment_status}
                    </Badge>
                  </div>

                  {/* Contact Information */}
                  {shouldShowContactInfo(member.role) && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate text-xs md:text-sm">{member.email}</span>
                      </div>
                      
                      {member.phone && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4 flex-shrink-0" />
                          <span className="text-xs md:text-sm">{member.phone}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Location */}
                  {(member.city || member.state) && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate text-xs md:text-sm">
                        {member.city}{member.city && member.state && ', '}{member.state}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredStaff.length === 0 && (
          <Card className="bg-white shadow-lg">
            <CardContent className="pt-12 pb-12">
              <div className="text-center">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Staff Found</h3>
                <p className="text-gray-600 mb-4">
                  No staff members match your current search and filter criteria.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setRoleFilter('all');
                    setStatusFilter('active');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Privacy Notice */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <UserCheck className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-blue-900 mb-2">Privacy Notice:</h3>
                <p className="text-sm text-blue-800">
                  Contact information is only displayed based on your role and organization permissions. 
                  This directory is for internal use only and should not be shared outside the organization.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Authorization Dialog */}
        <UserAuthorizationDialog
          user={selectedUser}
          open={authDialogOpen}
          onOpenChange={setAuthDialogOpen}
        />
      </div>
    </div>
  );
};

export default StaffDirectory;