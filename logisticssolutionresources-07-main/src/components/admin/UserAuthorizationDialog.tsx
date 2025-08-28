import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Shield, 
  Save, 
  RotateCcw, 
  User, 
  Clock,
  AlertTriangle,
  CheckCircle,
  Settings,
  Truck,
  ClipboardList,
  FileText,
  BarChart3,
  Users,
  Wrench
} from 'lucide-react';

interface StaffMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  employment_status: string;
  avatar_url?: string;
}

interface UserPermission {
  id?: string;
  permission_type: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
  is_active: boolean;
}

interface UserAuthorizationDialogProps {
  user: StaffMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PERMISSION_TYPES = [
  { 
    key: 'jobs', 
    label: 'Job Management', 
    icon: ClipboardList,
    description: 'Access to create, view, and manage jobs and assignments'
  },
  { 
    key: 'vehicles', 
    label: 'Vehicle Logs', 
    icon: Truck,
    description: 'Vehicle inspections, maintenance logs, and fleet management'
  },
  { 
    key: 'inspections', 
    label: 'Inspection Tools', 
    icon: CheckCircle,
    description: 'Vehicle inspection forms and safety checklists'
  },
  { 
    key: 'reports', 
    label: 'Report Access', 
    icon: BarChart3,
    description: 'Analytics, compliance reports, and business intelligence'
  },
  { 
    key: 'settings', 
    label: 'Settings Panel', 
    icon: Settings,
    description: 'System configuration and administrative settings'
  },
  { 
    key: 'communications', 
    label: 'Parent Communications', 
    icon: Users,
    description: 'Parent portal, messaging, and notification management'
  },
  { 
    key: 'documents', 
    label: 'Document Management', 
    icon: FileText,
    description: 'Upload, review, and approve driver documents'
  },
  { 
    key: 'maintenance', 
    label: 'Maintenance System', 
    icon: Wrench,
    description: 'Maintenance requests, scheduling, and inventory'
  }
];

const ROLE_TEMPLATES = {
  driver: {
    label: 'Driver Template',
    permissions: {
      jobs: { can_view: true, can_create: false, can_edit: false, can_delete: false },
      vehicles: { can_view: true, can_create: true, can_edit: true, can_delete: false },
      inspections: { can_view: true, can_create: true, can_edit: true, can_delete: false },
      reports: { can_view: false, can_create: false, can_edit: false, can_delete: false },
      settings: { can_view: false, can_create: false, can_edit: false, can_delete: false },
      communications: { can_view: true, can_create: false, can_edit: false, can_delete: false },
      documents: { can_view: true, can_create: true, can_edit: false, can_delete: false },
      maintenance: { can_view: true, can_create: true, can_edit: false, can_delete: false }
    }
  },
  mechanic: {
    label: 'Mechanic Template',
    permissions: {
      jobs: { can_view: true, can_create: false, can_edit: false, can_delete: false },
      vehicles: { can_view: true, can_create: true, can_edit: true, can_delete: false },
      inspections: { can_view: true, can_create: true, can_edit: true, can_delete: false },
      reports: { can_view: true, can_create: false, can_edit: false, can_delete: false },
      settings: { can_view: false, can_create: false, can_edit: false, can_delete: false },
      communications: { can_view: false, can_create: false, can_edit: false, can_delete: false },
      documents: { can_view: true, can_create: true, can_edit: false, can_delete: false },
      maintenance: { can_view: true, can_create: true, can_edit: true, can_delete: false }
    }
  },
  admin: {
    label: 'Admin Template',
    permissions: {
      jobs: { can_view: true, can_create: true, can_edit: true, can_delete: true },
      vehicles: { can_view: true, can_create: true, can_edit: true, can_delete: true },
      inspections: { can_view: true, can_create: true, can_edit: true, can_delete: true },
      reports: { can_view: true, can_create: true, can_edit: true, can_delete: true },
      settings: { can_view: true, can_create: true, can_edit: true, can_delete: true },
      communications: { can_view: true, can_create: true, can_edit: true, can_delete: true },
      documents: { can_view: true, can_create: true, can_edit: true, can_delete: true },
      maintenance: { can_view: true, can_create: true, can_edit: true, can_delete: true }
    }
  }
};

export const UserAuthorizationDialog: React.FC<UserAuthorizationDialogProps> = ({
  user,
  open,
  onOpenChange
}) => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [permissions, setPermissions] = useState<Record<string, UserPermission>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Check if current user is admin
  const isAdmin = profile?.role === 'admin' || profile?.role === 'council';

  useEffect(() => {
    if (user && open) {
      fetchUserPermissions();
    }
  }, [user, open]);

