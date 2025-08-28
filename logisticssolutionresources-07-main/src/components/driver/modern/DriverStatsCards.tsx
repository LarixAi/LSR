import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Calendar, 
  Clock, 
  TrendingUp, 
  Target,
  Activity,
  BarChart3,
  Trophy,
  Star
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  gradient?: string;
  delay?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, gradient = 'bg-glass', delay = '0s' }) => {
  const cardClass = gradient.includes('gradient') 
    ? `${gradient} text-white card-hover animate-scale-in border-0`
    : `${gradient} border-primary/20 card-hover animate-scale-in`;

  return (
    <Card className={cardClass} style={{ animationDelay: delay }}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-medium mb-1 ${gradient.includes('gradient') ? 'text-white/80' : 'text-muted-foreground'}`}>
              {title}
            </p>
            <p className={`text-3xl font-bold ${gradient.includes('gradient') ? 'text-white' : 'text-gradient'}`}>
              {value}
            </p>
            {subtitle && (
              <p className={`text-xs mt-1 ${gradient.includes('gradient') ? 'text-white/60' : 'text-muted-foreground'}`}>
                {subtitle}
              </p>
            )}
          </div>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            gradient.includes('gradient') ? 'bg-white/20' : 'bg-primary/20'
          }`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface DriverStatsCardsProps {
  todayJobs: number;
  hoursWorked: number;
  distanceKm: number;
  efficiency: number;
}

const DriverStatsCards: React.FC<DriverStatsCardsProps> = ({ 
  todayJobs, 
  hoursWorked, 
  distanceKm, 
  efficiency 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Today's Jobs"
        value={todayJobs}
        subtitle="2 completed"
        icon={<Calendar className="w-6 h-6 text-white/80" />}
        gradient="bg-gradient-primary"
        delay="0s"
      />
      
      <StatCard
        title="Hours Driven"
        value={hoursWorked}
        subtitle="Today"
        icon={<Clock className="w-6 h-6 text-white/80" />}
        gradient="bg-gradient-secondary"
        delay="0.1s"
      />
      
      <StatCard
        title="Distance"
        value={`${distanceKm}km`}
        subtitle="This week"
        icon={<TrendingUp className="w-6 h-6 text-white/80" />}
        gradient="bg-gradient-accent"
        delay="0.2s"
      />
      
      <StatCard
        title="Efficiency"
        value={`${efficiency}%`}
        subtitle="↑ 4% from last week"
        icon={<Target className="w-6 h-6 text-primary" />}
        gradient="bg-glass"
        delay="0.3s"
      />
    </div>
  );
};

export default DriverStatsCards;