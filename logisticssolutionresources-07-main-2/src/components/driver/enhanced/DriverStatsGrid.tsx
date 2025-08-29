import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon } from 'lucide-react';

interface StatItem {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  trend: string;
}

interface DriverStatsGridProps {
  stats: StatItem[];
  isMobile: boolean;
}

const DriverStatsGrid: React.FC<DriverStatsGridProps> = ({ stats, isMobile }) => {
  return (
    <div className={`grid ${isMobile ? 'grid-cols-2 gap-4' : 'grid-cols-2 lg:grid-cols-4 gap-6'}`}>
      {stats.map((stat, index) => (
        <Card key={index} className="group bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] rounded-2xl overflow-hidden">
          <CardContent className={`${isMobile ? 'p-4' : 'p-6'} relative`}>
            {/* Background Accent */}
            <div className={`absolute top-0 right-0 w-20 h-20 ${stat.bgColor} rounded-full opacity-10 transform translate-x-6 -translate-y-6`}></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} ${stat.bgColor} rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} ${stat.color}`} />
                </div>
                <Badge variant="secondary" className={`${isMobile ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1'} bg-gray-100 text-gray-700 font-semibold`}>
                  {stat.trend}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <p className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-600 font-medium`}>
                  {stat.title}
                </p>
                <p className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold text-gray-900 leading-none`}>
                  {stat.value}
                </p>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-500`}>
                  {stat.description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DriverStatsGrid;