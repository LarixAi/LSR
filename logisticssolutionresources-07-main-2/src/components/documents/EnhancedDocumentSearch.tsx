
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, Download, Upload, Plus, RefreshCw } from 'lucide-react';

interface EnhancedDocumentSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  dateRange: string;
  onDateRangeChange: (value: string) => void;
  onUploadClick: () => void;
  onExportClick: () => void;
  onRefresh: () => void;
  showNewCategory?: boolean;
  onNewCategoryClick?: () => void;
}

const EnhancedDocumentSearch = ({ 
  searchTerm, 
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  dateRange,
  onDateRangeChange,
  onUploadClick,
  onExportClick,
  onRefresh,
  showNewCategory = false,
  onNewCategoryClick 
}: EnhancedDocumentSearchProps) => {
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'valid', label: 'Valid' },
    { value: 'expiring_soon', label: 'Expiring Soon' },
    { value: 'expired', label: 'Expired' },
    { value: 'pending_approval', label: 'Pending Approval' },
    { value: 'rejected', label: 'Rejected' }
  ];

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'Driver Documents', label: 'Driver Documents' },
    { value: 'Vehicle Documents', label: 'Vehicle Documents' },
    { value: 'Compliance', label: 'Compliance' },
    { value: 'Safety Documents', label: 'Safety Documents' },
    { value: 'Route Documents', label: 'Route Documents' },
    { value: 'General', label: 'General' }
  ];

  const dateRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' }
  ];

  return (
    <div className="space-y-4">
      {/* Primary Search Bar */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search documents by name, category, or content..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-4"
          />
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex items-center space-x-2"
            onClick={onUploadClick}
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Upload</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex items-center space-x-2"
            onClick={onExportClick}
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>

          {showNewCategory && onNewCategoryClick && (
            <Button 
              className="flex items-center space-x-2" 
              onClick={onNewCategoryClick}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Folder</span>
            </Button>
          )}
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={onRefresh}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="flex flex-col md:flex-row gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filters:</span>
        </div>
        
        <div className="flex flex-wrap gap-3 flex-1">
          <div className="min-w-[150px]">
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="min-w-[150px]">
            <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="min-w-[150px]">
            <Select value={dateRange} onValueChange={onDateRangeChange}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                {dateRangeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {(statusFilter !== 'all' || categoryFilter !== 'all' || dateRange !== 'all') && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              onStatusFilterChange('all');
              onCategoryFilterChange('all');
              onDateRangeChange('all');
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
};

export default EnhancedDocumentSearch;
