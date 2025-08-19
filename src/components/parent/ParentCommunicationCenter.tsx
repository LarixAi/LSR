
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MessageSquare, Send, Clock, AlertTriangle, User, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useIsMobile } from '@/hooks/use-mobile';

const ParentCommunicationCenter = () => {
  const [newMessage, setNewMessage] = useState('');
  const [messageType, setMessageType] = useState('general');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  // Mock data for messages
  const recentMessages = [
    {
      id: '1',
      type: 'delay',
      from: 'Driver John Smith',
      message: 'Running 15 minutes late due to heavy traffic on Main Street',
      timestamp: '2 hours ago',
      status: 'unread'
    },
    {
      id: '2',
      type: 'incident',
      from: 'Driver John Smith',
      message: 'Minor incident - student Emma forgot her backpack. Returned to pick it up.',
      timestamp: '1 day ago',
      status: 'read'
    },
    {
      id: '3',
      type: 'general',
      from: 'You',
      message: 'Emma will not be taking the bus tomorrow - doctor appointment at 9 AM',
      timestamp: '2 days ago',
      status: 'read'
    }
  ];

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    console.log('Sending message:', {
      type: messageType,
      message: newMessage
    });
    
    setNewMessage('');
    setMessageType('general');
    setIsDialogOpen(false);
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'delay': return <Clock className="w-4 h-4 text-orange-500" />;
      case 'incident': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <MessageSquare className="w-4 h-4 text-blue-500" />;
    }
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'delay': return 'bg-orange-100 text-orange-800';
      case 'incident': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
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
                      <SelectItem value="question">Question</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="message" className={isMobile ? 'text-sm' : ''}>Message</Label>
                  <Textarea
                    id="message"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message here..."
                    rows={isMobile ? 3 : 4}
                    className={isMobile ? 'text-base' : ''}
                  />
                </div>
                <div className={`flex ${isMobile ? 'flex-col gap-2' : 'justify-end'} space-x-2`}>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    className={isMobile ? 'w-full h-12' : ''}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSendMessage}
                    className={isMobile ? 'w-full h-12' : ''}
                  >
                    <Send className={`${isMobile ? 'w-3 h-3 mr-1' : 'w-4 h-4 mr-2'}`} />
                    Send Message
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className={isMobile ? 'pt-0' : ''}>
        <div className="space-y-4">
          {recentMessages.map((message) => (
            <div 
              key={message.id} 
              className={`${isMobile ? 'p-3' : 'p-4'} rounded-lg border ${
                message.status === 'unread' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className={`flex items-start justify-between ${isMobile ? 'mb-1' : 'mb-2'}`}>
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  {getMessageIcon(message.type)}
                  <span className={`font-medium ${isMobile ? 'text-sm truncate' : 'text-sm'}`}>
                    {message.from}
                  </span>
                  <Badge variant="outline" className={`${getMessageTypeColor(message.type)} text-xs`}>
                    {message.type.charAt(0).toUpperCase() + message.type.slice(1)}
                  </Badge>
                </div>
                <span className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-500 ml-2 flex-shrink-0`}>
                  {message.timestamp}
                </span>
              </div>
              <p className={`${isMobile ? 'text-sm' : 'text-sm'} text-gray-700 leading-relaxed`}>
                {message.message}
              </p>
            </div>
          ))}
          {recentMessages.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} mx-auto mb-4 opacity-50`} />
              <p className={isMobile ? 'text-sm' : ''}>No messages yet</p>
              <p className={`${isMobile ? 'text-xs' : 'text-sm'}`}>
                Start a conversation with your child's driver
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ParentCommunicationCenter;
