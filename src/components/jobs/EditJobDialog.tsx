
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Edit } from 'lucide-react';
import JobForm from './JobForm';
import { useUpdateJob } from '@/hooks/useJobs';

interface EditJobDialogProps {
  job: any;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const EditJobDialog = ({ job, open, onOpenChange }: EditJobDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const updateJobMutation = useUpdateJob();
  
  const isOpen = open !== undefined ? open : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  const handleJobUpdated = () => {
    setIsOpen(false);
  };

  const handleJobSubmit = async (jobData: any) => {
    try {
      await updateJobMutation.mutateAsync({ id: job.id, ...jobData });
      handleJobUpdated();
    } catch (error) {
      console.error('Failed to update job:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Job: {job.title}</DialogTitle>
          <DialogDescription>
            Modify the details of this job
          </DialogDescription>
        </DialogHeader>
        
        <JobForm 
          onSubmit={handleJobSubmit}
          onBack={() => setIsOpen(false)}
          onJobCreated={handleJobUpdated}
          initialData={job}
          isEditing={true}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditJobDialog;
