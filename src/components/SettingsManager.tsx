import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Download, 
  Upload, 
  Trash2, 
  HardDrive, 
  Database, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  Info,
  Settings,
  Shield,
  Archive
} from 'lucide-react';
import { storageManager } from '@/utils/localStorage';
import { toast } from 'sonner';

interface StorageInfo {
  used: number;
  available: number;
  total: number;
}

const SettingsManager: React.FC = () => {
  const [storageInfo, setStorageInfo] = useState<StorageInfo>({ used: 0, available: 0, total: 0 });
  const [exportData, setExportData] = useState<string>('');
  const [importData, setImportData] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Get storage info on mount
  React.useEffect(() => {
    updateStorageInfo();
  }, []);

  const updateStorageInfo = () => {
    const info = storageManager.getStorageInfo();
    setStorageInfo(info);
  };

  const handleExportSettings = async () => {
    setIsExporting(true);
    try {
      const data = storageManager.exportSettings();
      setExportData(data);
      toast.success('Settings exported successfully');
    } catch (error) {
      toast.error('Failed to export settings');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportSettings = async () => {
    if (!importData.trim()) {
      toast.error('Please enter settings data to import');
      return;
    }

    setIsImporting(true);
    try {
      const success = storageManager.importSettings(importData);
      if (success) {
        toast.success('Settings imported successfully. Page will reload.');
        setImportData('');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        toast.error('Failed to import settings');
      }
    } catch (error) {
      toast.error('Invalid settings data format');
    } finally {
      setIsImporting(false);
    }
  };

  const handleClearAllData = () => {
    if (confirm('Are you sure you want to clear ALL app data? This action cannot be undone.')) {
      storageManager.clearAll();
      updateStorageInfo();
      toast.success('All data cleared successfully');
    }
  };

  const handleClearCache = () => {
    if (confirm('Are you sure you want to clear the cache? This will remove temporary data but keep your settings.')) {
      storageManager.clearCache();
      updateStorageInfo();
      toast.success('Cache cleared successfully');
    }
  };

  const handleSyncWithServer = async () => {
    try {
      const success = await storageManager.syncWithServer();
      if (success) {
        toast.success('Server sync completed');
      } else {
        toast.error('Server sync failed');
      }
    } catch (error) {
      toast.error('Server sync error');
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStoragePercentage = () => {
    return (storageInfo.used / storageInfo.total) * 100;
  };

  const getStorageStatus = () => {
    const percentage = getStoragePercentage();
    if (percentage > 90) return { status: 'critical', color: 'text-red-500', icon: AlertTriangle };
    if (percentage > 75) return { status: 'warning', color: 'text-yellow-500', icon: AlertTriangle };
    return { status: 'healthy', color: 'text-green-500', icon: CheckCircle };
  };

  const storageStatus = getStorageStatus();
  const StatusIcon = storageStatus.icon;

  return (
    <div className="space-y-6">
      {/* Storage Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Storage Overview
          </CardTitle>
          <CardDescription>
            Monitor your app's local storage usage and manage data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Storage Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StatusIcon className={`h-5 w-5 ${storageStatus.color}`} />
              <span className="font-medium">Storage Status: {storageStatus.status}</span>
            </div>
            <Button variant="outline" size="sm" onClick={updateStorageInfo}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Storage Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Used: {formatBytes(storageInfo.used)}</span>
              <span>Available: {formatBytes(storageInfo.available)}</span>
            </div>
            <Progress value={getStoragePercentage()} className="h-2" />
            <div className="text-xs text-muted-foreground text-center">
              {formatBytes(storageInfo.total)} total capacity
            </div>
          </div>

          {/* Storage Actions */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleClearCache}>
              <Archive className="h-4 w-4 mr-2" />
              Clear Cache
            </Button>
            <Button variant="outline" size="sm" onClick={handleSyncWithServer}>
              <Database className="h-4 w-4 mr-2" />
              Sync Server
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Management
          </CardTitle>
          <CardDescription>
            Export, import, and manage your app settings and data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Export Settings */}
          <div className="space-y-2">
            <Label>Export Settings</Label>
            <div className="flex gap-2">
              <Button 
                onClick={handleExportSettings} 
                disabled={isExporting}
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Export All Settings'}
              </Button>
            </div>
            {exportData && (
              <div className="space-y-2">
                <Label>Exported Data (Copy this to save your settings)</Label>
                <Textarea
                  value={exportData}
                  readOnly
                  rows={6}
                  className="font-mono text-xs"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(exportData)}
                >
                  Copy to Clipboard
                </Button>
              </div>
            )}
          </div>

          <Separator />

          {/* Import Settings */}
          <div className="space-y-2">
            <Label>Import Settings</Label>
            <Textarea
              placeholder="Paste your exported settings data here..."
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              rows={4}
              className="font-mono text-xs"
            />
            <div className="flex gap-2">
              <Button 
                onClick={handleImportSettings} 
                disabled={isImporting || !importData.trim()}
                className="flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                {isImporting ? 'Importing...' : 'Import Settings'}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Advanced Options */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Advanced Options</Label>
              <Switch
                checked={showAdvanced}
                onCheckedChange={setShowAdvanced}
              />
            </div>
            
            {showAdvanced && (
              <div className="space-y-2 pt-2">
                <Button
                  variant="destructive"
                  onClick={handleClearAllData}
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All Data
                </Button>
                <p className="text-xs text-muted-foreground">
                  This will remove all app data including settings, preferences, and cached information.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Storage Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Storage Details
          </CardTitle>
          <CardDescription>
            Detailed information about your app's storage usage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Storage Keys</Label>
              <div className="text-sm text-muted-foreground">
                {storageManager.getAllKeys().length} active storage keys
              </div>
              <div className="max-h-32 overflow-y-auto">
                {storageManager.getAllKeys().map((key) => (
                  <Badge key={key} variant="secondary" className="mr-1 mb-1">
                    {key}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Storage Information</Label>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Used Space:</span>
                  <span className="font-mono">{formatBytes(storageInfo.used)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Free Space:</span>
                  <span className="font-mono">{formatBytes(storageInfo.available)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Capacity:</span>
                  <span className="font-mono">{formatBytes(storageInfo.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Usage:</span>
                  <span className="font-mono">{getStoragePercentage().toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            About Local Storage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Your app uses local storage to save your preferences, settings, and temporary data. 
            This data is stored on your device and persists between app sessions.
          </p>
          <p>
            <strong>Security:</strong> Local storage is isolated to your browser/device and cannot be 
            accessed by other websites or applications.
          </p>
          <p>
            <strong>Limits:</strong> Most browsers provide 5-10MB of local storage space. 
            The app automatically manages this space and cleans up expired data.
          </p>
          <p>
            <strong>Backup:</strong> Use the export feature to create backups of your settings 
            that you can restore later or transfer to another device.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsManager;
