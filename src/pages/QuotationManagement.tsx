import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency } from '@/utils/currencyFormatter';
import { FileText, Search, Eye, DollarSign, Calendar, Clock, MapPin } from 'lucide-react';
import { QuotationDetailsDialog } from '@/components/admin/QuotationDetailsDialog';

interface CustomerBooking {
  id: string;
  service_type: string;
  pickup_location: string;
  dropoff_location: string;
  pickup_datetime: string;
  passenger_count: number;
  estimated_price: number;
  final_price: number | null;
  special_requirements: string | null;
  status: string;
  payment_status: string | null;
  customer_feedback: string | null;
  customer_rating: number | null;
  created_at: string;
}

const QuotationManagement = () => {
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedQuotation, setSelectedQuotation] = useState<CustomerBooking | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const { data: quotations, isLoading } = useQuery({
    queryKey: ['quotations', profile?.organization_id, statusFilter],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      // Mock customer bookings (table doesn't exist yet)
      const data: any[] = [];
      return data;

      // This is already handled above with mock data
    },
    enabled: !!profile?.organization_id,
  });

  const filteredQuotations = quotations?.filter(quotation =>
    quotation.pickup_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quotation.dropoff_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quotation.service_type.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const totalQuotationValue = filteredQuotations.reduce((sum, quotation) => 
    sum + (quotation.final_price || quotation.estimated_price), 0
  );
  const confirmedQuotations = filteredQuotations.filter(q => q.status === 'confirmed');
  const pendingQuotations = filteredQuotations.filter(q => q.status === 'pending');
  const completedQuotations = filteredQuotations.filter(q => q.status === 'completed');

  const handleViewQuotation = (quotation: CustomerBooking) => {
    setSelectedQuotation(quotation);
    setShowDetailsDialog(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quotation Management</h1>
          <p className="text-gray-600">View and manage customer booking quotations</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold">{formatCurrency(totalQuotationValue)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-blue-600">{confirmedQuotations.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingQuotations.length}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedQuotations.length}</p>
              </div>
              <FileText className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by location or service type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Quotations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Quotations</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading quotations...</div>
          ) : filteredQuotations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No quotations found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service Type</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Passengers</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuotations.map((quotation) => (
                    <TableRow key={quotation.id}>
                      <TableCell className="font-medium">{quotation.service_type}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2 text-sm">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="truncate max-w-[200px]" title={`${quotation.pickup_location} → ${quotation.dropoff_location}`}>
                            {quotation.pickup_location} → {quotation.dropoff_location}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(quotation.pickup_datetime).toLocaleString()}
                      </TableCell>
                      <TableCell>{quotation.passenger_count}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {formatCurrency(quotation.final_price || quotation.estimated_price)}
                          </div>
                          {quotation.final_price && quotation.final_price !== quotation.estimated_price && (
                            <div className="text-sm text-gray-500">
                              Est: {formatCurrency(quotation.estimated_price)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(quotation.status)}>
                          {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1).replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewQuotation(quotation)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <QuotationDetailsDialog
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        quotation={selectedQuotation}
      />
    </div>
  );
};

export default QuotationManagement;