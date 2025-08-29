import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Palette, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/theme-provider';

interface ThemeColor {
  name: string;
  value: string;
  hue: string;
}

const predefinedColors: ThemeColor[] = [
  { name: 'Green', value: 'green', hue: '142' },
  { name: 'Blue', value: 'blue', hue: '210' },
  { name: 'Purple', value: 'purple', hue: '260' },
  { name: 'Orange', value: 'orange', hue: '30' },
  { name: 'Red', value: 'red', hue: '0' },
  { name: 'Teal', value: 'teal', hue: '180' },
  { name: 'Indigo', value: 'indigo', hue: '240' },
  { name: 'Pink', value: 'pink', hue: '340' },
];

const ThemeSettings = () => {
  const { theme, setTheme } = useTheme();
  const [selectedColor, setSelectedColor] = useState('green');
  const [isCustomColor, setIsCustomColor] = useState(false);
  const [customHue, setCustomHue] = useState('142');

  useEffect(() => {
    // Load saved theme color from localStorage
    const savedColor = localStorage.getItem('themeColor');
    const savedHue = localStorage.getItem('themeHue');
    if (savedColor) {
      setSelectedColor(savedColor);
      if (savedColor === 'custom' && savedHue) {
        setIsCustomColor(true);
        setCustomHue(savedHue);
        applyColorTheme(savedHue);
      } else {
        const color = predefinedColors.find(c => c.value === savedColor);
        if (color) {
          applyColorTheme(color.hue);
        }
      }
    }
  }, []);

  const applyColorTheme = (hue: string) => {
    const root = document.documentElement;
    
    // Update CSS variables for primary color and sidebar
    root.style.setProperty('--primary', `${hue} 72% 40%`);
    root.style.setProperty('--accent', `${hue} 60% 95%`);
    root.style.setProperty('--accent-foreground', `${hue} 72% 35%`);
    root.style.setProperty('--ring', `${hue} 72% 40%`);
    
    // Update sidebar colors
    root.style.setProperty('--sidebar-bg', `${hue} 40% 20%`);
    root.style.setProperty('--sidebar-bg-hover', `${hue} 35% 25%`);
    root.style.setProperty('--sidebar-border', `${hue} 30% 30%`);
    
    // For dark mode
    if (theme === 'dark') {
      root.style.setProperty('--primary', `${hue} 72% 45%`);
      root.style.setProperty('--accent', `${hue} 60% 20%`);
      root.style.setProperty('--accent-foreground', `${hue} 60% 90%`);
      root.style.setProperty('--ring', `${hue} 72% 45%`);
      
      root.style.setProperty('--sidebar-bg', `${hue} 35% 15%`);
      root.style.setProperty('--sidebar-bg-hover', `${hue} 30% 20%`);
      root.style.setProperty('--sidebar-border', `${hue} 25% 25%`);
    }
  };

  const handleColorChange = (value: string) => {
    setSelectedColor(value);
    setIsCustomColor(false);
    
    const color = predefinedColors.find(c => c.value === value);
    if (color) {
      applyColorTheme(color.hue);
      localStorage.setItem('themeColor', value);
      localStorage.setItem('themeHue', color.hue);
      toast.success(`Theme color changed to ${color.name}`);
    }
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hue = e.target.value;
    setCustomHue(hue);
    setIsCustomColor(true);
    setSelectedColor('custom');
    
    applyColorTheme(hue);
    localStorage.setItem('themeColor', 'custom');
    localStorage.setItem('themeHue', hue);
  };

  const handleThemeToggle = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    
    // Reapply color theme with new mode
    const savedHue = localStorage.getItem('themeHue') || '142';
    applyColorTheme(savedHue);
    
    toast.success(`Switched to ${newTheme} mode`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Theme & Appearance
        </CardTitle>
        <CardDescription>
          Customize the look and feel of your application
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Light/Dark Mode Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="theme-mode" className="text-base">
              Dark Mode
            </Label>
            <p className="text-sm text-muted-foreground">
              Toggle between light and dark themes
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4 text-muted-foreground" />
            <Switch
              id="theme-mode"
              checked={theme === 'dark'}
              onCheckedChange={handleThemeToggle}
            />
            <Moon className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {/* Theme Color Selection */}
        <div className="space-y-3">
          <Label className="text-base">Theme Color</Label>
          <p className="text-sm text-muted-foreground">
            Choose your preferred accent color
          </p>
          
          <RadioGroup value={selectedColor} onValueChange={handleColorChange}>
            <div className="grid grid-cols-4 gap-3">
              {predefinedColors.map((color) => (
                <div key={color.value} className="relative">
                  <RadioGroupItem
                    value={color.value}
                    id={color.value}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={color.value}
                    className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-card p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer transition-all"
                  >
                    <div
                      className="w-8 h-8 rounded-full mb-2"
                      style={{
                        backgroundColor: `hsl(${color.hue}, 72%, 40%)`,
                      }}
                    />
                    <span className="text-xs font-medium">{color.name}</span>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        {/* Custom Color Picker */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="custom-color"
              checked={isCustomColor}
              onChange={(e) => setIsCustomColor(e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="custom-color" className="text-base">
              Use Custom Color
            </Label>
          </div>
          
          {isCustomColor && (
            <div className="space-y-2">
              <Label htmlFor="hue-slider" className="text-sm">
                Color Hue: {customHue}°
              </Label>
              <input
                id="hue-slider"
                type="range"
                min="0"
                max="360"
                value={customHue}
                onChange={handleCustomColorChange}
                className="w-full h-2 bg-gradient-to-r from-red-500 via-green-500 to-blue-500 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, 
                    hsl(0, 72%, 50%), 
                    hsl(60, 72%, 50%), 
                    hsl(120, 72%, 50%), 
                    hsl(180, 72%, 50%), 
                    hsl(240, 72%, 50%), 
                    hsl(300, 72%, 50%), 
                    hsl(360, 72%, 50%)
                  )`,
                }}
              />
              <div
                className="w-full h-12 rounded-lg border"
                style={{
                  backgroundColor: `hsl(${customHue}, 72%, 40%)`,
                }}
              />
            </div>
          )}
        </div>

        <div className="pt-4">
          <Button
            onClick={() => {
              // Reset to default
              handleColorChange('green');
              setIsCustomColor(false);
              setCustomHue('142');
            }}
            variant="outline"
            className="w-full"
          >
            Reset to Default
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ThemeSettings;