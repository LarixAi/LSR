
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus, DollarSign, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

const FleetKPIMetrics = () => {
  const kpiData = [
    {
      id: 1,
      name: 'Fleet Availability',
      value: 95.0,
      unit: '%',
      target: 98.0,
      trend: 'up',
      change: 2.5,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      id: 2,
      name: 'Avg Maintenance Cost',
      value: 2500,
      unit: '$',
      target: 2000,
      trend: 'down',
      change: -5.2,
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      id: 3,
      name: 'Maintenance Compliance',
      value: 92.0,
      unit: '%',
      target: 95.0,
      trend: 'up',
      change: 1.8,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      id: 4,
      name: 'Avg Response Time',
      value: 4.5,
      unit: 'hrs',
      target: 2.0,
      trend: 'down',
      change: -0.8,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getProgressPercentage = (value: number, target: number) => {
    if (target === 0) return 0;
    return Math.min((value / target) * 100, 100);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpiData.map((kpi) => {
        const Icon = kpi.icon;
        const progressPercentage = getProgressPercentage(kpi.value, kpi.target);
        
        return (
          <Card key={kpi.id} className={`${kpi.borderColor} border-l-4`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {kpi.name}
              </CardTitle>
              <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                <Icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-baseline space-x-2">
                  <div className="text-2xl font-bold">
                    {kpi.value.toLocaleString()}
                    <span className="text-sm font-normal text-gray-500 ml-1">
                      {kpi.unit}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(kpi.trend)}
                    <span className={`text-xs ${
                      kpi.trend === 'up' ? 'text-green-600' : 
                      kpi.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {Math.abs(kpi.change)}%
                    </span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Target: {kpi.target}{kpi.unit}</span>
                    <span>{progressPercentage.toFixed(0)}%</span>
                  </div>
                  <Progress 
                    value={progressPercentage} 
                    className="h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default FleetKPIMetrics;
