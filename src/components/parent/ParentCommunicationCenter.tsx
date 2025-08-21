
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MessageSquare, 
  Send, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useParentCommunications, useSendCommunication, type ParentCommunication } from '@/hooks/useChildManagement';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const ParentCommunicationCenter = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState('');
  const [messageType, setMessageType] = useState('general');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  // Fetch real communications data from backend
  const { data: communications = [], isLoading: communicationsLoading, refetch } = useParentCommunications();
  const sendCommunicationMutation = useSendCommunication();

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    try {
      await sendCommunicationMutation.mutateAsync({
        message_type: messageType as any,
        message: newMessage,
        priority: 'normal'
      });
      
      toast({
        title: "Message sent successfully",
        description: "Your message has been sent to the driver.",
      });
      
      setNewMessage('');
      setMessageType('general');
      setIsDialogOpen(false);
      refetch(); // Refresh the communications list
    } catch (error) {
      toast({
        title: "Failed to send message",
        description: "There was an error sending your message. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'delay': return <Clock className="w-4 h-4 text-orange-500" />;
      case 'incident': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'absence': return <XCircle className="w-4 h-4 text-yellow-500" />;
      case 'emergency': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <MessageSquare className="w-4 h-4 text-blue-500" />;
    }
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'delay': return 'bg-orange-100 text-orange-800';
      case 'incident': return 'bg-red-100 text-red-800';
      case 'absence': return 'bg-yellow-100 text-yellow-800';
      case 'emergency': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getMessageTypeLabel = (type: string) => {
    switch (type) {
      case 'delay': return 'Delay';
      case 'incident': return 'Incident';
      case 'absence': return 'Absence';
      case 'emergency': return 'Emergency';
      case 'pickup': return 'Pickup Change';
      default: return 'General';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'read': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'delivered': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'sent': return <div className="w-2 h-2 bg-blue-500 rounded-full"></div>;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <div className="w-2 h-2 bg-gray-400 rounded-full"></div>;
    }
  };

  return (
    <Card>
      <CardHeader className={isMobile ? 'pb-3' : ''}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className={`flex items-center space-x-2 ${isMobile ? 'text-lg' : ''}`}>
              <MessageSquare className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
              <span>Communication Center</span>
            </CardTitle>
            <CardDescription className={isMobile ? 'text-sm' : ''}>
              Messages with your child's driver
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size={isMobile ? 'sm' : 'default'} className={isMobile ? 'text-xs' : ''}>
                <Send className={`${isMobile ? 'w-3 h-3 mr-1' : 'w-4 h-4 mr-2'}`} />
                {isMobile ? 'New' : 'New Message'}
              </Button>
            </DialogTrigger>
            <DialogContent className={isMobile ? 'w-[95vw] max-w-none mx-2' : ''}>
              <DialogHeader>
                <DialogTitle className={isMobile ? 'text-lg' : ''}>Send Message to Driver</DialogTitle>
                <DialogDescription className={isMobile ? 'text-sm' : ''}>
                  Communicate with your child's driver about transport matters
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="messageType" className={isMobile ? 'text-sm' : ''}>Message Type</Label>
                  <Select value={messageType} onValueChange={setMessageType}>
                    <SelectTrigger className={isMobile ? 'h-12' : ''}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="general">General Information</SelectItem>
                      <SelectItem value="absence">Student Absence</SelectItem>
                      <SelectItem value="pickup">Pickup Change</SelectItem>
                      <SelectItem value="delay">Delay Notification</SelectItem>
                      <SelectItem value="incident">Incident Report</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="message" className={isMobile ? 'text-sm' : ''}>Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Enter your message here..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className={isMobile ? 'min-h-[100px]' : 'min-h-[120px]'}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  size={isMobile ? 'sm' : 'default'}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendCommunicationMutation.isPending}
                  size={isMobile ? 'sm' : 'default'}
                >
                  {sendCommunicationMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className={`${isMobile ? 'w-3 h-3 mr-1' : 'w-4 h-4 mr-2'}`} />
                      Send Message
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {communicationsLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : communications.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-muted-foreground">No communications yet</p>
            <p className="text-sm text-muted-foreground mt-1">Start a conversation with your child's driver</p>
          </div>
        ) : (
          <div className="space-y-4">
            {communications.slice(0, 10).map((communication) => (
              <div key={communication.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge className={getMessageTypeColor(communication.message_type)}>
                        {getMessageTypeLabel(communication.message_type)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(communication.sent_at), 'MMM dd, yyyy HH:mm')}
                      </span>
                    </div>
                    {communication.subject && (
                      <h4 className="font-medium mb-1">{communication.subject}</h4>
                    )}
                    <p className="text-sm text-gray-600">{communication.message}</p>
                    {communication.child_profiles && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Re: {communication.child_profiles.first_name} {communication.child_profiles.last_name}
                      </p>
                    )}
                    {communication.profiles && (
                      <p className="text-xs text-muted-foreground">
                        From: {communication.profiles.first_name} {communication.profiles.last_name}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 ml-4">
                    {getStatusIcon(communication.status)}
                  </div>
                </div>
              </div>
            ))}
            {communications.length > 10 && (
              <div className="text-center pt-4">
                <Button variant="outline" size="sm">
                  View All Messages ({communications.length})
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ParentCommunicationCenter;
