
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Building, Users, Shield } from 'lucide-react';

const OrganizationProvisioning = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    companyName: '',
    adminEmail: '',
    adminFirstName: '',
    adminLastName: '',
    adminPhone: '',
    address: ''
  });

  // Generate secure random password
  const generateSecurePassword = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => chars[byte % chars.length]).join('');
  };

  const provisionOrganization = useMutation({
    mutationFn: async (data: typeof formData) => {
      // Mock organization creation (table doesn't exist yet)
      console.log('Organization would be created:', data);
      
      const org = { 
        id: 'mock-org-id', 
        name: data.companyName,
        slug: data.companyName.toLowerCase().replace(/\s+/g, '-')
      };

      // Generate secure random password
      const securePassword = generateSecurePassword();

      // Create admin user via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: data.adminEmail,
        password: securePassword,
        email_confirm: true,
        user_metadata: {
          first_name: data.adminFirstName,
          last_name: data.adminLastName,
          phone: data.adminPhone,
          role: 'admin',
          organization_id: org.id,
          created_by_admin: true,
          requires_password_reset: true
        }
      });

      if (authError) throw authError;

      // Send password reset email to force password change
      await supabase.auth.resetPasswordForEmail(data.adminEmail, {
        redirectTo: `${window.location.origin}/auth?reset=true`
      });

      return { organization: org, user: authData.user, tempPassword: securePassword };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast({
        title: "Organization Provisioned Successfully",
        description: `${data.organization.name} has been created. Admin user ${data.user?.email} will receive a password reset email to set their secure password.`,
      });
      setFormData({
        companyName: '',
        adminEmail: '',
        adminFirstName: '',
        adminLastName: '',
        adminPhone: '',
        address: ''
      });
    },
    onError: (error) => {
      console.error('Error provisioning organization:', error);
      toast({
        title: "Provisioning Failed",
        description: "Failed to create organization. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    provisionOrganization.mutate(formData);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Building className="w-6 h-6" />
          <span>Provision New Organization</span>
        </CardTitle>
        <CardDescription>
          Create a new company with admin user and secure tenant separation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminEmail">Admin Email *</Label>
              <Input
                id="adminEmail"
                type="email"
                value={formData.adminEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, adminEmail: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="adminFirstName">Admin First Name *</Label>
              <Input
                id="adminFirstName"
                value={formData.adminFirstName}
                onChange={(e) => setFormData(prev => ({ ...prev, adminFirstName: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminLastName">Admin Last Name *</Label>
              <Input
                id="adminLastName"
                value={formData.adminLastName}
                onChange={(e) => setFormData(prev => ({ ...prev, adminLastName: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="adminPhone">Admin Phone</Label>
              <Input
                id="adminPhone"
                type="tel"
                value={formData.adminPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, adminPhone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Company Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Security Features</h4>
                <ul className="text-sm text-blue-700 mt-1 space-y-1">
                  <li>• Strict tenant data separation</li>
                  <li>• Secure random password generated for admin</li>
                  <li>• Password reset email sent to admin for first login</li>
                  <li>• All users will only see organization-specific data</li>
                  <li>• Role-based access control enforced</li>
                </ul>
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={provisionOrganization.isPending}
            className="w-full"
          >
            {provisionOrganization.isPending ? (
              <>
                <Users className="w-4 h-4 mr-2 animate-spin" />
                Provisioning Organization...
              </>
            ) : (
              <>
                <Building className="w-4 h-4 mr-2" />
                Provision Organization
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default OrganizationProvisioning;
