import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils/currencyFormatter';
import { MapPin, Clock, Users, Star, MessageSquare, CreditCard } from 'lucide-react';

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

interface QuotationDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quotation: CustomerBooking | null;
}

export const QuotationDetailsDialog: React.FC<QuotationDetailsDialogProps> = ({
  open,
  onOpenChange,
  quotation,
}) => {
  if (!quotation) return null;

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

  const getPaymentStatusColor = (status: string | null) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Quotation Details</span>
            <Badge className={getStatusColor(quotation.status)}>
              {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1).replace('_', ' ')}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Service Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Service Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Service Type</label>
                    <p className="text-lg font-semibold">{quotation.service_type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Pickup Location</label>
                    <p>{quotation.pickup_location}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Dropoff Location</label>
                    <p>{quotation.dropoff_location}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Pickup Date & Time</label>
                    <p className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-gray-400" />
                      {new Date(quotation.pickup_datetime).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Passengers</label>
                    <p className="flex items-center">
                      <Users className="w-4 h-4 mr-2 text-gray-400" />
                      {quotation.passenger_count}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Created</label>
                    <p>{new Date(quotation.created_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {quotation.special_requirements && (
                <div className="mt-6">
                  <label className="text-sm font-medium text-gray-600">Special Requirements</label>
                  <p className="mt-1 p-3 bg-gray-50 rounded-md text-sm">{quotation.special_requirements}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Pricing & Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Estimated Price</label>
                    <p className="text-lg font-semibold">{formatCurrency(quotation.estimated_price)}</p>
                  </div>
                  {quotation.final_price && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Final Price</label>
                      <p className="text-lg font-semibold text-green-600">
                        {formatCurrency(quotation.final_price)}
                      </p>
                      {quotation.final_price !== quotation.estimated_price && (
                        <p className="text-sm text-gray-500">
                          Difference: {formatCurrency(quotation.final_price - quotation.estimated_price)}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Payment Status</label>
                    <div className="mt-1">
                      <Badge className={getPaymentStatusColor(quotation.payment_status)}>
                        {quotation.payment_status || 'Not Set'}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Booking ID</label>
                    <p className="font-mono text-sm">{quotation.id}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Feedback */}
          {(quotation.customer_rating || quotation.customer_feedback) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Customer Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {quotation.customer_rating && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Rating</label>
                      <div className="flex items-center mt-1">
                        {renderStars(quotation.customer_rating)}
                        <span className="ml-2 text-sm text-gray-600">
                          {quotation.customer_rating} out of 5
                        </span>
                      </div>
                    </div>
                  )}
                  {quotation.customer_feedback && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Feedback</label>
                      <p className="mt-1 p-3 bg-gray-50 rounded-md text-sm">
                        {quotation.customer_feedback}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Status Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Status Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Current Status:</span>
                  <Badge className={getStatusColor(quotation.status)}>
                    {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1).replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Payment Status:</span>
                  <Badge className={getPaymentStatusColor(quotation.payment_status)}>
                    {quotation.payment_status || 'Not Set'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};