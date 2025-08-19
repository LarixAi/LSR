import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Building2, Users, CheckCircle, AlertCircle, Plus, X, Clock, UserCheck, UserX, Search, ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Organization {
  id: string;
  name: string;
  type: string;
  address?: string;
  phone?: string;
  email?: string;
  created_at: string;
}

interface OrganizationRequest {
  id: string;
  mechanic_id: string;
  organization_id: string;
  request_type: 'mechanic_to_org' | 'org_to_mechanic';
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'terminated';
  requested_by: string;
  approved_by?: string;
  approved_at?: string;
  terminated_by?: string;
  terminated_at?: string;
  termination_reason?: string;
  message?: string;
  response_message?: string;
  created_at: string;
  organization?: Organization;
  mechanic?: any;
}

interface OrganizationSelectorProps {
  onOrganizationSelect: (orgId: string) => void;
  selectedOrganizationId?: string;
}

const OrganizationSelector: React.FC<OrganizationSelectorProps> = ({
  onOrganizationSelect,
  selectedOrganizationId
}) => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [selectedOrgForRequest, setSelectedOrgForRequest] = useState<string>('');
  const [requestMessage, setRequestMessage] = useState('');
  const [availableOrgsSearch, setAvailableOrgsSearch] = useState('');
  const [isAvailableOrgsExpanded, setIsAvailableOrgsExpanded] = useState(false);

  // Fetch active organization relationships
  const { data: activeOrganizations = [], isLoading, error } = useQuery({
    queryKey: ['active-mechanic-organizations', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data: requests, error } = await supabase
        .from('mechanic_organization_requests')
        .select(`
          *,
          organization:organizations(*)
        `)
        .eq('mechanic_id', profile.id)
        .in('status', ['active', 'approved'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching active organizations:', error);
        return [];
      }

      return requests?.map((req: any) => req.organization) || [];
    },
    enabled: !!profile?.id && profile.role === 'mechanic',
  });

  // Fetch pending requests
  const { data: pendingRequests = [] } = useQuery({
    queryKey: ['pending-mechanic-requests', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data: requests, error } = await supabase
        .from('mechanic_organization_requests')
        .select(`
          *,
          organization:organizations(*)
        `)
        .eq('mechanic_id', profile.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pending requests:', error);
        return [];
      }

      return requests || [];
    },
    enabled: !!profile?.id && profile.role === 'mechanic',
  });

  // Fetch available organizations for requests
  const { data: availableOrganizations = [] } = useQuery({
    queryKey: ['available-organizations-for-requests', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data, error } = await supabase
        .rpc('get_available_organizations_for_mechanic', {
          mechanic_uuid: profile.id
        });

      if (error) {
        console.error('Error fetching available organizations:', error);
        return [];
      }

      return data || [];
    },
    enabled: !!profile?.id && profile.role === 'mechanic',
  });

  // Send organization request mutation
  const sendRequestMutation = useMutation({
    mutationFn: async ({ organizationId, message }: { organizationId: string; message: string }) => {
      const { data, error } = await supabase
        .from('mechanic_organization_requests')
        .insert({
          mechanic_id: profile?.id,
          organization_id: organizationId,
          request_type: 'mechanic_to_org',
          requested_by: profile?.id,
          message: message.trim() || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Request Sent',
        description: 'Your request has been sent to the organization.',
      });
      setIsRequestDialogOpen(false);
      setSelectedOrgForRequest('');
      setRequestMessage('');
      queryClient.invalidateQueries({ queryKey: ['pending-mechanic-requests'] });
      queryClient.invalidateQueries({ queryKey: ['available-organizations-for-requests'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send request.',
        variant: 'destructive',
      });
    },
  });

  // Cancel request mutation
  const cancelRequestMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const { error } = await supabase
        .from('mechanic_organization_requests')
        .update({ 
          status: 'terminated',
          terminated_by: profile?.id,
          terminated_at: new Date().toISOString(),
          termination_reason: 'Cancelled by mechanic'
        })
        .eq('id', requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Request Cancelled',
        description: 'Your request has been cancelled.',
      });
      queryClient.invalidateQueries({ queryKey: ['pending-mechanic-requests'] });
      queryClient.invalidateQueries({ queryKey: ['available-organizations-for-requests'] });
    },
  });

  // Auto-select first organization if none selected
  useEffect(() => {
    if (activeOrganizations && activeOrganizations.length > 0 && !selectedOrganizationId) {
      onOrganizationSelect(activeOrganizations[0]?.id);
    }
  }, [activeOrganizations, selectedOrganizationId, onOrganizationSelect]);

  // Don't show selector for non-mechanics
  if (profile?.role !== 'mechanic') {
    return null;
  }

  const selectedOrg = activeOrganizations.find((org: any) => org?.id === selectedOrganizationId);
  const activeCount = activeOrganizations.length;
  const pendingCount = pendingRequests.length;
  const canRequestMore = activeCount < 3;

  // Filter available organizations based on search
  const filteredAvailableOrganizations = availableOrganizations.filter((org) =>
    org.name.toLowerCase().includes(availableOrgsSearch.toLowerCase()) ||
    org.type.toLowerCase().includes(availableOrgsSearch.toLowerCase()) ||
    (org.slug && org.slug.toLowerCase().includes(availableOrgsSearch.toLowerCase()))
  );

  return (
    <div className="mb-6 space-y-4">
      {/* Active Organizations */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Building2 className="h-5 w-5" />
                <span>Working Organizations</span>
                <Badge variant="outline" className="ml-2">
                  {activeCount}/3 Active
                </Badge>
              </CardTitle>
              <CardDescription>
                Select which company you want to work with
              </CardDescription>
            </div>
            {canRequestMore && (
              <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Request to Join</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Request to Join Organization</DialogTitle>
                    <DialogDescription>
                      Send a request to join a new organization. You can work with up to 3 companies.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Select Organization</label>
                      <Select value={selectedOrgForRequest} onValueChange={setSelectedOrgForRequest}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose an organization..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availableOrganizations.map((org) => (
                            <SelectItem key={org.id} value={org.id}>
                              {org.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Message (Optional)</label>
                      <Textarea
                        placeholder="Tell them why you'd like to work with them..."
                        value={requestMessage}
                        onChange={(e) => setRequestMessage(e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsRequestDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        if (selectedOrgForRequest) {
                          sendRequestMutation.mutate({
                            organizationId: selectedOrgForRequest,
                            message: requestMessage
                          });
                        }
                      }}
                      disabled={!selectedOrgForRequest || sendRequestMutation.isPending}
                    >
                      {sendRequestMutation.isPending ? 'Sending...' : 'Send Request'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          {activeOrganizations.length > 0 ? (
            <div className="space-y-4">
              {/* Organization Dropdown */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Select Organization
                </label>
                <Select
                  value={selectedOrganizationId || ''}
                  onValueChange={onOrganizationSelect}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose an organization..." />
                  </SelectTrigger>
                  <SelectContent>
                    {activeOrganizations.map((org) => (
                      <SelectItem key={org?.id} value={org?.id}>
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-4 w-4 text-blue-600" />
                          <span>{org?.name}</span>
                          {selectedOrganizationId === org?.id && (
                            <CheckCircle className="h-4 w-4 text-blue-600 ml-auto" />
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Current Organization Status */}
              {selectedOrg && (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Building2 className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-blue-900">{selectedOrg?.name}</p>
                      <p className="text-sm text-blue-600">
                        Currently active • {activeCount} organization{activeCount > 1 ? 's' : ''} available
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    Active
                  </Badge>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Organizations</h3>
              <p className="text-gray-600 mb-4">
                You need to request to join organizations to start working.
              </p>
              {canRequestMore && (
                <Button onClick={() => setIsRequestDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Request to Join Organization
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Pending Requests</span>
              <Badge variant="outline">{pendingCount}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingRequests.map((request: OrganizationRequest) => (
                <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Building2 className="h-5 w-5 text-orange-500" />
                    <div>
                      <p className="font-medium">{request.organization?.name}</p>
                      <p className="text-sm text-gray-600">
                        Requested {new Date(request.created_at).toLocaleDateString()}
                      </p>
                      {request.message && (
                        <p className="text-sm text-gray-500 mt-1">"{request.message}"</p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => cancelRequestMutation.mutate(request.id)}
                    disabled={cancelRequestMutation.isPending}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Organizations */}
      {availableOrganizations.length > 0 && canRequestMore && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Available Organizations</span>
                <Badge variant="outline">{availableOrganizations.length}</Badge>
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAvailableOrgsExpanded(!isAvailableOrgsExpanded)}
                className="p-1 h-8 w-8"
              >
                {isAvailableOrgsExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </div>
            <CardDescription>
              Organizations you can request to join
            </CardDescription>
          </CardHeader>
          {isAvailableOrgsExpanded && (
            <CardContent>
              {/* Search Box */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search organizations by name, type, or slug..."
                    value={availableOrgsSearch}
                    onChange={(e) => setAvailableOrgsSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Organizations List */}
              <div className="grid gap-3">
                {filteredAvailableOrganizations.length > 0 ? (
                  filteredAvailableOrganizations.map((org) => (
                    <div key={org.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <Building2 className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium">{org.name}</p>
                          <p className="text-sm text-gray-600">{org.type}</p>
                          {org.slug && (
                            <p className="text-xs text-gray-500">@{org.slug}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedOrgForRequest(org.id);
                          setIsRequestDialogOpen(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Request
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Organizations Found</h3>
                    <p className="text-gray-600">
                      {availableOrgsSearch 
                        ? `No organizations match "${availableOrgsSearch}"`
                        : 'No organizations available to request'
                      }
                    </p>
                    {availableOrgsSearch && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAvailableOrgsSearch('')}
                        className="mt-2"
                      >
                        Clear Search
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Show more results indicator */}
              {filteredAvailableOrganizations.length > 5 && (
                <div className="mt-3 text-center">
                  <p className="text-sm text-gray-500">
                    Showing {Math.min(5, filteredAvailableOrganizations.length)} of {filteredAvailableOrganizations.length} organizations
                  </p>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
};

export default OrganizationSelector;
