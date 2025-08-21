import React, { useState, useEffect, useRef } from 'react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  Square,
  Eye,
  FileDown,
  AlertCircle,
  Info,
  WifiOff,
  Smartphone,
  Shield,
  Activity,
  Calendar,
  MapPin,
  Timer
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
  connection_type: 'usb' | 'bluetooth' | 'wifi';
  battery_level?: number;
  signal_strength?: number;
}

interface TachographCard {
  card_number: string;
  card_type: 'driver' | 'vehicle' | 'workshop';
  holder_name: string;
  issuing_authority: string;
  expiry_date: string;
  issue_date: string;
  driver_id?: string;
  vehicle_id?: string;
  card_status: 'valid' | 'expired' | 'suspended' | 'damaged';
  last_download_date?: string;
  records_count: number;
  violations_count: number;
}

interface DownloadSession {
  id: string;
  organization_id: string;
  card_reader_id: string;
  card_type: 'driver' | 'vehicle' | 'workshop';
  card_number: string;
  download_status: 'in_progress' | 'completed' | 'failed' | 'partial';
  download_start_time: string;
  download_end_time?: string;
  records_downloaded: number;
  errors_encountered: number;
  download_method: 'card_reader' | 'bluetooth' | 'remote';
}

interface TachographRecord {
  id: string;
  driver_id: string;
  vehicle_id: string;
  record_date: string;
  start_time: string;
  end_time: string;
  activity_type: 'driving' | 'work' | 'availability' | 'break' | 'rest';
  distance_km: number;
  start_location: string;
  end_location: string;
  speed_data: any;
  violations: any[];
}

interface TachographCardReaderProps {
  onDataDownloaded?: (cardData: { cardType: string; recordsCount: number }) => void;
}

