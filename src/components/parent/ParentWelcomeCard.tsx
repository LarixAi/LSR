
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Heart, Users, Shield, Clock } from 'lucide-react';

const ParentWelcomeCard = () => {
  const { profile } = useAuth();

  const currentHour = new Date().getHours();
  const getGreeting = () => {
    if (currentHour < 12) return 'Good morning';
    if (currentHour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getMotivationalMessage = () => {
    const messages = [
      "Your child's safety is our top priority.",
      "Every journey matters when it comes to your family.",
      "We're here to make transportation worry-free for you.",
      "Your trust in us drives everything we do.",
      "Safe travels start with caring parents like you."
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  return (
    <Card className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white border-0 shadow-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold mb-2">
              {getGreeting()}, {profile?.first_name || 'Parent'}! 👋
            </CardTitle>
            <CardDescription className="text-teal-100 text-lg">
              {getMotivationalMessage()}
            </CardDescription>
          </div>
          <div className="hidden md:block">
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center">
              <Heart className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 bg-white/10 rounded-lg p-3">
            <Shield className="w-8 h-8 text-white" />
            <div>
              <p className="font-semibold">Safe Transport</p>
              <p className="text-sm text-teal-100">Trusted drivers & vehicles</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 bg-white/10 rounded-lg p-3">
            <Clock className="w-8 h-8 text-white" />
            <div>
              <p className="font-semibold">Real-time Updates</p>
              <p className="text-sm text-teal-100">Live tracking & notifications</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 bg-white/10 rounded-lg p-3">
            <Users className="w-8 h-8 text-white" />
            <div>
              <p className="font-semibold">Family Care</p>
              <p className="text-sm text-teal-100">Personalized attention</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ParentWelcomeCard;
