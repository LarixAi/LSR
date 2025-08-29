import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Database, 
  Upload, 
  Folder, 
  FileText, 
  Server, 
  Shield, 
  Clock, 
  Settings, 
  CheckCircle,
  AlertTriangle,
  Info,
  ChevronRight,
  HardDrive,
  Cloud,
  Lock,
  BarChart3,
  Calendar,
  Users,
  Truck,
  Activity,
  CreditCard
} from 'lucide-react';
import TachographDataOutline from '@/components/tachograph/TachographDataOutline';
import TachographFolderManager from '@/components/tachograph/TachographFolderManager';
import TachographCardReader from '@/components/tachograph/TachographCardReader';
import AnalogTachographUpload from '@/components/tachograph/AnalogTachographUpload';
import { Button } from '@/components/ui/button';

const TachographManager = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tachograph Manager</h1>
          <p className="text-muted-foreground mt-1">
            Manage tachograph data, compliance, and file organization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            Compliance Ready
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Files</p>
                <p className="text-2xl font-bold">1,247</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Truck className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Vehicles</p>
                <p className="text-2xl font-bold">23</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Drivers</p>
                <p className="text-2xl font-bold">18</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Violations</p>
                <p className="text-2xl font-bold">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="card-reader" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Card Reader
          </TabsTrigger>
          <TabsTrigger value="folders" className="flex items-center gap-2">
            <Folder className="h-4 w-4" />
            Folders
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Compliance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <TachographDataOutline />
        </TabsContent>

        <TabsContent value="card-reader" className="space-y-4">
          <div className="space-y-6">
            {/* Card Reader Header */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Tachograph Card Reader
                </CardTitle>
                <p className="text-muted-foreground">
                  Connect to tachograph card readers to download driver and vehicle data directly from tachograph cards
                </p>
              </CardHeader>
            </Card>

            {/* Card Reader Component */}
            <TachographCardReader 
              onDataDownloaded={(cardData) => {
                // Handle data downloaded callback
                console.log('Card data downloaded:', cardData);
              }}
            />
          </div>
        </TabsContent>

        <TabsContent value="folders" className="space-y-4">
          <TachographFolderManager />
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <AnalogTachographUpload />
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Compliance Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Compliance Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-semibold text-green-800">Compliant</p>
                        <p className="text-2xl font-bold text-green-600">95%</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="font-semibold text-orange-800">Warnings</p>
                        <p className="text-2xl font-bold text-orange-600">3</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="font-semibold text-red-800">Violations</p>
                        <p className="text-2xl font-bold text-red-600">1</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Issues */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Recent Compliance Issues</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <div>
                          <p className="font-medium">Driver Card Violation</p>
                          <p className="text-sm text-muted-foreground">Vehicle-001 | Driver: John Smith</p>
                        </div>
                      </div>
                      <Badge variant="destructive">Critical</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-orange-600" />
                        <div>
                          <p className="font-medium">Rest Period Warning</p>
                          <p className="text-sm text-muted-foreground">Vehicle-003 | Driver: Mike Johnson</p>
                        </div>
                      </div>
                      <Badge variant="secondary">Warning</Badge>
                    </div>
                  </div>
                </div>

                {/* Compliance Actions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h5 className="font-medium text-blue-800">Compliance Actions</h5>
                      <ul className="text-sm text-blue-700 mt-1 space-y-1">
                        <li>• Review and address violations within 24 hours</li>
                        <li>• Maintain 3-year retention of all tachograph data</li>
                        <li>• Regular compliance audits and reporting</li>
                        <li>• Driver training on tachograph regulations</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TachographManager;