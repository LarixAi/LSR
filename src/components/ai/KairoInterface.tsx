import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Bot, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Sparkles,
  Settings,
  Loader2,
  ChevronDown,
  ChevronUp,
  X,
  RefreshCw,
  Paperclip,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Search,
  TrendingUp,
  Shield,
  DollarSign,
  Wrench,
  FileText,
  BarChart3,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Star,
  Maximize2,
  Minimize2,
  RotateCcw,
  Bookmark,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  Info,
  Play,
  Grid3X3,
  Sparkles as SparklesIcon,
  Edit,
  Download,
  FileSpreadsheet,
  Route
} from 'lucide-react';
import { KairoSettings } from './KairoSettings';
import { KairoNotification } from './KairoNotification';
import { aiService } from '@/services/ai/AIService';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'kairo';
  timestamp: Date;
  type: 'text' | 'voice' | 'suggestion' | 'file' | 'chart' | 'action';
  isTyping?: boolean;
  reactions?: { type: 'thumbsUp' | 'thumbsDown' | 'star'; count: number }[];
  attachments?: Array<{
    name: string;
    type: 'pdf' | 'image' | 'document' | 'spreadsheet' | 'csv';
    size: string;
    url?: string;
  }>;
  actions?: Array<{
    label: string;
    action: string;
    icon: React.ReactNode;
  }>;
  status?: 'sending' | 'sent' | 'error' | 'delivered';
  voiceRecording?: {
    duration: string;
    transcription: string;
  };
}

interface SmartSuggestion {
  id: string;
  text: string;
  category: 'fleet' | 'compliance' | 'operations' | 'financial' | 'general' | 'reports' | 'maintenance';
  icon: React.ReactNode;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  estimatedTime?: string;
  impact?: 'low' | 'medium' | 'high';
}