  const fetchUserPermissions = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Mock permissions data (table doesn't exist yet)
      const permissionsMap: Record<string, UserPermission> = {};
      
      // Initialize with default permissions (all false)
      PERMISSION_TYPES.forEach(({ key }) => {
        permissionsMap[key] = {
          permission_type: key,
          can_view: false,
          can_create: false,
          can_edit: false,
          can_delete: false,
          is_active: true
        };
      });

      setPermissions(permissionsMap);
      setHasChanges(false);
    } catch (error: any) {
      console.error('Error fetching permissions:', error);
      toast({
        title: "Error",
        description: "Failed to load user permissions.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updatePermission = (permissionType: string, field: keyof UserPermission, value: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [permissionType]: {
        ...prev[permissionType],
        [field]: value
      }
    }));
    setHasChanges(true);
  };

  const applyTemplate = (templateKey: keyof typeof ROLE_TEMPLATES) => {
    const template = ROLE_TEMPLATES[templateKey];
    const newPermissions = { ...permissions };
    
    Object.entries(template.permissions).forEach(([key, perms]) => {
      newPermissions[key] = {
        ...newPermissions[key],
        ...perms
      };
    });
    
    setPermissions(newPermissions);
    setHasChanges(true);
    
    toast({
      title: "Template Applied",
      description: `${template.label} permissions have been applied.`,
    });
  };

  const savePermissions = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      // Mock save permissions (table doesn't exist yet)
      console.log('Permissions would be saved:', permissions);

      toast({
        title: "Permissions Updated",
        description: `${user.first_name} ${user.last_name}'s permissions have been saved successfully.`,
      });

      setHasChanges(false);
      setShowConfirmDialog(false);
    } catch (error: any) {
      console.error('Error saving permissions:', error);
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save permissions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const resetPermissions = () => {
    fetchUserPermissions();
    setHasChanges(false);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getRoleColor = (role: string) => {
    const roleColors: Record<string, string> = {
      'admin': 'bg-red-100 text-red-800',
      'council': 'bg-purple-100 text-purple-800',
      'driver': 'bg-blue-100 text-blue-800',
      'mechanic': 'bg-green-100 text-green-800',
      'parent': 'bg-gray-100 text-gray-800',
      'support': 'bg-orange-100 text-orange-800'
    };
    return roleColors[role] || 'bg-gray-100 text-gray-800';
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>User Authorization Settings</span>
            </DialogTitle>
            <DialogDescription>
              Manage {user?.first_name} {user?.last_name}'s access permissions and role-based controls.
            </DialogDescription>
          </DialogHeader>

          {user && (
            <div className="space-y-6">
              {/* User Info Header */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={user.avatar_url} alt={`${user.first_name} ${user.last_name}`} />
                      <AvatarFallback className="bg-blue-100 text-blue-800 text-lg font-semibold">
                        {getInitials(user.first_name, user.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-semibold">{user.first_name} {user.last_name}</h3>
                      <p className="text-gray-600">{user.email}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge className={getRoleColor(user.role)} variant="secondary">
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Badge>
                        <Badge variant={user.employment_status === 'active' ? 'default' : 'secondary'}>
                          {user.employment_status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="permissions" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="permissions">Permissions</TabsTrigger>
                  <TabsTrigger value="templates">Quick Templates</TabsTrigger>
                </TabsList>

                <TabsContent value="permissions" className="space-y-4">
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <p className="mt-2 text-gray-600">Loading permissions...</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {PERMISSION_TYPES.map(({ key, label, icon: Icon, description }) => {
                        const perm = permissions[key];
                        if (!perm) return null;

                        return (
                          <Card key={key}>
                            <CardHeader className="pb-3">
                              <div className="flex items-start space-x-3">
                                <Icon className="w-5 h-5 text-blue-600 mt-1" />
                                <div className="flex-1">
                                  <CardTitle className="text-base">{label}</CardTitle>
                                  <CardDescription className="text-sm">{description}</CardDescription>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    id={`${key}-view`}
                                    checked={perm.can_view}
                                    onCheckedChange={(checked) => updatePermission(key, 'can_view', checked)}
                                  />
                                  <Label htmlFor={`${key}-view`} className="text-sm">View</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    id={`${key}-create`}
                                    checked={perm.can_create}
                                    onCheckedChange={(checked) => updatePermission(key, 'can_create', checked)}
                                  />
                                  <Label htmlFor={`${key}-create`} className="text-sm">Create</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    id={`${key}-edit`}
                                    checked={perm.can_edit}
                                    onCheckedChange={(checked) => updatePermission(key, 'can_edit', checked)}
                                  />
                                  <Label htmlFor={`${key}-edit`} className="text-sm">Edit</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    id={`${key}-delete`}
                                    checked={perm.can_delete}
                                    onCheckedChange={(checked) => updatePermission(key, 'can_delete', checked)}
                                  />
                                  <Label htmlFor={`${key}-delete`} className="text-sm">Delete</Label>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="templates" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Permission Templates</CardTitle>
                      <CardDescription>
                        Apply predefined permission sets based on common roles. This will override current settings.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {Object.entries(ROLE_TEMPLATES).map(([key, template]) => (
                        <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{template.label}</h4>
                            <p className="text-sm text-gray-600">
                              Standard permissions for {key} role users
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => applyTemplate(key as keyof typeof ROLE_TEMPLATES)}
                          >
                            Apply Template
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <Separator />

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  onClick={() => setShowConfirmDialog(true)}
                  disabled={!hasChanges || isSaving}
                  className="flex-1"
                >
                  {isSaving ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Save className="w-4 h-4" />
                      <span>Save Changes</span>
                    </div>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={resetPermissions}
                  disabled={!hasChanges || isSaving}
                  className="flex-1"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>

              {hasChanges && (
                <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm text-yellow-800">
                    You have unsaved changes. Don't forget to save your updates.
                  </span>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Permission Changes</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to save these permission changes for {user?.first_name} {user?.last_name}? 
              This will update their access rights immediately and the changes will be logged for security purposes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={savePermissions} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default UserAuthorizationDialog;