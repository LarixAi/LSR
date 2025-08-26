
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Smartphone, Apple, Play, Share } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AppDownloadSection = () => {
  const { toast } = useToast();

  const handleShareApp = async () => {
    const appUrl = 'https://f96b0203-03cf-43b5-962a-a450cf703f22.lovableproject.com';
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'LSR - Logistics Solution Resources',
          text: 'Download the LSR mobile app for better transport management',
          url: appUrl,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(appUrl);
        toast({
          title: "Link Copied!",
          description: "App download link has been copied to your clipboard.",
        });
      } catch (error) {
        toast({
          title: "Share",
          description: `Share this link: ${appUrl}`,
        });
      }
    }
  };

  const handleInstallPWA = () => {
    // This will be enhanced when PWA capabilities are added
    const appUrl = 'https://f96b0203-03cf-43b5-962a-a450cf703f22.lovableproject.com';
    window.open(appUrl, '_blank');
    
    toast({
      title: "Install App",
      description: "Add LSR to your home screen for the best mobile experience.",
    });
  };

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-green-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-xl">
          <Download className="w-6 h-6 text-primary" />
          <span>Get the Mobile App</span>
        </CardTitle>
        <CardDescription className="text-base">
          Download LSR for your mobile device for better access and notifications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-card rounded-lg border border-border">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Smartphone className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-semibold mb-2">Web App</h3>
            <p className="text-sm text-muted-foreground mb-4">Install as a web app on any device</p>
            <Button 
              onClick={handleInstallPWA}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Install Now
            </Button>
          </div>

          <div className="text-center p-4 bg-card rounded-lg border border-border">
            <div className="w-16 h-16 bg-gradient-to-r from-gray-700 to-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Apple className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-semibold mb-2">iOS App</h3>
            <p className="text-sm text-muted-foreground mb-4">Native iOS app coming soon</p>
            <Button 
              variant="outline" 
              disabled
              className="w-full"
            >
              Coming Soon
            </Button>
          </div>

          <div className="text-center p-4 bg-card rounded-lg border border-border">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-semibold mb-2">Android App</h3>
            <p className="text-sm text-muted-foreground mb-4">Native Android app coming soon</p>
            <Button 
              variant="outline" 
              disabled
              className="w-full"
            >
              Coming Soon
            </Button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-card rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">Share with Team</h4>
              <p className="text-sm text-muted-foreground">Send the app link to your team members</p>
            </div>
            <Button onClick={handleShareApp} variant="outline">
              <Share className="w-4 h-4 mr-2" />
              Share App
            </Button>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> Add this app to your home screen for quick access and offline capabilities!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AppDownloadSection;
