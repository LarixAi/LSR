
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Shield, Clock, CheckCircle, AlertTriangle, FileText, Eye } from 'lucide-react';

interface DVLAComplianceInfoProps {
  onContinue: () => void;
}

const DVLAComplianceInfo: React.FC<DVLAComplianceInfoProps> = ({ onContinue }) => {
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
          <Shield className="w-8 h-8 text-blue-600" />
          DVLA Vehicle Inspection Requirements
        </CardTitle>
        <p className="text-gray-600 mt-2">
          Legal requirements for daily vehicle safety checks in the UK
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Legal Requirement:</strong> All commercial vehicle drivers must conduct daily safety checks 
            before operating any vehicle. Failure to comply can result in fines, penalty points, and operator license penalties.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              DVLA Requirements
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">Daily Safety Checks</p>
                  <p className="text-sm text-gray-600">Required before each journey</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">Documentation</p>
                  <p className="text-sm text-gray-600">Must be recorded and available for inspection</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">Defect Reporting</p>
                  <p className="text-sm text-gray-600">Any defects must be reported immediately</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Eye className="w-5 h-5 text-orange-600" />
              What We Check
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <Badge variant="outline" className="justify-center">🔧 Engine</Badge>
              <Badge variant="outline" className="justify-center">🛑 Brakes</Badge>
              <Badge variant="outline" className="justify-center">🛞 Tires</Badge>
              <Badge variant="outline" className="justify-center">💡 Lights</Badge>
              <Badge variant="outline" className="justify-center">🪞 Mirrors</Badge>
              <Badge variant="outline" className="justify-center">🔒 Safety Equipment</Badge>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Timed Walk-Around Inspection
          </h4>
          <div className="space-y-2 text-blue-800 text-sm">
            <p>• This inspection is timed to ensure thoroughness</p>
            <p>• Location tracking proves the inspection was conducted</p>
            <p>• Each check point requires your confirmation</p>
            <p>• All responses are recorded for DVLA compliance</p>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-900 mb-2">Important Notes</h4>
          <ul className="text-yellow-800 text-sm space-y-1">
            <li>• Do not operate any vehicle that fails safety checks</li>
            <li>• Report any defects immediately to management</li>
            <li>• This inspection is legally required and monitored</li>
            <li>• Take your time - safety is more important than speed</li>
          </ul>
        </div>

        <div className="text-center pt-4">
          <Button onClick={onContinue} size="lg" className="bg-blue-600 hover:bg-blue-700">
            <CheckCircle className="w-5 h-5 mr-2" />
            I Understand - Begin Inspection
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DVLAComplianceInfo;
