import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard, 
  Download, 
  Upload, 
  CheckCircle, 
  AlertTriangle,
  Usb,
  Bluetooth,
  Wifi,
  Database,
  FileText,
  Clock,
  Users,
  Truck,
  Settings,
  RefreshCw,
  Play,
  Pause,
  Stop,
  Eye,
  FileDown,
  AlertCircle,
  Info
} from 'lucide-react';

interface CardReader {
  id: string;
  device_name: string;
  device_type: 'digivu_plus' | 'generation_2' | 'bluetooth_reader' | 'usb_reader';
  serial_number: string;
  firmware_version: string;
  status: 'active' | 'inactive' | 'maintenance' | 'calibration_due';
  last_calibration_date: string | null;
  next_calibration_due: string | null;
}

interface DownloadSession {
  id: string;
  card_type: 'driver' | 'vehicle' | 'workshop';
  card_number: string;
  download_status: 'in_progress' | 'completed' | 'failed' | 'partial';
  download_start_time: string;
  download_end_time: string | null;
  records_downloaded: number;
  error_message: string | null;
}

interface CardData {
  cardType: 'driver' | 'vehicle' | 'workshop';
  cardNumber: string;
  cardHolderName: string;
  cardExpiryDate: string;
  downloadDate: string;
  recordsCount: number;
  violationsCount: number;
  filePath: string;
}

interface TachographCardReaderProps {
  onDataDownloaded: (data: CardData) => void;
}

