import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Bot, User, Minimize2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  message: string;
  timestamp: Date;
  quickReplies?: string[];
}

const CustomerServiceChatbot = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [inputMessage, setInputMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Mock chat history for now to avoid database issues
  const { data: chatHistory = [], isLoading } = useQuery({
    queryKey: ['chat-history', profile?.id],
    queryFn: async () => {
      // Return initial welcome message
      const messages: ChatMessage[] = [{
        id: '1',
        type: 'bot',
        message: 'Hello! I\'m your LSR Transport Assistant. How can I help you today?',
        timestamp: new Date(),
        quickReplies: ['Route Information', 'Schedule Changes', 'Contact Driver', 'Report Issue']
      }];
      
      return messages;
    },
    enabled: !!profile?.id
  });

  const [messages, setMessages] = useState<ChatMessage[]>(chatHistory);

  // Update local messages when chat history changes
  useEffect(() => {
    if (chatHistory.length > 0) {
      setMessages(chatHistory);
    }
  }, [chatHistory]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Create support ticket mutation
  const createTicketMutation = useMutation({
    mutationFn: async (message: string) => {
      if (!profile?.id || !profile?.organization_id) throw new Error('Profile not found');
      
      const { data, error } = await supabase
        .from('support_tickets')
        .insert({
          title: 'Chat Support Request',
          description: message,
          category: 'general',
          priority: 'normal',
          ticket_number: `TKT-${Date.now()}`,
          organization_id: profile.organization_id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-history'] });
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generateBotResponse = (userMessage: string): ChatMessage => {
    const lowerMessage = userMessage.toLowerCase();
    let response = '';
    let quickReplies: string[] = [];

    if (lowerMessage.includes('route') || lowerMessage.includes('schedule')) {
      response = 'I can help you with route information and schedules. Which specific route or time are you asking about?';
      quickReplies = ['Route A Schedule', 'Route B Schedule', 'All Routes', 'Tomorrow\'s Schedule'];
    } else if (lowerMessage.includes('late') || lowerMessage.includes('delay')) {
      response = 'I understand you\'re asking about delays. Let me check the current status of all routes for you. Route A is running 5 minutes behind due to traffic. Would you like me to notify affected parents?';
      quickReplies = ['Yes, notify parents', 'Check other routes', 'Contact dispatcher'];
    } else if (lowerMessage.includes('contact') || lowerMessage.includes('driver')) {
      response = 'I can help you contact a driver or dispatcher. For safety reasons, drivers cannot receive calls while driving. Would you like me to send a message or connect you with dispatch?';
      quickReplies = ['Send message', 'Call dispatch', 'Emergency contact'];
    } else if (lowerMessage.includes('problem') || lowerMessage.includes('issue') || lowerMessage.includes('report')) {
      response = 'I\'m here to help with any issues. Can you tell me more about the problem you\'re experiencing?';
      quickReplies = ['Vehicle issue', 'Driver concern', 'Route problem', 'App issue'];
    } else {
      response = 'I\'m here to help with routes, schedules, driver contact, and reporting issues. What would you like assistance with?';
      quickReplies = ['Route Information', 'Schedule Changes', 'Contact Driver', 'Report Issue'];
    }

    return {
      id: Date.now().toString(),
      type: 'bot',
      message: response,
      timestamp: new Date(),
      quickReplies
    };
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputMessage.trim();
    setInputMessage('');
    setIsTyping(true);

    try {
      // Create support ticket for the message
      await createTicketMutation.mutateAsync(messageToSend);
      
      // Simulate AI response
      setTimeout(() => {
        const botResponse = generateBotResponse(messageToSend);
        setMessages(prev => [...prev, botResponse]);
        setIsTyping(false);
      }, 1000);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
    }
  };

  const handleQuickReply = (reply: string) => {
    setInputMessage(reply);
    setTimeout(() => sendMessage(), 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          className="rounded-full w-12 h-12 bg-blue-600 hover:bg-blue-700 shadow-lg"
        >
          <MessageSquare className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 h-96">
      <Card className="h-full flex flex-col shadow-xl">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-blue-600" />
              <div>
                <CardTitle className="text-sm">LSR Assistant</CardTitle>
                <CardDescription className="text-xs">24/7 Support</CardDescription>
              </div>
            </div>
            <div className="flex space-x-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsMinimized(true)}
                className="h-6 w-6 p-0"
              >
                <Minimize2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-3 space-y-3">
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-2 rounded-lg text-xs ${
                  message.type === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <div className="flex items-center space-x-1 mb-1">
                    {message.type === 'bot' ? <Bot className="w-3 h-3" /> : <User className="w-3 h-3" />}
                    <span className="font-medium">{message.type === 'bot' ? 'Assistant' : 'You'}</span>
                  </div>
                  <p>{message.message}</p>
                  {message.quickReplies && (
                    <div className="mt-2 space-y-1">
                      {message.quickReplies.map((reply, index) => (
                        <Button
                          key={index}
                          size="sm"
                          variant="outline"
                          className="text-xs h-6 mr-1 mb-1"
                          onClick={() => handleQuickReply(reply)}
                        >
                          {reply}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-2 rounded-lg text-xs">
                  <div className="flex items-center space-x-1">
                    <Bot className="w-3 h-3" />
                    <span>Assistant is typing...</span>
                    <div className="flex space-x-1">
                      <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="flex space-x-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="text-xs h-8"
            />
            <Button size="sm" onClick={sendMessage} className="h-8 w-8 p-0">
              <Send className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerServiceChatbot;