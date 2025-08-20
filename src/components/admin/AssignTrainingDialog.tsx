import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Driver {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

interface AssignTrainingDialogProps {
  onTrainingAssigned?: () => void;
}

const trainingTypes = [
  { value: 'driver-safety-fundamentals', label: 'Driver Safety Fundamentals' },
  { value: 'vehicle-inspection-training', label: 'Daily Vehicle Inspection Procedures' },
  { value: 'emergency-procedures', label: 'Emergency Response Procedures' },
  { value: 'legal-compliance', label: 'Legal Compliance and Documentation' },
  { value: 'passenger-assistance', label: 'Passenger Assistance Training' },
  { value: 'defensive-driving', label: 'Defensive Driving Techniques' },
  { value: 'first-aid', label: 'First Aid Training' },
  { value: 'customer-service', label: 'Customer Service Excellence' },
  { value: 'hazardous-materials', label: 'Hazardous Materials Handling' },
  { value: 'route-optimization', label: 'Route Optimization Training' }
];

export const AssignTrainingDialog: React.FC<AssignTrainingDialogProps> = ({ onTrainingAssigned }) => {
  const { user, profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [trainingType, setTrainingType] = useState('');
  const [customTrainingName, setCustomTrainingName] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [notes, setNotes] = useState('');

  // Fetch drivers for the organization
  useEffect(() => {
    if (open && profile?.organization_id) {
      fetchDrivers();
    }
  }, [open, profile?.organization_id]);

  const fetchDrivers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name')
        .eq('role', 'driver')
        .eq('organization_id', profile?.organization_id)
        .order('first_name', { ascending: true });

      if (error) {
        console.error('Error fetching drivers:', error);
        toast.error('Failed to load drivers');
        return;
      }

      setDrivers(data || []);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      toast.error('Failed to load drivers');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDriver || !trainingType || !dueDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/assign-driver-training`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.access_token}`,
        },
        body: JSON.stringify({
          driver_id: selectedDriver,
          training_type: trainingType,
          training_name: customTrainingName || trainingTypes.find(t => t.value === trainingType)?.label || trainingType,
          due_date: dueDate.toISOString(),
          notes: notes || null
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to assign training');
      }

      toast.success('Training assigned successfully!');
      setOpen(false);
      resetForm();
      onTrainingAssigned?.();
    } catch (error) {
      console.error('Error assigning training:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to assign training');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedDriver('');
    setTrainingType('');
    setCustomTrainingName('');
    setDueDate(undefined);
    setNotes('');
  };

  const getDriverDisplayName = (driver: Driver) => {
    if (driver.first_name && driver.last_name) {
      return `${driver.first_name} ${driver.last_name}`;
    }
    return driver.email;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Assign Training
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Training to Driver</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Driver Selection */}
          <div className="space-y-2">
            <Label htmlFor="driver">Driver *</Label>
            <Select value={selectedDriver} onValueChange={setSelectedDriver}>
              <SelectTrigger>
                <SelectValue placeholder="Select a driver" />
              </SelectTrigger>
              <SelectContent>
                {drivers.map((driver) => (
                  <SelectItem key={driver.id} value={driver.id}>
                    {getDriverDisplayName(driver)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Training Type */}
          <div className="space-y-2">
            <Label htmlFor="training-type">Training Type *</Label>
            <Select value={trainingType} onValueChange={setTrainingType}>
              <SelectTrigger>
                <SelectValue placeholder="Select training type" />
              </SelectTrigger>
              <SelectContent>
                {trainingTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Custom Training</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Training Name */}
          {trainingType === 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="custom-name">Custom Training Name *</Label>
              <Input
                id="custom-name"
                value={customTrainingName}
                onChange={(e) => setCustomTrainingName(e.target.value)}
                placeholder="Enter custom training name"
              />
            </div>
          )}

          {/* Due Date */}
          <div className="space-y-2">
            <Label>Due Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes or instructions..."
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Assign Training
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
