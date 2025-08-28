
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Bell, Clock, Mail } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

interface LicenseNotificationsProps {
  licenses: any[];
}

const LicenseNotifications: React.FC<LicenseNotificationsProps> = ({ licenses }) => {
  const getExpiringLicenses = () => {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    return licenses.filter(license => {
      const expiryDate = new Date(license.expiry_date);
      return expiryDate <= thirtyDaysFromNow && license.status === 'active';
    }).sort((a, b) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime());
  };

  const expiringLicenses = getExpiringLicenses();

  const getDaysUntilExpiry = (expiryDate: string) => {
    return differenceInDays(new Date(expiryDate), new Date());
  };

  const getUrgencyLevel = (daysUntilExpiry: number) => {
    if (daysUntilExpiry < 0) return { level: 'expired', color: 'bg-red-500' };
    if (daysUntilExpiry <= 7) return { level: 'critical', color: 'bg-red-500' };
    if (daysUntilExpiry <= 14) return { level: 'high', color: 'bg-orange-500' };
    return { level: 'medium', color: 'bg-yellow-500' };
  };

  if (expiringLicenses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-green-600" />
            <span>License Notifications</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">All licenses are current</h3>
            <p className="text-gray-600">No licenses are expiring in the next 30 days.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <span>License Expiry Alerts</span>
            <Badge variant="destructive">{expiringLicenses.length}</Badge>
          </div>
          <Button variant="outline" size="sm">
            <Mail className="w-4 h-4 mr-2" />
            Send Reminders
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {expiringLicenses.map((license) => {
            const daysUntilExpiry = getDaysUntilExpiry(license.expiry_date);
            const urgency = getUrgencyLevel(daysUntilExpiry);
            
            return (
              <div key={license.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${urgency.color}`}></div>
                  <div>
                    <p className="font-medium">
                      {license.profiles ? `${license.profiles.first_name} ${license.profiles.last_name}` : 'Unknown Driver'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {license.license_type} - {license.license_number}
                    </p>
                    <p className="text-xs text-gray-500">
                      Expires: {format(new Date(license.expiry_date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge 
                    variant={daysUntilExpiry < 0 ? 'destructive' : 'secondary'}
                    className="mb-2"
                  >
                    {daysUntilExpiry < 0 
                      ? `Expired ${Math.abs(daysUntilExpiry)} days ago`
                      : `${daysUntilExpiry} days left`
                    }
                  </Badge>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      Notify Driver
                    </Button>
                    <Button variant="outline" size="sm">
                      Schedule Renewal
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default LicenseNotifications;
