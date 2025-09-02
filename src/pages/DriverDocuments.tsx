import React from 'react';
import DriverLayout from '@/components/layout/DriverLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, Download, Calendar } from 'lucide-react';

const DriverDocuments = () => {
  return (
    <DriverLayout title="My Documents" description="View and manage your driver documents">
      <div className="container mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">My Documents</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Driving License</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant="outline" className="text-green-600 border-green-600">Valid</Badge>
              <p className="text-sm text-muted-foreground">Expires: March 15, 2026</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Medical Certificate</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant="outline" className="text-yellow-600 border-yellow-600">Expires Soon</Badge>
              <p className="text-sm text-muted-foreground">Expires: January 30, 2025</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>CPC Certificate</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant="outline" className="text-green-600 border-green-600">Valid</Badge>
              <p className="text-sm text-muted-foreground">Expires: August 12, 2027</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>DBS Check</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant="outline" className="text-green-600 border-green-600">Valid</Badge>
              <p className="text-sm text-muted-foreground">Issued: June 5, 2024</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DriverLayout>
  );
};

export default DriverDocuments;