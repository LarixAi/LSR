
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Smartphone, Apple, Play, Share } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AppDownloadSection = () => {
  const { toast } = useToast();

  const handleShareApp = async () => {
    const appUrl = window.location.origin;
    
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
    const appUrl = window.location.origin;
    window.open(appUrl, '_blank');
    
    toast({
      title: "Install App",
      description: "Add LSR to your home screen for the best mobile experience.",
    });
  };

  return (
    <section id="download" className="py-20 bg-gradient-to-r from-blue-50 to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Get the Mobile App</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Download LSR for your mobile device for better access and notifications
          </p>
        </div>

        <Card className="border-0 shadow-lg bg-white">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold mb-2 text-lg">Web App</h3>
                <p className="text-sm text-gray-600 mb-4">Install as a web app on any device</p>
                <Button 
                  onClick={handleInstallPWA}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Install Now
                </Button>
              </div>

              <div className="text-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
                <div className="w-16 h-16 bg-gradient-to-r from-gray-700 to-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Apple className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold mb-2 text-lg">iOS App</h3>
                <p className="text-sm text-gray-600 mb-4">Native iOS app coming soon</p>
                <Button 
                  variant="outline" 
                  disabled
                  className="w-full"
                >
                  Coming Soon
                </Button>
              </div>

              <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold mb-2 text-lg">Android App</h3>
                <p className="text-sm text-gray-600 mb-4">Native Android app coming soon</p>
                <Button 
                  variant="outline" 
                  disabled
                  className="w-full"
                >
                  Coming Soon
                </Button>
              </div>
            </div>

            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h4 className="font-semibold text-lg">Share with Team</h4>
                  <p className="text-sm text-gray-600">Send the app link to your team members</p>
                </div>
                <Button onClick={handleShareApp} variant="outline" className="bg-white">
                  <Share className="w-4 h-4 mr-2" />
                  Share App
                </Button>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 text-center">
                <strong>Tip:</strong> Add this app to your home screen for quick access and offline capabilities!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default AppDownloadSection;
