
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Calendar 
} from 'lucide-react';

interface DocumentStatsCardsProps {
  stats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    expiring: number;
  };
}

const DocumentStatsCards = ({ stats }: DocumentStatsCardsProps) => {
  const statCards = [
    {
      title: 'Total',
      value: stats.total,
      icon: FileText,
      color: 'text-blue-500'
    },
    {
      title: 'Pending Review',
      value: stats.pending,
      icon: Clock,
      color: 'text-yellow-500',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Approved',
      value: stats.approved,
      icon: CheckCircle,
      color: 'text-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'Rejected',
      value: stats.rejected,
      icon: AlertTriangle,
      color: 'text-red-500',
      textColor: 'text-red-600'
    },
    {
      title: 'Expiring Soon',
      value: stats.expiring,
      icon: Calendar,
      color: 'text-orange-500',
      textColor: 'text-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {statCards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className={`text-2xl font-bold ${card.textColor || ''}`}>
                    {card.value}
                  </p>
                </div>
                <Icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default DocumentStatsCards;
