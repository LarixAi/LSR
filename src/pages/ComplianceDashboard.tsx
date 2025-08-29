
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Clock, TrendingDown, TrendingUp } from 'lucide-react';
import { useDriverComplianceScore } from '@/hooks/useCompliance';
import { useAuth } from '@/contexts/AuthContext';
import { getComplianceStatusColor } from '@/utils/complianceScoring';

const ComplianceDashboard = () => {
  const { user } = useAuth();
  const { data: complianceScore, isLoading } = useDriverComplianceScore(user?.id);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Compliance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const defaultScore = {
    overall_score: 100,
    vehicle_check_score: 100,
    safety_score: 100,
    documentation_score: 100,
    incident_count: 0,
    risk_level: 'low' as const
  };

  const score = complianceScore || defaultScore;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span>Compliance Overview</span>
        </CardTitle>
        <CardDescription>
          Your current compliance status and safety scores
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-900">{score.overall_score}%</p>
                <p className="text-sm text-blue-700">Overall Score</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-900">{score.vehicle_check_score}%</p>
                <p className="text-sm text-green-700">Vehicle Checks</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-4 border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-orange-900">{score.safety_score}%</p>
                <p className="text-sm text-orange-700">Safety Score</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-purple-900">{score.incident_count}</p>
                <p className="text-sm text-purple-700">Incidents</p>
              </div>
              {score.incident_count > 0 ? (
                <TrendingDown className="w-8 h-8 text-red-600" />
              ) : (
                <CheckCircle className="w-8 h-8 text-green-600" />
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Clock className="w-5 h-5 text-gray-600" />
            <div>
              <p className="font-medium text-gray-900">Risk Level</p>
              <p className="text-sm text-gray-600">Current assessment based on recent activity</p>
            </div>
          </div>
          <Badge className={getComplianceStatusColor(score.risk_level)}>
            {score.risk_level.toUpperCase()}
          </Badge>
        </div>

        {score.risk_level !== 'low' && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-900">Attention Required</h4>
                <p className="text-sm text-yellow-800 mt-1">
                  Your compliance score indicates areas for improvement. Please review your recent vehicle checks and address any outstanding issues.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ComplianceDashboard;
