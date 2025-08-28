
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Wrench, Save, X } from 'lucide-react';
import { useCreateMechanic } from '@/hooks/useMechanics';
import { mechanicFormSchema, MechanicFormData } from './forms/mechanicFormSchema';
import MechanicForm from './forms/MechanicForm';

interface AddMechanicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddMechanicDialog = ({ open, onOpenChange }: AddMechanicDialogProps) => {
  const createMechanic = useCreateMechanic();

  const form = useForm<MechanicFormData>({
    resolver: zodResolver(mechanicFormSchema),
    defaultValues: {
      profile_id: '',
      mechanic_license_number: '',
      certification_level: '',
      hourly_rate: 0,
      specializations: '',
      is_available: true,
    },
  });

  const onSubmit = async (data: MechanicFormData) => {
    try {
      const mechanicData = {
        ...data,
        specializations: data.specializations 
          ? data.specializations.split(',').map(s => s.trim()).filter(Boolean)
          : null,
        hourly_rate: data.hourly_rate || null,
        mechanic_license_number: data.mechanic_license_number || null,
        certification_level: data.certification_level || null,
      };

      await createMechanic.mutateAsync(mechanicData);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating mechanic:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Add New Mechanic
          </DialogTitle>
          <DialogDescription>
            Add a new mechanic to your maintenance team
          </DialogDescription>
        </DialogHeader>

        <MechanicForm form={form} onSubmit={onSubmit}>
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createMechanic.isPending}
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={createMechanic.isPending}>
              <Save className="w-4 h-4 mr-2" />
              {createMechanic.isPending ? 'Creating...' : 'Create Mechanic'}
            </Button>
          </div>
        </MechanicForm>
      </DialogContent>
    </Dialog>
  );
};

export default AddMechanicDialog;