export const KairoInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // New state to control if AI is open
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typingDots, setTypingDots] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [kairoSettings, setKairoSettings] = useState({
    voiceEnabled: true,
    voiceSpeed: 0.9,
    voicePitch: 1,
    voiceVolume: 0.8,
    autoSpeak: true,
    smartSuggestions: true,
    typingIndicator: true,
    theme: 'auto' as const,
    position: 'bottom-right' as const,
    size: 'medium' as const,
    personality: 'professional' as const,
    autoExpand: false,
    showReactions: true,
    showAttachments: true
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  // Typing animation effect
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setTypingDots(prev => (prev + 1) % 4);
      }, 500);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  // Enhanced smart suggestions with more details
  const smartSuggestions: SmartSuggestion[] = [
    {
      id: '1',
      text: '🚗 Vehicle Management',
      category: 'fleet',
      icon: <TrendingUp className="w-4 h-4" />,
      description: 'Check vehicle status, maintenance schedules, and compliance',
      priority: 'high',
      estimatedTime: '1-2 min',
      impact: 'high'
    },
    {
      id: '2',
      text: '👨‍💼 Driver Operations',
      category: 'operations',
      icon: <User className="w-4 h-4" />,
      description: 'Review driver schedules, licenses, and performance',
      priority: 'high',
      estimatedTime: '2-3 min',
      impact: 'high'
    },
    {
      id: '3',
      text: '🛡️ Compliance Check',
      category: 'compliance',
      icon: <Shield className="w-4 h-4" />,
      description: 'Verify MOT, insurance, and safety compliance status',
      priority: 'high',
      estimatedTime: '1-2 min',
      impact: 'high'
    },
    {
      id: '4',
      text: '💰 Financial Overview',
      category: 'financial',
      icon: <DollarSign className="w-4 h-4" />,
      description: 'Analyze costs, fuel efficiency, and budget planning',
      priority: 'medium',
      estimatedTime: '3-4 min',
      impact: 'medium'
    },
    {
      id: '5',
      text: '🔧 Maintenance Alert',
      category: 'maintenance',
      icon: <Wrench className="w-4 h-4" />,
      description: 'Check upcoming maintenance and service requirements',
      priority: 'high',
      estimatedTime: '1-2 min',
      impact: 'high'
    },
    {
      id: '6',
      text: '📊 Performance Report',
      category: 'reports',
      icon: <BarChart3 className="w-4 h-4" />,
      description: 'Generate fleet performance and efficiency reports',
      priority: 'medium',
      estimatedTime: '2-3 min',
      impact: 'medium'
    },
    {
      id: '7',
      text: '🚌 Route Planning',
      category: 'operations',
      icon: <Route className="w-4 h-4" />,
      description: 'Optimize routes for fuel efficiency and time savings',
      priority: 'high',
      estimatedTime: '2-3 min',
      impact: 'high'
    },
    {
      id: '8',
      text: '📅 Schedule Management',
      category: 'operations',
      icon: <Calendar className="w-4 h-4" />,
      description: 'Review and optimize driver and vehicle schedules',
      priority: 'medium',
      estimatedTime: '2-3 min',
      impact: 'medium'
    }
  ];

  // Filter suggestions based on search query
  const filteredSuggestions = smartSuggestions.filter(suggestion =>
    suggestion.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    suggestion.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Welcome message
  useEffect(() => {
    const isDemoMode = !import.meta.env.VITE_OPENAI_API_KEY && !import.meta.env.VITE_ANTHROPIC_API_KEY;
    const welcomeMessage: Message = {
      id: 'welcome',
      content: `Hello! I'm your TMS AI assistant. I can help you with:

🚗 **Vehicle Management**: Check status, maintenance, compliance
👨‍💼 **Driver Operations**: Schedules, licenses, performance  
🛡️ **Compliance**: MOT, insurance, safety requirements
💰 **Financial**: Cost analysis, fuel efficiency, budgets
🔧 **Maintenance**: Service schedules, alerts, planning
📊 **Reports**: Performance insights, analytics
🚌 **Routes**: Optimization, planning, efficiency
📅 **Scheduling**: Driver and vehicle coordination

Choose a suggestion below or ask me anything!`,
      sender: 'kairo',
      timestamp: new Date(),
      type: 'text',
      status: 'delivered',
      reactions: [
        { type: 'thumbsUp', count: 0 },
        { type: 'star', count: 0 }
      ]
    };
    setMessages([welcomeMessage]);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getCategoryColor = (category: string) => {
    const colors = {
      fleet: 'bg-blue-100 text-blue-800 border-blue-200',
      compliance: 'bg-green-100 text-green-800 border-green-200',
      operations: 'bg-purple-100 text-purple-800 border-purple-200',
      financial: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      general: 'bg-gray-100 text-gray-800 border-gray-200',
      reports: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      maintenance: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[category as keyof typeof colors] || colors.general;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return colors[priority as keyof typeof colors] || colors.low;
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'sending':
        return <Loader2 className="w-3 h-3 animate-spin text-blue-500" />;
      case 'sent':
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'delivered':
        return <CheckCircle2 className="w-3 h-3 text-blue-500" />;
      case 'error':
        return <XCircle className="w-3 h-3 text-red-500" />;
      default:
        return null;
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date(),
      type: 'text',
      status: 'sending'
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Show notification
    setNotificationMessage(content);
    setShowNotification(true);

    // Update message status to sent
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id ? { ...msg, status: 'sent' } : msg
      ));
    }, 500);

    const typingMessage: Message = {
      id: 'typing',
      content: '',
      sender: 'kairo',
      timestamp: new Date(),
      type: 'text',
      isTyping: true
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      // Check if AI service is available
      if (!import.meta.env.VITE_OPENAI_API_KEY && !import.meta.env.VITE_ANTHROPIC_API_KEY) {
        const demoResponses = [
          "Easy! Here you go. I've analyzed your fleet data and found several optimization opportunities. Your current routes could be improved by 15% efficiency. Would you like me to generate an optimized route plan?",
          "No problem! Here's what I recommend: Based on your compliance records, 3 vehicles have MOT due within the next 7 days. I recommend scheduling these inspections immediately to avoid any compliance issues.",
          "Easy! Here you go. Your fuel costs have increased by 8% this month compared to last month. I can help you identify the causes and suggest cost-saving measures.",
          "No problem! Here's what I recommend: I've detected 2 maintenance alerts for your fleet. Vehicle ID #VH001 needs brake inspection and #VH003 requires oil change. Should I schedule these maintenance tasks?",
          "Easy! Here you go. Your fleet utilization rate is currently at 78%. I can help you optimize vehicle assignments to increase this to 85% while maintaining service quality."
        ];
        const randomResponse = demoResponses[Math.floor(Math.random() * demoResponses.length)];
        
        setMessages(prev => prev.map(msg => 
          msg.id === 'typing' 
            ? {
                ...msg,
                content: randomResponse,
                isTyping: false,
                status: 'delivered',
                reactions: [
                  { type: 'thumbsUp', count: 0 },
                  { type: 'thumbsDown', count: 0 },
                  { type: 'star', count: 0 }
                ],
                actions: [
                  {
                    label: 'Copy Response',
                    action: 'copy',
                    icon: <Copy className="w-3 h-3" />
                  },
                  {
                    label: 'Save to Notes',
                    action: 'save',
                    icon: <Bookmark className="w-3 h-3" />
                  }
                ]
              }
            : msg
        ));
        
        if (kairoSettings.autoSpeak && 'speechSynthesis' in window) {
          speakText(randomResponse);
        }
        return;
      }

      const response = await aiService.chat(content, user?.id || 'anonymous', 'gpt4');

      setMessages(prev => prev.map(msg => 
        msg.id === 'typing' 
          ? {
              ...msg,
              content: response,
              isTyping: false,
              status: 'delivered',
              reactions: [
                { type: 'thumbsUp', count: 0 },
                { type: 'thumbsDown', count: 0 },
                { type: 'star', count: 0 }
              ],
              actions: [
                {
                  label: 'Copy Response',
                  action: 'copy',
                  icon: <Copy className="w-3 h-3" />
                },
                {
                  label: 'Save to Notes',
                  action: 'save',
                  icon: <Bookmark className="w-3 h-3" />
                }
              ]
            }
          : msg
      ));

      // Auto-speak response if voice is enabled
      if (kairoSettings.autoSpeak && 'speechSynthesis' in window) {
        speakText(response);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = error.message?.includes('API_KEY') || error.message?.includes('not initialized')
        ? "I'm currently in demo mode. To enable full AI capabilities, please configure your API keys in the environment variables. For now, I can provide helpful suggestions and demonstrate the interface features!"
        : 'Sorry, I encountered an error. Please try again.';

      setMessages(prev => prev.map(msg => 
        msg.id === 'typing' 
          ? {
              ...msg,
              content: errorMessage,
              isTyping: false,
              status: 'error'
            }
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: SmartSuggestion) => {
    handleSendMessage(suggestion.text);
    setShowSuggestions(false);
  };

  const handleReaction = (messageId: string, reactionType: 'thumbsUp' | 'thumbsDown' | 'star') => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId && msg.reactions
        ? {
            ...msg,
            reactions: msg.reactions.map(r => 
              r.type === reactionType 
                ? { ...r, count: r.count + 1 }
                : r
            )
          }
        : msg
    ));
  };

  const handleAction = (action: string, content: string) => {
    switch (action) {
      case 'copy':
        navigator.clipboard.writeText(content);
        break;
      case 'save':
        const savedNotes = JSON.parse(localStorage.getItem('kairo-notes') || '[]');
        savedNotes.push({
          content,
          timestamp: new Date().toISOString(),
          category: 'ai-response'
        });
        localStorage.setItem('kairo-notes', JSON.stringify(savedNotes));
        break;
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window && kairoSettings.voiceEnabled) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = kairoSettings.voiceSpeed;
      utterance.pitch = kairoSettings.voicePitch;
      utterance.volume = kairoSettings.voiceVolume;

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      speechSynthesis.speak(utterance);
    }
  };

  const startVoiceInput = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        const duration = "18 sec"; // Mock duration
        
        // Add voice message with transcription
        const voiceMessage: Message = {
          id: Date.now().toString(),
          content: `I've got a lunch meeting with Sarah tomorrow at noon. Can you adjust my schedule to fit this in?`,
          sender: 'user',
          timestamp: new Date(),
          type: 'voice',
          status: 'delivered',
          voiceRecording: {
            duration,
            transcription: transcript
          }
        };
        setMessages(prev => [...prev, voiceMessage]);
        
        // Send the transcribed message
        handleSendMessage(transcript);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    }
  };

  const stopVoiceInput = () => {
    setIsListening(false);
  };

  const clearChat = () => {
    setMessages([]);
    setShowSuggestions(true);
  };

  const handleNotificationClose = () => {
    setShowNotification(false);
  };

  const handleNotificationOpen = () => {
    setShowNotification(false);
    // Focus on the input field to show the full message
    inputRef.current?.focus();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
    
    // Add file message
    const fileMessage: Message = {
      id: Date.now().toString(),
      content: `Could you compile a list of the top-performing tech startups in Europe and export it as a spreadsheet?`,
      sender: 'user',
      timestamp: new Date(),
      type: 'file',
      status: 'delivered',
      attachments: files.map(file => ({
        name: file.name,
        type: file.type.includes('pdf') ? 'pdf' : 
              file.type.includes('image') ? 'image' : 
              file.type.includes('spreadsheet') ? 'spreadsheet' : 
              file.type.includes('csv') ? 'csv' : 'document',
        size: `${(file.size / 1024).toFixed(1)} KB`
      }))
    };
    setMessages(prev => [...prev, fileMessage]);
  };

  if (isMinimized) {
    return (
      <TooltipProvider>
        <div className="fixed bottom-4 right-4 z-50">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => setIsMinimized(false)}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={`w-12 h-12 rounded-full shadow-lg border-2 border-white transition-all duration-300 ${
                  isHovered 
                    ? 'bg-black scale-110 shadow-xl' 
                    : 'bg-black'
                }`}
              >
                <Bot className={`w-6 h-6 text-white transition-transform duration-300 ${
                  isHovered ? 'scale-110' : 'scale-100'
                }`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Open Kairo AI Assistant</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    );
  }

  // If AI is not open, show just the toggle button
  if (!isOpen) {
    return (
      <TooltipProvider>
        <div className="fixed bottom-4 right-4 z-50">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => setIsOpen(true)}
                className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
              >
                <Bot className="w-6 h-6 text-white" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-xs">
              <div className="space-y-2">
                <p className="font-semibold">🤖 AI Assistant</p>
                <p className="text-sm text-gray-600">
                  Get help with fleet management, compliance, routes, and more!
                </p>
                <div className="text-xs text-gray-500 mt-2">
                  <p>💡 Quick suggestions available</p>
                  <p>🎯 Smart task automation</p>
                  <p>📊 Real-time insights</p>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <div className={`fixed bottom-4 right-4 z-50 transition-all duration-500 ease-in-out ${
        isExpanded ? 'w-[480px] h-[680px]' : 'w-[420px] h-[600px]'
      }`}>
        <Card className="w-full h-full shadow-2xl border border-gray-200 bg-white flex flex-col overflow-hidden">
          {/* Modern Header */}
          <CardHeader className="pb-3 border-b bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Kairo
                  </CardTitle>
                  <p className="text-xs text-gray-600">
                    {!import.meta.env.VITE_OPENAI_API_KEY && !import.meta.env.VITE_ANTHROPIC_API_KEY
                      ? 'Demo Mode'
                      : 'AI Assistant'
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSettings(true)}
                      className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Settings</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsMinimized(!isMinimized)}
                      className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    >
                      {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isMinimized ? 'Expand' : 'Minimize'}</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                      className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Close AI Assistant</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </CardHeader>

          {/* Messages Area */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-lg p-3 ${
                      message.sender === 'user' 
                        ? 'bg-gray-100 text-gray-900' 
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}>
                      <div className="flex items-start gap-3">
                        {message.sender === 'kairo' && (
                          <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Bot className="w-3 h-3 text-white" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          {/* Voice Recording Display */}
                          {message.voiceRecording && (
                            <div className="mb-3">
                              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                <Play className="w-4 h-4 text-gray-600" />
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div className="bg-gray-600 h-2 rounded-full w-3/4"></div>
                                </div>
                                <span className="text-xs text-gray-600">{message.voiceRecording.duration}</span>
                              </div>
                              <div className="mt-2 text-sm">
                                <span className="font-medium text-gray-700">Transcription:</span>
                                <p className="text-gray-600 mt-1">{message.voiceRecording.transcription}</p>
                              </div>
                            </div>
                          )}
                          
                          <p className="text-sm leading-relaxed">{message.content}</p>
                          
                          {/* File Attachments */}
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-3">
                              {message.attachments.map((attachment, index) => (
                                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
                                  {attachment.type === 'csv' ? (
                                    <FileText className="w-5 h-5 text-green-600" />
                                  ) : attachment.type === 'spreadsheet' ? (
                                    <FileSpreadsheet className="w-5 h-5 text-green-600" />
                                  ) : (
                                    <FileText className="w-5 h-5 text-blue-600" />
                                  )}
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                                    <p className="text-xs text-gray-600">{attachment.size}</p>
                                  </div>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <Download className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Message Actions */}
                          {message.actions && message.actions.length > 0 && (
                            <div className="flex items-center gap-1 mt-3 pt-2 border-t border-gray-200">
                              {message.actions.map((action, index) => (
                                <Tooltip key={index}>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleAction(action.action, message.content)}
                                      className="h-6 px-2 text-xs hover:bg-gray-200"
                                    >
                                      {action.icon}
                                      <span className="ml-1">{action.label}</span>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{action.label}</p>
                                  </TooltipContent>
                                </Tooltip>
                              ))}
                            </div>
                          )}

                          {/* Message Reactions */}
                          {message.reactions && kairoSettings.showReactions && (
                            <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-200">
                              {message.reactions.map((reaction, index) => (
                                <Tooltip key={index}>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleReaction(message.id, reaction.type)}
                                      className="h-5 px-2 text-xs hover:bg-gray-200"
                                    >
                                      {reaction.type === 'thumbsUp' && <ThumbsUp className="w-3 h-3" />}
                                      {reaction.type === 'thumbsDown' && <ThumbsDown className="w-3 h-3" />}
                                      {reaction.type === 'star' && <Star className="w-3 h-3" />}
                                      {reaction.count > 0 && <span className="ml-1">{reaction.count}</span>}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{reaction.type === 'thumbsUp' ? 'Helpful' : reaction.type === 'thumbsDown' ? 'Not Helpful' : 'Star'}</p>
                                  </TooltipContent>
                                </Tooltip>
                              ))}
                            </div>
                          )}

                          <div className={`flex items-center gap-2 mt-2 text-xs ${
                            message.sender === 'user' ? 'text-gray-500' : 'text-gray-500'
                          }`}>
                            <Clock className="w-3 h-3" />
                            {formatTime(message.timestamp)}
                            {getStatusIcon(message.status)}
                            {kairoSettings.typingIndicator && message.isTyping && (
                              <div className="flex items-center gap-1 ml-2">
                                <div className="flex space-x-1">
                                  {[...Array(3)].map((_, i) => (
                                    <div
                                      key={i}
                                      className={`w-1 h-1 bg-gray-400 rounded-full animate-bounce`}
                                      style={{ animationDelay: `${i * 0.1}s` }}
                                    />
                                  ))}
                                </div>
                                <span>Typing...</span>
                              </div>
                            )}
                          </div>
                        </div>
                        {message.sender === 'user' && (
                          <div className="w-6 h-6 bg-gray-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <User className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </div>

          {/* Smart Suggestions */}
          {kairoSettings.smartSuggestions && showSuggestions && messages.length <= 2 && (
            <div className="p-4 border-t bg-gray-50">
              <div className="mb-3">
                <p className="text-sm text-gray-700 mb-2">
                  I'm here to help you tackle your tasks. Choose from the prompts below or just tell me what you need!
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {filteredSuggestions.slice(0, 6).map((suggestion) => (
                  <Tooltip key={suggestion.id}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="justify-start h-auto p-3 text-left hover:bg-white border-gray-200 text-xs"
                      >
                        <div className="flex items-center gap-2 w-full">
                          <div className="flex-shrink-0">
                            {suggestion.icon}
                          </div>
                          <span className="font-medium truncate">
                            {suggestion.text}
                          </span>
                        </div>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <div>
                        <p className="font-medium">{suggestion.text}</p>
                        {suggestion.description && (
                          <p className="text-sm text-gray-600 mt-1">{suggestion.description}</p>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t bg-white">
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                  placeholder="Ask me anything..."
                  className="pr-16 resize-none"
                  disabled={isLoading}
                />
                <div className="absolute right-2 bottom-2 flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowFileUpload(!showFileUpload)}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                      >
                        <Paperclip className="w-3 h-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Attach files</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={isListening ? stopVoiceInput : startVoiceInput}
                        className={`h-6 w-6 p-0 ${
                          isListening ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        {isListening ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{isListening ? 'Stop recording' : 'Voice input'}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => handleSendMessage(inputValue)}
                    disabled={!inputValue.trim() || isLoading}
                    className="bg-black hover:bg-gray-800 text-white px-3 py-2 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Send message</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span>Kairo v1.0</span>
              <div className="flex items-center gap-4">
                <span>Shortcuts</span>
                <span className="flex items-center gap-1">
                  <Paperclip className="w-3 h-3" />
                  Attach
                </span>
              </div>
            </div>

            {/* File Upload Area */}
            {showFileUpload && (
              <div className="mt-2 p-2 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Attach files</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs"
                  >
                    Choose Files
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.csv"
                />
                {selectedFiles.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between text-xs bg-white p-2 rounded">
                        <span className="truncate">{file.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== index))}
                          className="h-4 w-4 p-0 text-red-500 hover:text-red-700"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Settings Modal */}
        {showSettings && (
          <KairoSettings
            settings={kairoSettings}
            onSettingsChange={setKairoSettings}
            onClose={() => setShowSettings(false)}
          />
        )}

        {/* Notification */}
        <KairoNotification
          message={notificationMessage}
          isVisible={showNotification}
          onClose={handleNotificationClose}
          onOpenMessage={handleNotificationOpen}
        />
      </div>
    </TooltipProvider>
  );
};
