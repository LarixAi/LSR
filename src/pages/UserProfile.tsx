
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Settings, Shield, Bell, Eye, EyeOff, Save, Edit } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';

const UserProfile = () => {
  const { user, profile } = useAuth();
  const { updating, updateProfile, updatePassword } = useProfile();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    phone: '', // Phone field removed from profile but kept in form for display
  });
  
  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleProfileUpdate = async () => {
    if (!profileForm.first_name.trim() || !profileForm.last_name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'First name and last name are required.',
        variant: 'destructive',
      });
      return;
    }

    const { error } = await updateProfile({
      first_name: profileForm.first_name.trim(),
      last_name: profileForm.last_name.trim(),
    });

    if (!error) {
      setIsEditing(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all password fields.',
        variant: 'destructive',
      });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: 'Validation Error',
        description: 'New passwords do not match.',
        variant: 'destructive',
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: 'Validation Error',
        description: 'Password must be at least 6 characters long.',
        variant: 'destructive',
      });
      return;
    }

    const { error } = await updatePassword(passwordForm.newPassword);

    if (!error) {
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'council':
        return 'bg-blue-100 text-blue-800';
      case 'driver':
        return 'bg-green-100 text-green-800';
      case 'parent':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
        <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>Profile</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center space-x-2">
            <Shield className="w-4 h-4" />
            <span>Security</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center space-x-2">
            <Bell className="w-4 h-4" />
            <span>Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Preferences</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <div className="grid gap-6">
            {/* Profile Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={profile.avatar_url || ''} />
                      <AvatarFallback className="text-lg">
                        {profile.first_name?.[0]}{profile.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-2xl font-bold">
                        {profile.first_name} {profile.last_name}
                      </h2>
                      <p className="text-gray-600">{profile.email}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge className={getRoleColor(profile.role)}>
                          {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                        </Badge>
                        <Badge className={getStatusColor(profile.employment_status || 'inactive')}>
                          {profile.employment_status || 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex items-center space-x-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>{isEditing ? 'Cancel' : 'Edit'}</span>
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* Profile Details */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      id="first_name"
                      value={profileForm.first_name}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, first_name: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      id="last_name"
                      value={profileForm.last_name}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, last_name: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={profile.email}
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-sm text-gray-500">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value=""
                    onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Phone number not available"
                  />
                </div>

                {isEditing && (
                  <div className="flex space-x-2 pt-4">
                    <Button
                      onClick={handleProfileUpdate}
                      disabled={updating}
                      className="flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>{updating ? 'Saving...' : 'Save Changes'}</span>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your password and security preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Change Password</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="current_password">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="current_password"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      placeholder="Enter current password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new_password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new_password"
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Enter new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm_password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Confirm new password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={handlePasswordUpdate}
                  disabled={updating}
                  className="flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{updating ? 'Updating...' : 'Update Password'}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how you want to be notified about updates and activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Notification settings will be available soon.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Application Preferences</CardTitle>
              <CardDescription>
                Customize your application experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Application preferences will be available soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProfile;
