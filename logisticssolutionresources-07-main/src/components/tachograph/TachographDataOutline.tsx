import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Database, 
  Upload, 
  Folder, 
  FolderPlus, 
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
  Lock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TachographDataOutlineProps {
  onCreateFolder?: (folderName: string, parentFolder?: string) => void;
}

const TachographDataOutline = ({ onCreateFolder }: TachographDataOutlineProps) => {
  const [newFolderName, setNewFolderName] = useState('');
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) {
      toast({
        title: "Invalid Folder Name",
        description: "Please enter a valid folder name.",
        variant: "destructive"
      });
      return;
    }

    onCreateFolder?.(newFolderName.trim());
    setNewFolderName('');
    setFolderDialogOpen(false);
    
    toast({
      title: "Folder Created",
      description: `Folder "${newFolderName}" has been created successfully.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Data Storage Architecture */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Tachograph Data Storage Architecture
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Server className="h-4 w-4" />
                Database Structure
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <ChevronRight className="h-3 w-3" />
                  <code className="bg-muted px-2 py-1 rounded">tachograph_records</code>
                  <Badge variant="outline">Primary Table</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <ChevronRight className="h-3 w-3" />
                  <code className="bg-muted px-2 py-1 rounded">tachograph_issues</code>
                  <Badge variant="outline">Compliance</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <ChevronRight className="h-3 w-3" />
                  <code className="bg-muted px-2 py-1 rounded">tachograph_folders</code>
                  <Badge variant="outline">Organization</Badge>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <HardDrive className="h-4 w-4" />
                File Storage
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <ChevronRight className="h-3 w-3" />
                  <span>Supabase Storage Bucket</span>
                  <Badge variant="outline">Secure</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <ChevronRight className="h-3 w-3" />
                  <span>Encrypted File Data</span>
                  <Badge variant="outline">GDPR</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <ChevronRight className="h-3 w-3" />
                  <span>Metadata Indexing</span>
                  <Badge variant="outline">Searchable</Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h5 className="font-medium text-blue-800">Data Organization</h5>
                <p className="text-sm text-blue-700 mt-1">
                  Tachograph data is organized by organization, vehicle, driver, and date. Each file is stored with complete metadata for compliance tracking and analysis.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Process */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Process Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-semibold">1. File Selection</h4>
                <p className="text-sm text-muted-foreground">
                  Select .ddd, .tgd, .c1b, .v1b, .v2b, or .esm files from your tachograph device
                </p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Settings className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-semibold">2. Metadata Input</h4>
                <p className="text-sm text-muted-foreground">
                  Specify vehicle, driver, time period, and download method information
                </p>
              </div>
              
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="font-semibold">3. Analysis & Storage</h4>
                <p className="text-sm text-muted-foreground">
                  Automatic compliance analysis, violation detection, and secure storage
                </p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h5 className="font-medium text-amber-800">Supported File Types</h5>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    <Badge variant="outline" className="justify-center">.ddd (Vehicle Unit)</Badge>
                    <Badge variant="outline" className="justify-center">.tgd (Driver Card)</Badge>
                    <Badge variant="outline" className="justify-center">.c1b (Card Data)</Badge>
                    <Badge variant="outline" className="justify-center">.v1b (Gen 1 Vehicle)</Badge>
                    <Badge variant="outline" className="justify-center">.v2b (Gen 2 Vehicle)</Badge>
                    <Badge variant="outline" className="justify-center">.esm (Event Data)</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Folder Management */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            Folder Organization System
          </CardTitle>
          <Dialog open={folderDialogOpen} onOpenChange={setFolderDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <FolderPlus className="h-4 w-4 mr-2" />
                Create Folder
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="folderName">Folder Name</Label>
                  <Input
                    id="folderName"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Enter folder name..."
                    className="mt-1"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setFolderDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateFolder}>
                    Create Folder
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-semibold">Recommended Folder Structure</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Folder className="h-4 w-4 text-blue-600" />
                    <span>By Year (2024, 2023, 2022)</span>
                  </div>
                  <div className="flex items-center gap-2 ml-6">
                    <Folder className="h-4 w-4 text-green-600" />
                    <span>By Quarter (Q1, Q2, Q3, Q4)</span>
                  </div>
                  <div className="flex items-center gap-2 ml-12">
                    <Folder className="h-4 w-4 text-purple-600" />
                    <span>By Vehicle (Vehicle-001, Vehicle-002)</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold">Alternative Structure</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Folder className="h-4 w-4 text-orange-600" />
                    <span>By Vehicle Type (HGV, PSV, Light)</span>
                  </div>
                  <div className="flex items-center gap-2 ml-6">
                    <Folder className="h-4 w-4 text-red-600" />
                    <span>By Driver (Active, Archived)</span>
                  </div>
                  <div className="flex items-center gap-2 ml-12">
                    <Folder className="h-4 w-4 text-indigo-600" />
                    <span>By Compliance Status</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h5 className="font-medium text-green-800">Folder Benefits</h5>
                  <ul className="text-sm text-green-700 mt-1 space-y-1">
                    <li>• Organize files by date, vehicle, or compliance status</li>
                    <li>• Quick access to specific data sets for audits</li>
                    <li>• Improved search and filtering capabilities</li>
                    <li>• Better compliance tracking and reporting</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security & Compliance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security & Compliance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Data Security
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>End-to-end encryption</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>Role-based access control</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>Audit trail logging</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>GDPR compliant storage</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Retention Policy
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-blue-600" />
                  <span>3 years minimum retention</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-blue-600" />
                  <span>Automatic backup creation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-blue-600" />
                  <span>Compliance monitoring</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-blue-600" />
                  <span>Regulatory reporting ready</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TachographDataOutline;