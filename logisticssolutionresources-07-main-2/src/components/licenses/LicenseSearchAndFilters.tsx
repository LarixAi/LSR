
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter, X } from 'lucide-react';

interface LicenseSearchAndFiltersProps {
  onSearch: (filters: LicenseFilters) => void;
  onClear: () => void;
}

export interface LicenseFilters {
  searchTerm: string;
  licenseType: string;
  status: string;
  expiryRange: string;
}

const LicenseSearchAndFilters: React.FC<LicenseSearchAndFiltersProps> = ({
  onSearch,
  onClear
}) => {
  const [filters, setFilters] = useState<LicenseFilters>({
    searchTerm: '',
    licenseType: '',
    status: '',
    expiryRange: ''
  });

  const handleFilterChange = (key: keyof LicenseFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onSearch(newFilters);
  };

  const handleClear = () => {
    const clearedFilters = {
      searchTerm: '',
      licenseType: '',
      status: '',
      expiryRange: ''
    };
    setFilters(clearedFilters);
    onClear();
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by driver name, license number..."
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={handleClear}
              className="sm:w-auto w-full"
            >
              <X className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              value={filters.licenseType || "all-types"}
              onValueChange={(value) => handleFilterChange('licenseType', value === "all-types" ? "" : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="License Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-types">All Types</SelectItem>
                <SelectItem value="CDL Class A">CDL Class A</SelectItem>
                <SelectItem value="CDL Class B">CDL Class B</SelectItem>
                <SelectItem value="CDL Class C">CDL Class C</SelectItem>
                <SelectItem value="Regular">Regular</SelectItem>
                <SelectItem value="Motorcycle">Motorcycle</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.status || "all-statuses"}
              onValueChange={(value) => handleFilterChange('status', value === "all-statuses" ? "" : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="License Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-statuses">All Statuses</SelectItem>
                <SelectItem value="valid">Valid</SelectItem>
                <SelectItem value="expiring">Expiring Soon</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.expiryRange || "all-dates"}
              onValueChange={(value) => handleFilterChange('expiryRange', value === "all-dates" ? "" : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Expiry Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-dates">All Dates</SelectItem>
                <SelectItem value="30">Next 30 days</SelectItem>
                <SelectItem value="60">Next 60 days</SelectItem>
                <SelectItem value="90">Next 90 days</SelectItem>
                <SelectItem value="expired">Already Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LicenseSearchAndFilters;
