import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Send, 
  Plus, 
  Video, 
  Phone, 
  MoreVertical,
  Paperclip,
  Smile
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  timestamp: string;
  isOutgoing: boolean;
  sender: {
    name: string;
    avatar: string;
  };
}

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  isOnline: boolean;
  unreadCount: number;
  messages: Message[];
}

interface AdvancedMessagingSystemProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdvancedMessagingSystem: React.FC<AdvancedMessagingSystemProps> = ({
  isOpen,
  onClose
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      name: 'George Patrick',
      avatar: '/avatars/george.jpg',
      lastMessage: 'Thanks for the update!',
      timestamp: '12.55pm',
      isOnline: false,
      unreadCount: 0,
      messages: [
        {
          id: '1',
          content: 'Hi there! How are you doing?',
          timestamp: '11.30',
          isOutgoing: false,
          sender: { name: 'George Patrick', avatar: '/avatars/george.jpg' }
        },
        {
          id: '2',
          content: 'I\'m doing great, thanks for asking!',
          timestamp: '12.40',
          isOutgoing: true,
          sender: { name: 'You', avatar: '/avatars/me.jpg' }
        }
      ]
    },
    {
      id: '2',
      name: 'Kotlin Thomas',
      avatar: '/avatars/kotlin.jpg',
      lastMessage: 'Hallo! Great question. In order to copy a survey, you\'ll just want to right click on thw lower corner of yout survey on ythe home screen. From there you\'ll get a menu eith a few different options, one of those will be to make a copy.',
      timestamp: '12.45pm',
      isOnline: true,
      unreadCount: 0,
      messages: [
        {
          id: '1',
          content: 'Hi there! Thanks for getting in touch. How can I help?',
          timestamp: '11.30',
          isOutgoing: false,
          sender: { name: 'Kotlin Thomas', avatar: '/avatars/kotlin.jpg' }
        },
        {
          id: '2',
          content: 'Hi Kotlin!. I\'m trying to copy a survey in my account. Can you give me some direction on how to do that?',
          timestamp: '12.40',
          isOutgoing: true,
          sender: { name: 'You', avatar: '/avatars/me.jpg' }
        },
        {
          id: '3',
          content: 'Hallo! Great question. In order to copy a survey, you\'ll just want to right click on thw lower corner of yout survey on ythe home screen. From there you\'ll get a menu eith a few different options, one of those will be to make a copy.',
          timestamp: '12.45',
          isOutgoing: false,
          sender: { name: 'Kotlin Thomas', avatar: '/avatars/kotlin.jpg' }
        }
      ]
    },
    {
      id: '3',
      name: 'Jessey Adword',
      avatar: '/avatars/jessey.jpg',
      lastMessage: 'Perfect! I\'ll get that sorted for you.',
      timestamp: '12.25pm',
      isOnline: false,
      unreadCount: 2,
      messages: []
    },
    {
      id: '4',
      name: 'Steve Madani',
      avatar: '/avatars/steve.jpg',
      lastMessage: 'Looking forward to our meeting tomorrow.',
      timestamp: '11.04pm',
      isOnline: true,
      unreadCount: 0,
      messages: []
    },
    {
      id: '5',
      name: 'Peter Qarashy',
      avatar: '/avatars/peter.jpg',
      lastMessage: 'The project is progressing well.',
      timestamp: '10.30pm',
      isOnline: false,
      unreadCount: 1,
      messages: []
    }
  ]);

  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-select first conversation
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversation) {
      setSelectedConversation(conversations[1]); // Select Kotlin Thomas by default
    }
  }, [conversations, selectedConversation]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversation?.messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      timestamp: new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }).toLowerCase(),
      isOutgoing: true,
      sender: { name: 'You', avatar: '/avatars/me.jpg' }
    };

    setConversations(prev => prev.map(conv => 
      conv.id === selectedConversation.id 
        ? {
            ...conv,
            messages: [...conv.messages, message],
            lastMessage: newMessage,
            timestamp: new Date().toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: true 
            }).toLowerCase()
          }
        : conv
    ));

    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl h-[80vh] shadow-2xl">
        <CardHeader className="pb-0 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              New message
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0 h-full">
          <div className="flex h-full">
            {/* Left Sidebar - Conversation List */}
            <div className="w-80 border-r border-gray-200 flex flex-col">
              {/* Search Bar */}
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search messages"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
                  />
                </div>
              </div>

              {/* Conversation List */}
              <ScrollArea className="flex-1">
                <div className="space-y-0">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation)}
                      className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                        selectedConversation?.id === conversation.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={conversation.avatar} alt={conversation.name} />
                            <AvatarFallback className="bg-gray-200 text-gray-600">
                              {conversation.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {conversation.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {conversation.name}
                            </h3>
                            <span className="text-xs text-gray-500">
                              {conversation.timestamp}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-600 truncate mt-1">
                            {conversation.lastMessage}
                          </p>

                          {selectedConversation?.id === conversation.id && conversation.isOnline && (
                            <div className="flex items-center gap-1 mt-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full" />
                              <span className="text-xs text-green-600 font-medium">Online</span>
                            </div>
                          )}
                        </div>

                        {conversation.unreadCount > 0 && (
                          <Badge variant="destructive" className="ml-2">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Right Side - Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={selectedConversation.avatar} alt={selectedConversation.name} />
                          <AvatarFallback className="bg-gray-200 text-gray-600">
                            {selectedConversation.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {selectedConversation.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{selectedConversation.name}</h3>
                        {selectedConversation.isOnline && (
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <span className="text-sm text-green-600">Online</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
                        <Video className="w-5 h-5" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
                        <Phone className="w-5 h-5" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
                        <MoreVertical className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>

                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {selectedConversation.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.isOutgoing ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`flex items-end gap-2 max-w-[70%] ${message.isOutgoing ? 'flex-row-reverse' : 'flex-row'}`}>
                            {!message.isOutgoing && (
                              <Avatar className="w-8 h-8 flex-shrink-0">
                                <AvatarImage src={message.sender.avatar} alt={message.sender.name} />
                                <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                                  {message.sender.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            
                            <div className={`rounded-lg px-4 py-2 ${
                              message.isOutgoing 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-100 text-gray-900'
                            }`}>
                              <p className="text-sm leading-relaxed">{message.content}</p>
                              <p className={`text-xs mt-1 ${
                                message.isOutgoing ? 'text-blue-100' : 'text-gray-500'
                              }`}>
                                {message.timestamp}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex items-end gap-2">
                      <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
                        <Plus className="w-5 h-5" />
                      </Button>
                      
                      <div className="flex-1 relative">
                        <Input
                          placeholder="Type a message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className="pr-20 bg-gray-50 border-gray-200 focus:bg-white"
                        />
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Paperclip className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Smile className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <Button 
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-4"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                    <p className="text-gray-500">Choose a conversation from the list to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};



