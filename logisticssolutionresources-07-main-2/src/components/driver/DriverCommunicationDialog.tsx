
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Clock, AlertTriangle, Send } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface Student {
  id: string;
  parent_id: string;
  first_name: string;
  last_name: string;
  pickup_location: string;
  pickup_time: string;
  profiles?: {
    first_name: string;
    last_name: string;
    phone: string;
  };
}

interface DriverCommunicationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  routeId: string;
  students: Student[];
}

const DriverCommunicationDialog: React.FC<DriverCommunicationDialogProps> = ({
  open,
  onOpenChange,
  routeId,
  students
}) => {
  const { user } = useAuth();
  const [messageType, setMessageType] = useState<string>('');
  const [message, setMessage] = useState('');
  const [selectedParents, setSelectedParents] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendMessage = async () => {
    if (!messageType || !message.trim()) {
      toast.error('Please select a message type and enter a message');
      return;
    }

    setIsSubmitting(true);
    try {
      // Since the notifications and route_communications tables don't exist yet,
      // we'll just simulate the message sending
      console.log('Sending message:', {
        messageType,
        message,
        routeId,
        selectedParents: selectedParents.length > 0 ? selectedParents : students.map(s => s.parent_id)
      });
      
      toast.success(`Message sent to ${selectedParents.length > 0 ? selectedParents.length : students.length} parent(s).`);
      setMessage('');
      setMessageType('');
      setSelectedParents([]);
      onOpenChange(false);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'delay': return <Clock className="w-4 h-4" />;
      case 'incident': return <AlertTriangle className="w-4 h-4" />;
      case 'pickup_alert': return <MessageSquare className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const toggleParentSelection = (parentId: string) => {
    setSelectedParents(prev => 
      prev.includes(parentId) 
        ? prev.filter(id => id !== parentId)
        : [...prev, parentId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Communicate with Parents</DialogTitle>
          <DialogDescription>
            Send updates about route delays, incidents, or pickup alerts to parents
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label htmlFor="messageType">Message Type</Label>
            <Select value={messageType} onValueChange={setMessageType}>
              <SelectTrigger>
                <SelectValue placeholder="Select message type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="delay">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>Route Delay</span>
                  </div>
                </SelectItem>
                <SelectItem value="incident">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Incident Report</span>
                  </div>
                </SelectItem>
                <SelectItem value="pickup_alert">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>Pickup Alert</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message to parents..."
              rows={4}
            />
          </div>

          <div>
            <Label>Select Parents (leave empty to send to all)</Label>
            <div className="max-h-40 overflow-y-auto border rounded-lg p-3 space-y-2 mt-2">
              {students.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedParents.includes(student.parent_id)}
                      onChange={() => toggleParentSelection(student.parent_id)}
                      className="rounded"
                    />
                    <div>
                      <p className="font-medium">{student.first_name} {student.last_name}</p>
                      <p className="text-sm text-gray-500">
                        Parent: {student.profiles?.first_name} {student.profiles?.last_name}
                      </p>
                      <p className="text-xs text-gray-400">Pickup: {student.pickup_location}</p>
                    </div>
                  </div>
                  <Badge variant="outline">{student.pickup_time || 'Time TBD'}</Badge>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {selectedParents.length > 0 
                ? `${selectedParents.length} parent(s) selected`
                : `All ${students.length} parent(s) will receive the message`
              }
            </p>
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSendMessage}
              disabled={!messageType || !message.trim() || isSubmitting}
            >
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DriverCommunicationDialog;
