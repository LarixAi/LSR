
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface RiskScore {
  id: string;
  driver_id: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  score: number;
  factors: string[];
  last_updated: string;
  risk_score: number;
  risk_category: string;
  calculation_date: string;
  vehicle_check_score: number;
  incident_score: number;
  compliance_score: number;
  performance_score: number;
  recommendations?: string[];
}

interface RiskAnalysisTabProps {
  riskScores: RiskScore[];
}

const getRiskBadgeColor = (category: string) => {
  switch (category) {
    case 'low': return 'bg-green-100 text-green-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'high': return 'bg-orange-100 text-orange-800';
    case 'critical': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const RiskAnalysisTab: React.FC<RiskAnalysisTabProps> = ({ riskScores }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Driver Risk Analysis</CardTitle>
        <CardDescription>
          Monitor driver risk scores and performance metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {riskScores?.map((score) => (
            <div key={score.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium">Risk Assessment</h4>
                  <p className="text-sm text-gray-600">
                    Date: {format(new Date(score.calculation_date), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">{score.risk_score}</div>
                  <Badge className={getRiskBadgeColor(score.risk_category)}>
                    {score.risk_category}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mt-3">
                <div>
                  <span className="font-medium">Vehicle Check:</span> {score.vehicle_check_score}
                </div>
                <div>
                  <span className="font-medium">Incident Score:</span> {score.incident_score}
                </div>
                <div>
                  <span className="font-medium">Compliance:</span> {score.compliance_score}
                </div>
                <div>
                  <span className="font-medium">Performance:</span> {score.performance_score}
                </div>
              </div>
              {score.recommendations && score.recommendations.length > 0 && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-blue-900">Recommendations:</span>
                  <ul className="text-sm text-blue-800 mt-1 list-disc list-inside">
                    {score.recommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
          {(!riskScores || riskScores.length === 0) && (
            <p className="text-gray-500 text-center py-8">No risk assessments found</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RiskAnalysisTab;
