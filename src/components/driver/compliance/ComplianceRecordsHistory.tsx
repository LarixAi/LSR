
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { format } from 'date-fns';

interface ComplianceRecordsHistoryProps {
  driverId: string;
}

const ComplianceRecordsHistory: React.FC<ComplianceRecordsHistoryProps> = ({ driverId }) => {
  // Mock compliance history data
  const complianceHistory = [
    {
      id: '1',
      date: '2024-06-01',
      type: 'Monthly Assessment',
      score: 87,
      previousScore: 82,
      category: 'Overall Compliance',
      notes: 'Improved vehicle inspection scores, completed safety training',
      status: 'passed'
    },
    {
      id: '2',
      date: '2024-05-15',
      type: 'Training Completion',
      score: 95,
      previousScore: null,
      category: 'Safety Education',
      notes: 'Completed Vehicle Safety Inspection module with distinction',
      status: 'passed'
    },
    {
      id: '3',
      date: '2024-05-01',
      type: 'Monthly Assessment',
      score: 82,
      previousScore: 78,
      category: 'Overall Compliance',
      notes: 'Minor documentation issues resolved, good driving record',
      status: 'passed'
    },
    {
      id: '4',
      date: '2024-04-20',
      type: 'Incident Review',
      score: 75,
      previousScore: 85,
      category: 'Safety Incident',
      notes: 'Minor speed violation - attended additional training as required',
      status: 'remedial_action'
    },
    {
      id: '5',
      date: '2024-04-01',
      type: 'Monthly Assessment',
      score: 85,
      previousScore: 83,
      category: 'Overall Compliance',
      notes: 'Consistent performance, all documentation up to date',
      status: 'passed'
    },
    {
      id: '6',
      date: '2024-03-15',
      type: 'License Verification',
      score: 100,
      previousScore: null,
      category: 'Documentation',
      notes: 'All licenses verified and up to date',
      status: 'passed'
    }
  ];

  const getScoreTrend = (current: number, previous: number | null) => {
    if (previous === null) return { icon: Minus, color: 'text-gray-500' };
    if (current > previous) return { icon: TrendingUp, color: 'text-green-500' };
    if (current < previous) return { icon: TrendingDown, color: 'text-red-500' };
    return { icon: Minus, color: 'text-gray-500' };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'passed':
        return <Badge className="bg-green-100 text-green-800">Passed</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case 'remedial_action':
        return <Badge className="bg-yellow-100 text-yellow-800">Remedial Action</Badge>;
      case 'pending':
        return <Badge className="bg-blue-100 text-blue-800">Pending</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Overall Compliance': return 'text-blue-600';
      case 'Safety Education': return 'text-green-600';
      case 'Documentation': return 'text-purple-600';
      case 'Safety Incident': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const averageScore = Math.round(
    complianceHistory.reduce((sum, record) => sum + record.score, 0) / complianceHistory.length
  );

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{averageScore}</p>
              <p className="text-sm text-gray-600">Average Score</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {complianceHistory.filter(r => r.status === 'passed').length}
              </p>
              <p className="text-sm text-gray-600">Assessments Passed</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {complianceHistory.length}
              </p>
              <p className="text-sm text-gray-600">Total Records</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Timeline</CardTitle>
          <CardDescription>
            Historical record of all compliance assessments and events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {complianceHistory.map((record, index) => {
              const TrendIcon = getScoreTrend(record.score, record.previousScore).icon;
              const trendColor = getScoreTrend(record.score, record.previousScore).color;
              
              return (
                <div key={record.id} className="relative">
                  {index < complianceHistory.length - 1 && (
                    <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"></div>
                  )}
                  
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <CalendarDays className="w-6 h-6 text-blue-600" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{record.type}</h4>
                          <p className={`text-sm font-medium ${getCategoryColor(record.category)}`}>
                            {record.category}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(record.status)}
                          <div className="flex items-center space-x-1">
                            <span className="font-semibold">{record.score}</span>
                            {record.previousScore && (
                              <TrendIcon className={`w-4 h-4 ${trendColor}`} />
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{record.notes}</p>
                      
                      <div className="flex items-center text-xs text-gray-500">
                        <CalendarDays className="w-3 h-3 mr-1" />
                        {format(new Date(record.date), 'MMM dd, yyyy')}
                        {record.previousScore && (
                          <span className="ml-4">
                            Previous: {record.previousScore} 
                            <span className={`ml-1 ${record.score > record.previousScore ? 'text-green-600' : 'text-red-600'}`}>
                              ({record.score > record.previousScore ? '+' : ''}{record.score - record.previousScore})
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium mb-2">Score Distribution</h5>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>90-100 (Excellent)</span>
                    <span>{complianceHistory.filter(r => r.score >= 90).length} records</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>80-89 (Good)</span>
                    <span>{complianceHistory.filter(r => r.score >= 80 && r.score < 90).length} records</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>70-79 (Fair)</span>
                    <span>{complianceHistory.filter(r => r.score >= 70 && r.score < 80).length} records</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Below 70 (Needs Improvement)</span>
                    <span>{complianceHistory.filter(r => r.score < 70).length} records</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h5 className="font-medium mb-2">Recent Trend</h5>
                <div className="text-sm text-gray-600">
                  <p>Last 3 months average: <span className="font-medium">{averageScore}</span></p>
                  <p>Trend: <span className="text-green-600 font-medium">Improving</span></p>
                  <p>Next assessment due: <span className="font-medium">July 1, 2024</span></p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComplianceRecordsHistory;
