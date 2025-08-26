import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Settings, 
  Volume2, 
  Mic, 
  Palette, 
  Bot, 
  Zap,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  Maximize2,
  ThumbsUp,
  Paperclip
} from 'lucide-react';

interface KairoSettings {
  voiceEnabled: boolean;
  voiceSpeed: number;
  voicePitch: number;
  voiceVolume: number;
  autoSpeak: boolean;
  smartSuggestions: boolean;
  typingIndicator: boolean;
  theme: 'light' | 'dark' | 'auto';
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size: 'small' | 'medium' | 'large';
  personality: 'professional' | 'friendly' | 'efficient' | 'detailed';
  autoExpand: boolean;
  showReactions: boolean;
  showAttachments: boolean;
}

interface KairoSettingsProps {
  settings: KairoSettings;
  onSettingsChange: (settings: KairoSettings) => void;
  onClose: () => void;
}

export const KairoSettings: React.FC<KairoSettingsProps> = ({
  settings,
  onSettingsChange,
  onClose
}) => {
  const [localSettings, setLocalSettings] = useState<KairoSettings>(settings);

  const handleSettingChange = (key: keyof KairoSettings, value: any) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
  };

  const handleSave = () => {
    onSettingsChange(localSettings);
    onClose();
  };

  const handleReset = () => {
    const defaultSettings: KairoSettings = {
      voiceEnabled: true,
      voiceSpeed: 0.9,
      voicePitch: 1,
      voiceVolume: 0.8,
      autoSpeak: true,
      smartSuggestions: true,
      typingIndicator: true,
      theme: 'auto',
      position: 'bottom-right',
      size: 'medium',
      personality: 'professional',
      autoExpand: false,
      showReactions: true,
      showAttachments: true
    };
    setLocalSettings(defaultSettings);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-96 max-h-[80vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              <CardTitle>Kairo Settings</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Voice Settings */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              Voice Settings
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="voice-enabled">Voice Enabled</Label>
                <Switch
                  id="voice-enabled"
                  checked={localSettings.voiceEnabled}
                  onCheckedChange={(checked) => handleSettingChange('voiceEnabled', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label>Voice Speed</Label>
                <Slider
                  value={[localSettings.voiceSpeed]}
                  onValueChange={([value]) => handleSettingChange('voiceSpeed', value)}
                  max={2}
                  min={0.5}
                  step={0.1}
                  className="w-full"
                />
                <div className="text-xs text-gray-500">
                  {localSettings.voiceSpeed.toFixed(1)}x
                </div>
              </div>

              <div className="space-y-2">
                <Label>Voice Pitch</Label>
                <Slider
                  value={[localSettings.voicePitch]}
                  onValueChange={([value]) => handleSettingChange('voicePitch', value)}
                  max={2}
                  min={0.5}
                  step={0.1}
                  className="w-full"
                />
                <div className="text-xs text-gray-500">
                  {localSettings.voicePitch.toFixed(1)}x
                </div>
              </div>

              <div className="space-y-2">
                <Label>Voice Volume</Label>
                <Slider
                  value={[localSettings.voiceVolume]}
                  onValueChange={([value]) => handleSettingChange('voiceVolume', value)}
                  max={1}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
                <div className="text-xs text-gray-500">
                  {Math.round(localSettings.voiceVolume * 100)}%
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="auto-speak">Auto-speak Responses</Label>
                <Switch
                  id="auto-speak"
                  checked={localSettings.autoSpeak}
                  onCheckedChange={(checked) => handleSettingChange('autoSpeak', checked)}
                />
              </div>
            </div>
          </div>

          {/* Interface Settings */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Interface Settings
            </h3>
            
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select
                  value={localSettings.theme}
                  onValueChange={(value) => handleSettingChange('theme', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="auto">Auto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Position</Label>
                <Select
                  value={localSettings.position}
                  onValueChange={(value) => handleSettingChange('position', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bottom-right">Bottom Right</SelectItem>
                    <SelectItem value="bottom-left">Bottom Left</SelectItem>
                    <SelectItem value="top-right">Top Right</SelectItem>
                    <SelectItem value="top-left">Top Left</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Size</Label>
                <Select
                  value={localSettings.size}
                  onValueChange={(value) => handleSettingChange('size', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Behavior Settings */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Bot className="w-4 h-4" />
              Behavior Settings
            </h3>
            
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Personality</Label>
                <Select
                  value={localSettings.personality}
                  onValueChange={(value) => handleSettingChange('personality', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="efficient">Efficient</SelectItem>
                    <SelectItem value="detailed">Detailed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="smart-suggestions">Smart Suggestions</Label>
                <Switch
                  id="smart-suggestions"
                  checked={localSettings.smartSuggestions}
                  onCheckedChange={(checked) => handleSettingChange('smartSuggestions', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="typing-indicator">Typing Indicator</Label>
                <Switch
                  id="typing-indicator"
                  checked={localSettings.typingIndicator}
                  onCheckedChange={(checked) => handleSettingChange('typingIndicator', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="auto-expand">Auto Expand Interface</Label>
                <Switch
                  id="auto-expand"
                  checked={localSettings.autoExpand}
                  onCheckedChange={(checked) => handleSettingChange('autoExpand', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="show-reactions">Show Message Reactions</Label>
                <Switch
                  id="show-reactions"
                  checked={localSettings.showReactions}
                  onCheckedChange={(checked) => handleSettingChange('showReactions', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="show-attachments">Show File Attachments</Label>
                <Switch
                  id="show-attachments"
                  checked={localSettings.showAttachments}
                  onCheckedChange={(checked) => handleSettingChange('showAttachments', checked)}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
            <Button
              onClick={handleSave}
              className="flex items-center gap-2 ml-auto"
            >
              <Save className="w-4 h-4" />
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
