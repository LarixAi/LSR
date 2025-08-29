import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, AlertTriangle, Info, Wifi, Bluetooth, Download, FileText, Shield, Clock } from 'lucide-react';

const DigivuPlusInstructions = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Wifi className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold">digivu+ User Instructions</h2>
        </div>
        <Badge variant="outline" className="text-blue-600 border-blue-600">
          Generation 2 Compatible
        </Badge>
      </div>

      {/* Device Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            Device Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>The digivu+ is a professional tachograph download device that supports both Generation 1 and Generation 2 Smart Tachographs with enhanced connectivity options.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <Bluetooth className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium">Bluetooth Enabled</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
              <Shield className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium">Secure Downloads</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
              <FileText className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium">Multi-Format Support</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pre-Download Setup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Pre-Download Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <h4 className="font-semibold">Charge the Device</h4>
                <p className="text-sm text-muted-foreground">Ensure your digivu+ device is fully charged before starting downloads. Red LED indicates charging, green LED indicates ready.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <h4 className="font-semibold">Update Firmware</h4>
                <p className="text-sm text-muted-foreground">Connect to your computer and check for firmware updates to ensure compatibility with the latest tachograph systems.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <h4 className="font-semibold">Prepare Company Card</h4>
                <p className="text-sm text-muted-foreground">Ensure your company card is activated and authenticated for downloads. Insert into the digivu+ when prompted.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Download Process */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-600" />
            Download Process
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Vehicle Unit Download */}
          <div>
            <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Vehicle Unit Download (VU)
            </h4>
            <div className="space-y-3 ml-7">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <h5 className="font-medium">Connect to Vehicle</h5>
                  <p className="text-sm text-muted-foreground">Insert the digivu+ connector into the tachograph download socket (usually located behind a cover on the dashboard).</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <h5 className="font-medium">Insert Company Card</h5>
                  <p className="text-sm text-muted-foreground">Insert your company card into the digivu+ device when prompted. The device will authenticate the card.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <h5 className="font-medium">Start Download</h5>
                  <p className="text-sm text-muted-foreground">Press the download button. The device will download vehicle data including driver activities, speeds, and events.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                <div>
                  <h5 className="font-medium">Wait for Completion</h5>
                  <p className="text-sm text-muted-foreground">Download typically takes 2-5 minutes. LED indicators will show progress. Do not disconnect during download.</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Driver Card Download */}
          <div>
            <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Driver Card Download
            </h4>
            <div className="space-y-3 ml-7">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <h5 className="font-medium">Insert Driver Card</h5>
                  <p className="text-sm text-muted-foreground">Insert the driver card into the digivu+ card reader slot. Ensure the card is properly seated.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <h5 className="font-medium">Select Download Type</h5>
                  <p className="text-sm text-muted-foreground">Choose full download or specific date range using the device menu. Default is last 28 days.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <h5 className="font-medium">Complete Download</h5>
                  <p className="text-sm text-muted-foreground">Driver card downloads are typically faster (30 seconds - 2 minutes). Remove card when prompted.</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bluetooth/Remote Download */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bluetooth className="w-5 h-5 text-blue-600" />
            Bluetooth & Remote Download (Generation 2)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Bluetooth and remote download features are available only with Generation 2 Smart Tachographs and compatible vehicles.
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <h5 className="font-medium">Enable Bluetooth</h5>
                <p className="text-sm text-muted-foreground">Activate Bluetooth on your digivu+ device. Ensure you are within 10 meters of the vehicle.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <h5 className="font-medium">Pair with Vehicle</h5>
                <p className="text-sm text-muted-foreground">Select the vehicle from the available Bluetooth devices. Authentication may be required.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <h5 className="font-medium">Initiate Remote Download</h5>
                <p className="text-sm text-muted-foreground">Use the remote download function. This allows downloading without physical connection to the vehicle.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Upload Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-600" />
            Uploading Data to System
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <h5 className="font-medium">Connect digivu+ to Computer</h5>
                <p className="text-sm text-muted-foreground">Use the USB cable to connect your digivu+ device to your computer. The device will appear as a removable drive.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <h5 className="font-medium">Use Upload Dialog</h5>
                <p className="text-sm text-muted-foreground">Click the "Upload Tachograph Data" button in this system. Select the files from your digivu+ device.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <h5 className="font-medium">Select Correct Settings</h5>
                <p className="text-sm text-muted-foreground">Choose "digivu+" as device type, select appropriate generation (1 or 2), and specify if it was a Bluetooth/remote download.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Important Notes & Troubleshooting
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="p-3 bg-amber-50 border-l-4 border-amber-400 rounded">
              <h5 className="font-medium text-amber-800">Legal Requirements</h5>
              <p className="text-sm text-amber-700">Vehicle unit data must be downloaded every 90 days. Driver card data must be downloaded every 28 days.</p>
            </div>
            
            <div className="p-3 bg-red-50 border-l-4 border-red-400 rounded">
              <h5 className="font-medium text-red-800">Never Disconnect During Download</h5>
              <p className="text-sm text-red-700">Interrupting a download can corrupt tachograph data and may require professional reset.</p>
            </div>
            
            <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
              <h5 className="font-medium text-blue-800">File Formats</h5>
              <p className="text-sm text-blue-700">digivu+ generates different file types: DDD (vehicle data), TGD (driver card), V1B/V2B (generation specific), ESM (event data).</p>
            </div>

            <div className="p-3 bg-green-50 border-l-4 border-green-400 rounded">
              <h5 className="font-medium text-green-800">Storage Capacity</h5>
              <p className="text-sm text-green-700">The device can store multiple downloads. Regular upload to this system ensures data backup and compliance monitoring.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support Information */}
      <Card>
        <CardHeader>
          <CardTitle>Support & Documentation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm">For additional support and detailed technical documentation:</p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Visit <a href="https://www.tachosys.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">www.tachosys.com</a> for device updates</li>
              <li>• Check your device firmware version regularly</li>
              <li>• Contact technical support for Generation 2 compatibility issues</li>
              <li>• Refer to your vehicle manufacturer for specific tachograph socket locations</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DigivuPlusInstructions;