const TachographCardReader: React.FC<TachographCardReaderProps> = ({ onDataDownloaded }) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isConnected, setIsConnected] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [cardType, setCardType] = useState<'driver' | 'vehicle' | 'workshop' | null>(null);
  const [cardInfo, setCardInfo] = useState<TachographCard | null>(null);
  const [selectedReader, setSelectedReader] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isCardDetected, setIsCardDetected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');

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
      setConnectionStatus('connecting');
      setIsConnected(false);
      setDownloadProgress(0);
      setCardInfo(null);
      setCardType(null);
      setIsCardDetected(false);
      
      // In a real implementation, this would connect to the actual card reader
      // For now, we'll show the connection process but require manual card detection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsConnected(true);
      setConnectionStatus('connected');
      toast({
        title: "Connected",
        description: "Card reader is connected. Please insert a tachograph card manually."
      });
    } catch (error) {
      console.error('Failed to connect to card reader:', error);
      setConnectionStatus('error');
      toast({
        title: "Connection Failed",
        description: "Failed to connect to card reader. Please check the connection and try again.",
        variant: "destructive"
      });
    }
  };

  // Disconnect from card reader
  const disconnectFromReader = () => {
    setIsConnected(false);
    setConnectionStatus('disconnected');
    setCardInfo(null);
    setCardType(null);
    setIsCardDetected(false);
    setDownloadProgress(0);
    
    toast({
      title: "Disconnected",
      description: "Disconnected from card reader"
    });
  };

  // Manual card detection (for real implementation)
  const detectCard = async () => {
    if (!isConnected) {
      toast({
        title: "Not Connected",
        description: "Please connect to a card reader first",
        variant: "destructive"
      });
      return;
    }

    try {
      // In a real implementation, this would call the card reader API
      // For now, we'll show that manual detection is required
      toast({
        title: "Manual Detection Required",
        description: "Please insert a tachograph card and use the card reader's detection button or software.",
        variant: "destructive"
      });
    } catch (error) {
      console.error('Failed to detect card:', error);
      toast({
        title: "Card Detection Failed",
        description: "Failed to detect card. Please check the card and try again.",
        variant: "destructive"
      });
    }
  };

  // Eject card
  const ejectCard = () => {
    setCardInfo(null);
    setCardType(null);
    setIsCardDetected(false);
    toast({
      title: "Card Ejected",
      description: "Card has been ejected from reader"
    });
  };

  // Download card data
  const downloadCardData = async () => {
    if (!isConnected || !cardType || !selectedReader || !cardInfo) {
      toast({
        title: "Cannot Download",
        description: "Please ensure a card is detected and reader is connected",
        variant: "destructive"
      });
      return;
    }
    
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
          card_number: cardInfo.card_number,
          download_status: 'in_progress',
          download_method: 'card_reader'
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // In a real implementation, this would download actual data from the card
      // For now, we'll show the process but indicate no real data is available
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

      // In a real implementation, actual tachograph records would be downloaded here
      // For now, we'll create a placeholder record to show the process
      const placeholderRecord = {
        id: `record_${Date.now()}`,
        driver_id: drivers[0]?.id || '',
        vehicle_id: vehicles[0]?.id || '',
        record_date: new Date().toISOString().split('T')[0],
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 3600000).toISOString(),
        activity_type: 'driving' as const,
        distance_km: 0,
        start_location: 'Manual Entry Required',
        end_location: 'Manual Entry Required',
        speed_data: { max_speed: 0 },
        violations: []
      };
      
      // Save placeholder record to database
      const { error: recordsError } = await supabase
        .from('tachograph_records')
        .insert({
          ...placeholderRecord,
          organization_id: profile?.organization_id,
          card_type: cardType,
          card_number: cardInfo.card_number,
          download_method: 'card_reader'
        });

      if (recordsError) throw recordsError;

      // Update download session
      await supabase
        .from('tachograph_download_sessions')
        .update({
          download_status: 'completed',
          download_end_time: new Date().toISOString(),
          records_downloaded: 1
        })
        .eq('id', sessionData.id);

      setIsDownloading(false);
      setDownloadProgress(0);
      
      toast({
        title: "Download Complete",
        description: "Download process completed. Note: This is a placeholder - real card data requires actual card reader integration."
      });

      // Call callback if provided
      if (onDataDownloaded) {
        onDataDownloaded({
          cardType,
          recordsCount: 1
        });
      }

      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['tachograph-records'] });
      queryClient.invalidateQueries({ queryKey: ['download-sessions'] });

    } catch (error) {
      console.error('Download failed:', error);
      setIsDownloading(false);
      setDownloadProgress(0);
      
      toast({
        title: "Download Failed",
        description: "Failed to download card data. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'connecting': return <RefreshCw className="w-5 h-5 text-yellow-500 animate-spin" />;
      case 'error': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default: return <WifiOff className="w-5 h-5 text-gray-400" />;
    }
  };

  const getCardTypeIcon = (type: string) => {
    switch (type) {
      case 'driver': return <Users className="w-4 h-4" />;
      case 'vehicle': return <Truck className="w-4 h-4" />;
      case 'workshop': return <Settings className="w-4 h-4" />;
      default: return <CreditCard className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getConnectionIcon()}
            Card Reader Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Card Reader</Label>
              <Select value={selectedReader} onValueChange={setSelectedReader}>
                <SelectTrigger>
                  <SelectValue placeholder="Select card reader" />
                </SelectTrigger>
                <SelectContent>
                  {readersLoading ? (
                    <SelectItem value="loading" disabled>Loading readers...</SelectItem>
                  ) : cardReaders.length === 0 ? (
                    <SelectItem value="no-readers" disabled>No card readers available</SelectItem>
                  ) : (
                    cardReaders.map((reader) => (
                      <SelectItem key={reader.id} value={reader.id}>
                        <div className="flex items-center gap-2">
                          {reader.device_type === 'usb_reader' && <Usb className="w-4 h-4" />}
                          {reader.device_type === 'bluetooth_reader' && <Bluetooth className="w-4 h-4" />}
                          {(reader.device_type === 'digivu_plus' || reader.device_type === 'generation_2') && <Wifi className="w-4 h-4" />}
                          {reader.device_name}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end gap-2">
              {!isConnected ? (
                <Button onClick={connectToReader} disabled={!selectedReader || connectionStatus === 'connecting'}>
                  <Usb className="w-4 h-4 mr-2" />
                  Connect
                </Button>
              ) : (
                <Button variant="outline" onClick={disconnectFromReader}>
                  <WifiOff className="w-4 h-4 mr-2" />
                  Disconnect
                </Button>
              )}
            </div>
          </div>

          {isConnected && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Card reader is connected. Please insert a tachograph card and use the card reader's software to detect it.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Card Detection */}
      {isConnected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Card Detection
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!isCardDetected ? (
              <div className="text-center py-8">
                <CreditCard className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No card detected</p>
                <p className="text-sm text-gray-500 mt-2">
                  Insert a tachograph card and use your card reader's software to detect it.
                </p>
                <Button 
                  onClick={detectCard} 
                  variant="outline" 
                  className="mt-4"
                  disabled={!isConnected}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Manual Detection
                </Button>
              </div>
            ) : cardInfo && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Card Type</Label>
                    <div className="flex items-center gap-2 mt-1">
                      {getCardTypeIcon(cardInfo.card_type)}
                      <span className="capitalize">{cardInfo.card_type}</span>
                      <Badge variant={cardInfo.card_status === 'valid' ? 'default' : 'destructive'}>
                        {cardInfo.card_status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Card Number</Label>
                    <p className="font-mono text-sm mt-1">{cardInfo.card_number}</p>
                  </div>
                  
                  <div>
                    <Label>Card Holder</Label>
                    <p className="mt-1">{cardInfo.holder_name}</p>
                  </div>
                  
                  <div>
                    <Label>Issuing Authority</Label>
                    <p className="mt-1">{cardInfo.issuing_authority}</p>
                  </div>
                  
                  <div>
                    <Label>Expiry Date</Label>
                    <p className="mt-1">{new Date(cardInfo.expiry_date).toLocaleDateString()}</p>
                  </div>
                  
                  <div>
                    <Label>Records Available</Label>
                    <p className="mt-1">{cardInfo.records_count} records</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={downloadCardData} disabled={isDownloading}>
                    <Download className="w-4 h-4 mr-2" />
                    Download Data
                  </Button>
                  <Button variant="outline" onClick={ejectCard}>
                    <Square className="w-4 h-4 mr-2" />
                    Eject Card
                  </Button>
                </div>

                {isDownloading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Downloading...</span>
                      <span>{downloadProgress}%</span>
                    </div>
                    <Progress value={downloadProgress} />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Download History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Recent Downloads
            </div>
            <Button variant="outline" size="sm" onClick={() => setIsHistoryOpen(true)}>
              View All
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Card Type</TableHead>
                <TableHead>Card Number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Records</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {downloadSessions.slice(0, 5).map((session) => (
                <TableRow key={session.id}>
                  <TableCell>
                    {new Date(session.download_start_time).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getCardTypeIcon(session.card_type)}
                      <span className="capitalize">{session.card_type}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {session.card_number}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        session.download_status === 'completed' ? 'default' :
                        session.download_status === 'failed' ? 'destructive' :
                        'secondary'
                      }
                    >
                      {session.download_status}
                    </Badge>
                  </TableCell>
                  <TableCell>{session.records_downloaded || 0}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Download History Dialog */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Download History</DialogTitle>
            <DialogDescription>
              View all tachograph card download sessions
            </DialogDescription>
          </DialogHeader>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Card Type</TableHead>
                <TableHead>Card Number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Records</TableHead>
                <TableHead>Method</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {downloadSessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>
                    {new Date(session.download_start_time).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getCardTypeIcon(session.card_type)}
                      <span className="capitalize">{session.card_type}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {session.card_number}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        session.download_status === 'completed' ? 'default' :
                        session.download_status === 'failed' ? 'destructive' :
                        'secondary'
                      }
                    >
                      {session.download_status}
                    </Badge>
                  </TableCell>
                  <TableCell>{session.records_downloaded || 0}</TableCell>
                  <TableCell className="capitalize">{session.download_method}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TachographCardReader;