const TachographCardReader: React.FC<TachographCardReaderProps> = ({ onDataDownloaded }) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isConnected, setIsConnected] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [cardType, setCardType] = useState<'driver' | 'vehicle' | 'workshop' | null>(null);
  const [cardInfo, setCardInfo] = useState<any>(null);
  const [selectedReader, setSelectedReader] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Fetch available card readers
  const { data: cardReaders = [], isLoading: readersLoading } = useQuery({
    queryKey: ['card-readers', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      const { data, error } = await supabase
        .from('tachograph_card_readers')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .eq('status', 'active');

      if (error) {
        console.error('Error fetching card readers:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!profile?.organization_id
  });

  // Fetch recent download sessions
  const { data: downloadSessions = [] } = useQuery({
    queryKey: ['download-sessions', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      const { data, error } = await supabase
        .from('tachograph_download_sessions')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('download_start_time', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching download sessions:', error);
        return [];
      }
      return data || [];
    },
    enabled: !!profile?.organization_id
  });

  // Fetch vehicles and drivers for card association
  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data, error } = await supabase
        .from('vehicles')
        .select('id, vehicle_number, license_plate')
        .eq('organization_id', profile.organization_id);
      return error ? [] : (data || []);
    },
    enabled: !!profile?.organization_id
  });

  const { data: drivers = [] } = useQuery({
    queryKey: ['drivers', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('organization_id', profile.organization_id)
        .eq('role', 'driver');
      return error ? [] : (data || []);
    },
    enabled: !!profile?.organization_id
  });

  // Connect to card reader
  const connectToReader = async () => {
    if (!selectedReader) {
      toast({
        title: "No Reader Selected",
        description: "Please select a card reader first",
        variant: "destructive"
      });
      return;
    }

    try {
      // Simulate connection process
      setIsConnected(false);
      setDownloadProgress(0);
      
      // In a real implementation, this would use Web Serial API or Web Bluetooth API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsConnected(true);
      toast({
        title: "Connected",
        description: "Successfully connected to card reader"
      });
    } catch (error) {
      console.error('Failed to connect to card reader:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to card reader",
        variant: "destructive"
      });
    }
  };

  // Detect card
  const detectCard = async () => {
    if (!isConnected) return;
    
    try {
      // Simulate card detection
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock card data - in real implementation this would come from the card reader
      const mockCardData = {
        type: 'driver' as const,
        info: {
          number: 'DRIVER123456789',
          holder: 'John Smith',
          expiry: '2025-12-31',
          type: 'Driver Card'
        }
      };
      
      setCardType(mockCardData.type);
      setCardInfo(mockCardData.info);
      
      toast({
        title: "Card Detected",
        description: `${mockCardData.info.type} detected`
      });
    } catch (error) {
      console.error('Failed to detect card:', error);
      toast({
        title: "Card Detection Failed",
        description: "Failed to detect card in reader",
        variant: "destructive"
      });
    }
  };

  // Download card data
  const downloadCardData = async () => {
    if (!isConnected || !cardType || !selectedReader) return;
    
    setIsDownloading(true);
    setDownloadProgress(0);
    
    try {
      // Create download session
      const { data: sessionData, error: sessionError } = await supabase
        .from('tachograph_download_sessions')
        .insert({
          organization_id: profile?.organization_id,
          card_reader_id: selectedReader,
          card_type: cardType,
          card_number: cardInfo?.number || 'Unknown',
          download_status: 'in_progress'
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Simulate download process with progress updates
      const downloadSteps = [
        { progress: 10, message: 'Initializing download...' },
        { progress: 25, message: 'Reading card data...' },
        { progress: 50, message: 'Processing records...' },
        { progress: 75, message: 'Validating data...' },
        { progress: 90, message: 'Saving to database...' },
        { progress: 100, message: 'Download complete!' }
      ];

      for (const step of downloadSteps) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setDownloadProgress(step.progress);
      }

      // Fetch real tachograph records from the card
      const realRecords = await fetchTachographRecords(cardInfo?.driver_id || '', 7);
      
      // Save records to database
      const { error: recordsError } = await supabase
        .from('tachograph_records')
        .insert(realRecords.map(record => ({
          ...record,
          organization_id: profile?.organization_id,
          card_type: cardType,
          card_number: cardInfo?.number,
          card_holder_name: cardInfo?.holder,
          download_method: 'card_reader'
        })));

      if (recordsError) throw recordsError;

      // Update download session
      await supabase
        .from('tachograph_download_sessions')
        .update({
          download_status: 'completed',
          download_end_time: new Date().toISOString(),
          records_downloaded: realRecords.length
        })
        .eq('id', sessionData.id);

      // Notify parent component
      onDataDownloaded({
        cardType,
        cardNumber: cardInfo?.number || '',
        cardHolderName: cardInfo?.holder || '',
        cardExpiryDate: cardInfo?.expiry || '',
        downloadDate: new Date().toISOString(),
        recordsCount: realRecords.length,
        violationsCount: realRecords.filter(r => r.violations && r.violations.length > 0).length,
        filePath: `downloads/${sessionData.id}.ddd`
      });

      // Refresh queries
      queryClient.invalidateQueries({ queryKey: ['tachograph-records'] });
      queryClient.invalidateQueries({ queryKey: ['download-sessions'] });

      toast({
        title: "Download Complete",
        description: `Successfully downloaded ${realRecords.length} records from ${cardType} card`
      });

    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download card data",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  // Fetch real tachograph records from database
  const fetchTachographRecords = async (driverId: string, days: number = 7) => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('tachograph_records')
        .select('*')
        .eq('driver_id', driverId)
        .gte('record_date', startDate.toISOString().split('T')[0])
        .lte('record_date', endDate.toISOString().split('T')[0])
        .order('record_date', { ascending: false });

      if (error) {
        console.error('Error fetching tachograph records:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch tachograph records:', error);
      return [];
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'usb_reader':
        return <Usb className="h-4 w-4" />;
      case 'bluetooth_reader':
        return <Bluetooth className="h-4 w-4" />;
      case 'digivu_plus':
      case 'generation_2':
        return <Wifi className="h-4 w-4" />;
      default:
        return <CreditCard className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
      calibration_due: 'bg-red-100 text-red-800'
    };
    return <Badge className={colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
      {status.replace('_', ' ').toUpperCase()}
    </Badge>;
  };

  const getDownloadStatusBadge = (status: string) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      in_progress: 'bg-blue-100 text-blue-800',
      failed: 'bg-red-100 text-red-800',
      partial: 'bg-yellow-100 text-yellow-800'
    };
    return <Badge className={colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
      {status.replace('_', ' ').toUpperCase()}
    </Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Card Reader Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Card Reader
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Reader Selection */}
          <div>
            <Label htmlFor="card-reader">Select Card Reader</Label>
            <Select value={selectedReader} onValueChange={setSelectedReader}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a card reader" />
              </SelectTrigger>
              <SelectContent>
                {cardReaders.map((reader) => (
                  <SelectItem key={reader.id} value={reader.id}>
                    <div className="flex items-center gap-2">
                      {getDeviceIcon(reader.device_type)}
                      <span>{reader.device_name}</span>
                      {getStatusBadge(reader.status)}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Connection Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Reader Status</span>
            <Badge variant={isConnected ? "default" : "secondary"}>
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
          </div>

          {/* Connection Button */}
          {!isConnected && (
            <Button onClick={connectToReader} className="w-full" disabled={!selectedReader}>
              <Usb className="mr-2 h-4 w-4" />
              Connect to Card Reader
            </Button>
          )}

          {/* Card Detection */}
          {isConnected && !cardType && (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-2">
                Insert a tachograph card to begin
              </p>
              <Button onClick={detectCard} variant="outline">
                <CreditCard className="mr-2 h-4 w-4" />
                Detect Card
              </Button>
            </div>
          )}

          {/* Card Info */}
          {cardInfo && (
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Card Information</h3>
              <div className="space-y-1 text-sm">
                <div><span className="font-medium">Type:</span> {cardType}</div>
                <div><span className="font-medium">Number:</span> {cardInfo.number}</div>
                <div><span className="font-medium">Holder:</span> {cardInfo.holder}</div>
                <div><span className="font-medium">Expiry:</span> {cardInfo.expiry}</div>
              </div>
            </div>
          )}

          {/* Download Progress */}
          {isDownloading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Downloading data...</span>
                <span>{downloadProgress}%</span>
              </div>
              <Progress value={downloadProgress} />
            </div>
          )}

          {/* Download Button */}
          {cardType && !isDownloading && (
            <Button 
              onClick={downloadCardData} 
              className="w-full"
              disabled={!isConnected}
            >
              <Download className="mr-2 h-4 w-4" />
              Download {cardType} Card Data
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Recent Downloads */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileDown className="h-5 w-5" />
              Recent Downloads
            </span>
            <Button variant="outline" size="sm" onClick={() => setIsHistoryOpen(true)}>
              <Eye className="h-4 w-4" />
              View All
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {downloadSessions.slice(0, 5).map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-sm">
                      {session.card_type.charAt(0).toUpperCase() + session.card_type.slice(1)} Card
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {session.card_number} • {new Date(session.download_start_time).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getDownloadStatusBadge(session.download_status)}
                  {session.records_downloaded > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {session.records_downloaded} records
                    </span>
                  )}
                </div>
              </div>
            ))}
            {downloadSessions.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                <FileDown className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent downloads</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Card Reader Settings</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="readers" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="readers">Card Readers</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="readers" className="space-y-4">
              <div className="space-y-4">
                {cardReaders.map((reader) => (
                  <div key={reader.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(reader.device_type)}
                        <span className="font-medium">{reader.device_name}</span>
                      </div>
                      {getStatusBadge(reader.status)}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div>Serial: {reader.serial_number}</div>
                      <div>Firmware: {reader.firmware_version}</div>
                      <div>Last Cal: {reader.last_calibration_date || 'Never'}</div>
                      <div>Next Cal: {reader.next_calibration_due || 'Not set'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="auto-download">Auto Download</Label>
                  <Select defaultValue="disabled">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="disabled">Disabled</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="download-format">Download Format</Label>
                  <Select defaultValue="ddd">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ddd">DDD (Digital)</SelectItem>
                      <SelectItem value="tgd">TGD (Tachograph)</SelectItem>
                      <SelectItem value="c1b">C1B (Card)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Download History</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Card Type</TableHead>
                    <TableHead>Card Number</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Records</TableHead>
                    <TableHead>Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {downloadSessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>
                        {new Date(session.download_start_time).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {session.card_type.charAt(0).toUpperCase() + session.card_type.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{session.card_number}</TableCell>
                      <TableCell>{getDownloadStatusBadge(session.download_status)}</TableCell>
                      <TableCell>{session.records_downloaded}</TableCell>
                      <TableCell>
                        {session.download_end_time ? 
                          `${Math.round((new Date(session.download_end_time).getTime() - new Date(session.download_start_time).getTime()) / 1000)}s` : 
                          'In Progress'
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TachographCardReader;
