
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';

interface JobFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  canCreateJob: boolean;
  onCreateJob?: () => void;
}

const JobFilters = ({ searchTerm, onSearchChange, canCreateJob, onCreateJob }: JobFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search jobs..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      {canCreateJob && (
        <Button onClick={onCreateJob}>
          <Plus className="w-4 h-4 mr-2" />
          Create Job
        </Button>
      )}
    </div>
  );
};

export default JobFilters;
