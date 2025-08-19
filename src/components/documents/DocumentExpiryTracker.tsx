
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Calendar, Bell, FileText } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

interface Document {
  id: string;
  name: string;
  category: string;
  expiry_date?: string;
  status?: string;
}

interface DocumentExpiryTrackerProps {
  documents: Document[];
}

const DocumentExpiryTracker = ({ documents }: DocumentExpiryTrackerProps) => {
  const today = new Date();
  
  // Filter documents that have expiry dates
  const documentsWithExpiry = documents.filter(doc => doc.expiry_date);
  
  // Categorize by expiry status
  const expiredDocs = documentsWithExpiry.filter(doc => {
    const expiryDate = new Date(doc.expiry_date!);
    return expiryDate < today;
  });

  const expiringSoonDocs = documentsWithExpiry.filter(doc => {
    const expiryDate = new Date(doc.expiry_date!);
    const daysUntilExpiry = differenceInDays(expiryDate, today);
    return daysUntilExpiry >= 0 && daysUntilExpiry <= 30;
  });

  const criticalDocs = documentsWithExpiry.filter(doc => {
    const expiryDate = new Date(doc.expiry_date!);
    const daysUntilExpiry = differenceInDays(expiryDate, today);
    return daysUntilExpiry >= 0 && daysUntilExpiry <= 7;
  });

  const getExpiryBadgeColor = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = differenceInDays(expiry, today);
    
    if (daysUntilExpiry < 0) return 'bg-red-100 text-red-800';
    if (daysUntilExpiry <= 7) return 'bg-orange-100 text-orange-800';
    if (daysUntilExpiry <= 30) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getExpiryStatus = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = differenceInDays(expiry, today);
    
    if (daysUntilExpiry < 0) return `Expired ${Math.abs(daysUntilExpiry)} days ago`;
    if (daysUntilExpiry === 0) return 'Expires today';
    if (daysUntilExpiry <= 7) return `Expires in ${daysUntilExpiry} days`;
    if (daysUntilExpiry <= 30) return `Expires in ${daysUntilExpiry} days`;
    return 'Valid';
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expired</p>
                <p className="text-2xl font-bold text-red-600">{expiredDocs.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical (≤7 days)</p>
                <p className="text-2xl font-bold text-orange-600">{criticalDocs.length}</p>
              </div>
              <Bell className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expiring Soon (≤30 days)</p>
                <p className="text-2xl font-bold text-yellow-600">{expiringSoonDocs.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expiring Documents List */}
      {expiringSoonDocs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <span>Documents Requiring Attention</span>
            </CardTitle>
            <CardDescription>
              Documents expiring within the next 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expiringSoonDocs.slice(0, 5).map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-sm text-gray-600">{doc.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {format(new Date(doc.expiry_date!), 'MMM dd, yyyy')}
                      </p>
                      <Badge className={getExpiryBadgeColor(doc.expiry_date!)}>
                        {getExpiryStatus(doc.expiry_date!)}
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm">
                      Renew
                    </Button>
                  </div>
                </div>
              ))}
              {expiringSoonDocs.length > 5 && (
                <div className="text-center pt-4">
                  <Button variant="outline">
                    View All {expiringSoonDocs.length} Expiring Documents
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DocumentExpiryTracker;
