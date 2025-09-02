import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Copy, CheckCircle, AlertTriangle, Mail, MailX } from 'lucide-react';

// Supabase configuration
const SUPABASE_URL = "https://dznbihypzmvcmradijqn.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6bmJpaHlwem12Y21yYWRpanFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5NTQ1NzQsImV4cCI6MjA3MDUzMDU3NH0.dS4mQBL0q_JhsZQF14KKB0nL2f3H--2hPoxXzitPOgo";

interface Driver {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  hire_date: string;
  termination_date: string;
  cdl_number: string;
  medical_card_expiry: string;
}

interface AddDriverFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDriverAdded?: () => void;
}

const AddDriverForm: React.FC<AddDriverFormProps> = ({ 
  open, 
  onOpenChange, 
  onDriverAdded 
}) => {
  const [formData, setFormData] = useState<Driver>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    hire_date: '',
    termination_date: '',
    cdl_number: '',
    medical_card_expiry: '',
  });

  const [createdDriverInfo, setCreatedDriverInfo] = useState<{
    email: string;
    temporaryPassword: string;
    emailSent?: boolean;
  } | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  

  const createDriverMutation = useMutation({
    mutationFn: async (driverData: Driver) => {
      console.log('Creating driver with data:', driverData);
      
      // Get the current session to ensure user is authenticated
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('You must be logged in to create drivers. Please log in and try again.');
      }
      
      console.log('Session found, calling create-driver function...');
      
      // Call the create-driver edge function
      const { data, error } = await supabase.functions.invoke('create-driver', {
        body: {
          email: driverData.email,
          firstName: driverData.first_name,
          lastName: driverData.last_name,
          phone: driverData.phone || null,
          address: driverData.address || null,
          city: driverData.city || null,
          state: driverData.state || null,
          zipCode: driverData.zip_code || null,
          hireDate: driverData.hire_date || null,
          cdlNumber: driverData.cdl_number || null,
          medicalCardExpiry: driverData.medical_card_expiry || null
        }
      });

      console.log('Edge Function response:', { data, error });

      if (error) {
        console.error('Error creating driver:', error);
        
        // If we get a generic HTTP error, try a direct fetch to get the actual error
        if (error.message && error.message.includes('non-2xx status code')) {
          console.log('Attempting direct fetch to get detailed error...');
          
          try {
            const response = await fetch(`${SUPABASE_URL}/functions/v1/create-driver`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({
                email: driverData.email,
                firstName: driverData.first_name,
                lastName: driverData.last_name,
                phone: driverData.phone || null,
                address: driverData.address || null,
                city: driverData.city || null,
                state: driverData.state || null,
                zipCode: driverData.zip_code || null,
                hireDate: driverData.hire_date || null,
                cdlNumber: driverData.cdl_number || null,
                medicalCardExpiry: driverData.medical_card_expiry || null
              })
            });

            const responseText = await response.text();
            console.log('Direct fetch response:', {
              status: response.status,
              statusText: response.statusText,
              body: responseText
            });

            if (!response.ok) {
              throw new Error(`Driver creation failed: ${response.status} ${response.statusText} - ${responseText}`);
            }
          } catch (fetchError) {
            console.error('Direct fetch also failed:', fetchError);
            throw new Error('Driver creation failed. Please check the Edge Function logs for details.');
          }
        } else {
          throw error;
        }
      }

      // Check if the response contains an error
      if (data?.error) {
        console.error('Edge Function returned error:', data.error);
        throw new Error(data.error);
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      
      // Store the driver credentials for display
      setCreatedDriverInfo({
        email: formData.email,
        temporaryPassword: data.temporaryPassword || 'Contact admin for password',
        emailSent: data.emailSent
      });

      const successMessage = data.emailSent 
        ? "Driver created successfully and welcome email sent!"
        : "Driver created successfully. Email failed - please share credentials manually.";

      toast({
        title: "Success",
        description: successMessage,
      });
      
      onDriverAdded?.();
    },
    onError: (error: any) => {
      console.error('Driver creation error:', error);
      let errorMessage = "Failed to create driver. Please try again.";
      
      // Handle specific error cases from Supabase Functions
      if (error.message) {
        errorMessage = error.message;
      } else if (error.context?.body) {
        // Handle Supabase function errors
        try {
          const errorBody = typeof error.context.body === 'string' 
            ? JSON.parse(error.context.body) 
            : error.context.body;
          errorMessage = errorBody.error || errorMessage;
        } catch (e) {
          console.error('Error parsing error body:', e);
        }
      } else if (error.details) {
        // Alternative error format
        errorMessage = error.details;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.first_name || !formData.last_name || !formData.email) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (First Name, Last Name, Email).",
        variant: "destructive",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    createDriverMutation.mutate(formData);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied",
        description: "Copied to clipboard",
      });
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const handleClose = () => {
    setCreatedDriverInfo(null);
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zip_code: '',
      hire_date: '',
      termination_date: '',
      cdl_number: '',
      medical_card_expiry: '',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="add-driver-desc">
        {!createdDriverInfo ? (
          <>
            <DialogHeader>
              <DialogTitle>Add New Driver</DialogTitle>
              <DialogDescription id="add-driver-desc">
                Fill out the form below to add a new driver to the system. Required fields are marked with *.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter last name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter street address"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Enter city"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="Enter state"
                  />
                </div>
                <div>
                  <Label htmlFor="zip_code">Zip Code</Label>
                  <Input
                    type="text"
                    id="zip_code"
                    name="zip_code"
                    value={formData.zip_code}
                    onChange={handleInputChange}
                    placeholder="Enter zip code"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hire_date">Hire Date</Label>
                  <Input
                    type="date"
                    id="hire_date"
                    name="hire_date"
                    value={formData.hire_date}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <Label htmlFor="termination_date">Termination Date (Optional)</Label>
                  <Input
                    type="date"
                    id="termination_date"
                    name="termination_date"
                    value={formData.termination_date}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cdl_number">CDL Number</Label>
                  <Input
                    type="text"
                    id="cdl_number"
                    name="cdl_number"
                    value={formData.cdl_number}
                    onChange={handleInputChange}
                    placeholder="Enter CDL number"
                  />
                </div>
                <div>
                  <Label htmlFor="medical_card_expiry">Medical Card Expiry</Label>
                  <Input
                    type="date"
                    id="medical_card_expiry"
                    name="medical_card_expiry"
                    value={formData.medical_card_expiry}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleClose}
                  disabled={createDriverMutation.isPending}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createDriverMutation.isPending}
                >
                  {createDriverMutation.isPending ? 'Creating...' : 'Create Driver'}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Driver Created Successfully
              </DialogTitle>
              <DialogDescription>
                The driver account has been created. Please share these login credentials with the new driver.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Email Status Alert */}
              <Alert className={createdDriverInfo.emailSent ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
                {createdDriverInfo.emailSent ? (
                  <Mail className="h-4 w-4 text-green-600" />
                ) : (
                  <MailX className="h-4 w-4 text-yellow-600" />
                )}
                <AlertDescription>
                  {createdDriverInfo.emailSent ? (
                    <span className="text-green-800">
                      <strong>Email Sent:</strong> Welcome email with login credentials has been sent to the driver.
                    </span>
                  ) : (
                    <span className="text-yellow-800">
                      <strong>Email Failed:</strong> Please share the credentials manually with the driver.
                    </span>
                  )}
                </AlertDescription>
              </Alert>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> The driver will be required to change their password on first login for security.
                </AlertDescription>
              </Alert>

              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Email</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input 
                      value={createdDriverInfo.email} 
                      readOnly 
                      className="bg-white"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(createdDriverInfo.email)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">Temporary Password</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input 
                      value={createdDriverInfo.temporaryPassword} 
                      readOnly 
                      className="bg-white font-mono"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(createdDriverInfo.temporaryPassword)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-600 space-y-2">
                <p><strong>Next Steps:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Share these credentials with the new driver</li>
                  <li>The driver must log in and change their password immediately</li>
                  <li>The temporary password will only work for the first login</li>
                </ul>
              </div>

              <Button onClick={handleClose} className="w-full">
                Close
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddDriverForm;
