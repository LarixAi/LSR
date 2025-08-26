import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Settings, Cookie, Shield, Info } from 'lucide-react';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

const CookieConsent: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Always required
    analytics: false,
    marketing: false,
    functional: false
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setShowBanner(true);
    } else {
      const savedPreferences = JSON.parse(consent);
      setPreferences(savedPreferences);
    }
  }, []);

  const acceptAll = () => {
    const allAccepted = {
      essential: true,
      analytics: true,
      marketing: true,
      functional: true
    };
    setPreferences(allAccepted);
    localStorage.setItem('cookie_consent', JSON.stringify(allAccepted));
    setShowBanner(false);
    // Apply analytics and marketing cookies
    enableAnalytics();
    enableMarketing();
  };

  const acceptEssential = () => {
    const essentialOnly = {
      essential: true,
      analytics: false,
      marketing: false,
      functional: false
    };
    setPreferences(essentialOnly);
    localStorage.setItem('cookie_consent', JSON.stringify(essentialOnly));
    setShowBanner(false);
  };

  const savePreferences = () => {
    localStorage.setItem('cookie_consent', JSON.stringify(preferences));
    setShowSettings(false);
    
    // Apply cookies based on preferences
    if (preferences.analytics) enableAnalytics();
    if (preferences.marketing) enableMarketing();
    if (preferences.functional) enableFunctional();
  };

  const enableAnalytics = () => {
    // Enable Google Analytics, Hotjar, etc.
    console.log('Analytics cookies enabled');
    // Add your analytics initialization here
  };

  const enableMarketing = () => {
    // Enable marketing cookies
    console.log('Marketing cookies enabled');
    // Add your marketing cookie initialization here
  };

  const enableFunctional = () => {
    // Enable functional cookies
    console.log('Functional cookies enabled');
    // Add your functional cookie initialization here
  };

  const updatePreference = (type: keyof CookiePreferences, value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [type]: value
    }));
  };

  if (!showBanner && !showSettings) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSettings(true)}
          className="flex items-center gap-2"
        >
          <Settings className="w-4 h-4" />
          Cookie Settings
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Cookie Banner */}
      {showBanner && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50 shadow-lg">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Cookie className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">We use cookies</h3>
              </div>
              <p className="text-sm text-gray-600">
                We use cookies to enhance your experience, analyze site usage, and assist in our marketing efforts. 
                Essential cookies are required for the site to function properly.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(true)}
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Customize
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={acceptEssential}
              >
                Essential Only
              </Button>
              <Button
                size="sm"
                onClick={acceptAll}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Accept All
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Cookie Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Cookie className="w-5 h-5" />
              Cookie Preferences
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <p className="text-sm text-gray-600">
              Manage your cookie preferences. Essential cookies are required for the website to function and cannot be disabled.
            </p>

            {/* Essential Cookies */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <h4 className="font-medium">Essential Cookies</h4>
                </div>
                <Badge className="bg-green-100 text-green-800">Always Active</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Required for the website to function properly. These cookies enable basic functionality like page navigation and access to secure areas.
              </p>
              <div className="text-xs text-gray-500">
                Examples: Authentication, session management, security features
              </div>
            </div>

            {/* Analytics Cookies */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-600" />
                  <h4 className="font-medium">Analytics Cookies</h4>
                </div>
                <Switch
                  checked={preferences.analytics}
                  onCheckedChange={(checked) => updatePreference('analytics', checked)}
                />
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Help us understand how visitors interact with our website by collecting and reporting information anonymously.
              </p>
              <div className="text-xs text-gray-500">
                Examples: Google Analytics, Hotjar, page view tracking
              </div>
            </div>

            {/* Functional Cookies */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-purple-600" />
                  <h4 className="font-medium">Functional Cookies</h4>
                </div>
                <Switch
                  checked={preferences.functional}
                  onCheckedChange={(checked) => updatePreference('functional', checked)}
                />
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Enable enhanced functionality and personalization, such as remembering your preferences and settings.
              </p>
              <div className="text-xs text-gray-500">
                Examples: Language preferences, user interface customization
              </div>
            </div>

            {/* Marketing Cookies */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Cookie className="w-4 h-4 text-orange-600" />
                  <h4 className="font-medium">Marketing Cookies</h4>
                </div>
                <Switch
                  checked={preferences.marketing}
                  onCheckedChange={(checked) => updatePreference('marketing', checked)}
                />
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Used to track visitors across websites to display relevant and engaging advertisements.
              </p>
              <div className="text-xs text-gray-500">
                Examples: Social media pixels, advertising networks
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setPreferences({
                    essential: true,
                    analytics: false,
                    marketing: false,
                    functional: false
                  });
                }}
                className="flex-1"
              >
                Essential Only
              </Button>
              <Button
                onClick={() => {
                  setPreferences({
                    essential: true,
                    analytics: true,
                    marketing: true,
                    functional: true
                  });
                }}
                className="flex-1"
              >
                Accept All
              </Button>
              <Button
                onClick={savePreferences}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Save Preferences
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CookieConsent;

