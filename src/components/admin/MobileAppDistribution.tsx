import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Smartphone, 
  Send, 
  Copy, 
  QrCode, 
  ExternalLink,
  Users,
  Mail,
  MessageSquare,
  CheckCircle,
  Download
} from 'lucide-react';
import { toast } from 'sonner';

export default function MobileAppDistribution() {
  const [selectedDrivers, setSelectedDrivers] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Mock driver data - replace with real data from your backend
  const drivers = [
    { id: '1', name: 'John Smith', email: 'john.smith@company.com', phone: '+44 7700 900123', status: 'active' },
    { id: '2', name: 'Sarah Johnson', email: 'sarah.johnson@company.com', phone: '+44 7700 900124', status: 'active' },
    { id: '3', name: 'Mike Wilson', email: 'mike.wilson@company.com', phone: '+44 7700 900125', status: 'active' },
    { id: '4', name: 'Emma Davis', email: 'emma.davis@company.com', phone: '+44 7700 900126', status: 'inactive' },
  ];

  const appDownloadLinks = {
    ios: 'https://apps.apple.com/app/vehicle-check-app',
    android: 'https://play.google.com/store/apps/details?id=com.vehiclecheck.app',
    web: 'https://yourdomain.com/driver-app-download'
  };

  const defaultMessage = `Hi [Driver Name],

We're excited to announce that our new Vehicle Check App is now available for download!

📱 Download the app:
• iOS: ${appDownloadLinks.ios}
• Android: ${appDownloadLinks.android}
• Web: ${appDownloadLinks.web}

🔑 Your login details:
• Driver ID: [DRIVER_ID]
• Organization Code: [ORG_CODE]

The app includes:
✅ 56 comprehensive safety questions
✅ Photo documentation
✅ Real-time sync with management
✅ Offline capability
✅ GPS location tracking

Please download the app and start using it for your daily vehicle checks. If you need any help, please contact support.

Best regards,
[Your Name]
Transport Manager`;

  const handleSelectDriver = (driverId: string) => {
    setSelectedDrivers(prev => 
      prev.includes(driverId) 
        ? prev.filter(id => id !== driverId)
        : [...prev, driverId]
    );
  };

  const handleSelectAll = () => {
    const activeDriverIds = drivers.filter(d => d.status === 'active').map(d => d.id);
    setSelectedDrivers(activeDriverIds);
  };

  const handleDeselectAll = () => {
    setSelectedDrivers([]);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const sendAppLinks = async () => {
    if (selectedDrivers.length === 0) {
      toast.error('Please select at least one driver');
      return;
    }

    setIsSending(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(`App download links sent to ${selectedDrivers.length} driver(s)!`);
      setSelectedDrivers([]);
      setMessage('');
    } catch (error) {
      toast.error('Failed to send app links');
    } finally {
      setIsSending(false);
    }
  };

  const generateQRCode = () => {
    // This would generate a QR code for the download page
    toast.info('QR code generation feature coming soon!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mobile App Distribution</h1>
          <p className="text-gray-600">Send app download links to your drivers</p>
        </div>
        <Badge variant="outline" className="text-blue-600 border-blue-600">
          <Smartphone className="w-3 h-3 mr-1" />
          App Version 2.1
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Driver Selection */}
        <div className="space-y-6">
          {/* Driver List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Select Drivers</span>
                </span>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={handleSelectAll}>
                    Select All Active
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDeselectAll}>
                    Clear All
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {drivers.map((driver) => (
                  <div
                    key={driver.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedDrivers.includes(driver.id)
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => handleSelectDriver(driver.id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedDrivers.includes(driver.id)}
                      onChange={() => handleSelectDriver(driver.id)}
                      className="rounded"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{driver.name}</span>
                        <Badge 
                          variant={driver.status === 'active' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {driver.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        {driver.email} • {driver.phone}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Download Links */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Download className="w-5 h-5" />
                <span>Download Links</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>iOS App Store</Label>
                <div className="flex space-x-2 mt-1">
                  <Input value={appDownloadLinks.ios} readOnly />
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(appDownloadLinks.ios)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => window.open(appDownloadLinks.ios, '_blank')}>
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div>
                <Label>Google Play Store</Label>
                <div className="flex space-x-2 mt-1">
                  <Input value={appDownloadLinks.android} readOnly />
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(appDownloadLinks.android)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => window.open(appDownloadLinks.android, '_blank')}>
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div>
                <Label>Web Download Page</Label>
                <div className="flex space-x-2 mt-1">
                  <Input value={appDownloadLinks.web} readOnly />
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(appDownloadLinks.web)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => window.open(appDownloadLinks.web, '_blank')}>
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={generateQRCode} className="w-full">
                  <QrCode className="w-4 h-4 mr-2" />
                  Generate QR Code
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Message & Send */}
        <div className="space-y-6">
          {/* Message Editor */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5" />
                <span>Message Template</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="message">Customize your message</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={defaultMessage}
                    rows={12}
                    className="mt-1"
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setMessage(defaultMessage)}
                  >
                    Use Default Template
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setMessage('')}
                  >
                    Clear Message
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Send Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Send className="w-5 h-5" />
                <span>Send Options</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="send-email" defaultChecked />
                  <Label htmlFor="send-email" className="flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>Send via Email</span>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="send-sms" />
                  <Label htmlFor="send-sms" className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>Send via SMS</span>
                  </Label>
                </div>

                <div className="pt-4">
                  <Button 
                    onClick={sendAppLinks}
                    disabled={selectedDrivers.length === 0 || isSending}
                    className="w-full"
                    size="lg"
                  >
                    {isSending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send to {selectedDrivers.length} Driver{selectedDrivers.length !== 1 ? 's' : ''}
                      </>
                    )}
                  </Button>
                </div>

                {selectedDrivers.length > 0 && (
                  <div className="text-sm text-gray-600 text-center">
                    Selected: {selectedDrivers.length} driver{selectedDrivers.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Download Page
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Check App Status
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Driver App Usage Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


