import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import BackNavigation from '@/components/BackNavigation';
import { 
  AlertTriangle, 
  Shield, 
  MapPin, 
  Users, 
  FileText,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';

interface DPIAItem {
  id: string;
  title: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
  mitigation: string;
  status: 'identified' | 'assessed' | 'mitigated' | 'monitored';
}

const DPIA: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);

  const dpiaItems: DPIAItem[] = [
    {
      id: 'location-tracking',
      title: 'Real-time Location Tracking',
      description: 'GPS tracking of vehicles and drivers for transport management',
      riskLevel: 'high',
      mitigation: 'Explicit consent, purpose limitation, data minimization, encryption',
      status: 'mitigated'
    },
    {
      id: 'personal-data',
      title: 'Personal Data Processing',
      description: 'Collection and processing of driver, passenger, and customer information',
      riskLevel: 'medium',
      mitigation: 'Data minimization, access controls, encryption, retention policies',
      status: 'mitigated'
    },
    {
      id: 'data-sharing',
      title: 'Data Sharing with Third Parties',
      description: 'Sharing data with transport companies, regulatory bodies, and service providers',
      riskLevel: 'medium',
      mitigation: 'Data processing agreements, safeguards, limited sharing',
      status: 'assessed'
    },
    {
      id: 'special-categories',
      title: 'Special Category Data',
      description: 'Medical information, biometric data for driver identification',
      riskLevel: 'high',
      mitigation: 'Explicit consent, additional safeguards, limited processing',
      status: 'mitigated'
    },
    {
      id: 'data-retention',
      title: 'Data Retention Periods',
      description: 'Long-term storage of transport and safety records',
      riskLevel: 'medium',
      mitigation: 'Clear retention policies, automated deletion, regular reviews',
      status: 'assessed'
    },
    {
      id: 'international-transfers',
      title: 'International Data Transfers',
      description: 'Data processing outside the UK/EEA by cloud providers',
      riskLevel: 'medium',
      mitigation: 'Adequacy decisions, Standard Contractual Clauses, safeguards',
      status: 'assessed'
    }
  ];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'mitigated': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'assessed': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'identified': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'mitigated': return 'bg-green-100 text-green-800';
      case 'assessed': return 'bg-yellow-100 text-yellow-800';
      case 'identified': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const steps = [
    { id: 1, title: 'Data Processing Overview', description: 'Identify all data processing activities' },
    { id: 2, title: 'Risk Assessment', description: 'Assess privacy risks and impacts' },
    { id: 3, title: 'Mitigation Measures', description: 'Implement risk reduction measures' },
    { id: 4, title: 'Monitoring & Review', description: 'Ongoing compliance monitoring' }
  ];

  const overallProgress = (dpiaItems.filter(item => item.status === 'mitigated').length / dpiaItems.length) * 100;

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.02]">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="black" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      <BackNavigation title="Data Protection Assessment" />
      
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 mb-4">
          <Shield className="w-5 h-5 text-gray-700" />
          <span className="text-sm font-medium text-gray-700">Risk Assessment</span>
        </div>
        <h2 className="text-3xl font-bold text-black mb-3">Data Protection Impact Assessment (DPIA)</h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-4">
          Comprehensive assessment of data processing activities and privacy risks in our transport management platform.
          We continuously monitor and mitigate risks to protect your data.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Badge className="bg-gray-100 text-gray-800 px-3 py-1">
            ICO Application: C1752755 (Processing)
          </Badge>
          <Badge className="bg-gray-100 text-gray-800 px-3 py-1">
            Regular Reviews
          </Badge>
        </div>
      </div>

      {/* Progress Overview */}
      <Card className="border border-gray-200 shadow-lg bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-black">
            <Shield className="w-6 h-6" />
            Overall DPIA Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-black">Completion Status</span>
              <span className="text-lg font-bold text-gray-700">{Math.round(overallProgress)}% Complete</span>
            </div>
            <div className="relative">
              <Progress value={overallProgress} className="w-full h-3" />
              <div className="absolute inset-0 bg-gray-200 rounded-full opacity-20"></div>
            </div>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div className="p-4 bg-gray-100 rounded-xl">
                <div className="text-3xl font-bold text-gray-700">
                  {dpiaItems.filter(item => item.status === 'mitigated').length}
                </div>
                <div className="text-sm font-medium text-gray-600">Mitigated</div>
              </div>
              <div className="p-4 bg-gray-100 rounded-xl">
                <div className="text-3xl font-bold text-gray-700">
                  {dpiaItems.filter(item => item.status === 'assessed').length}
                </div>
                <div className="text-sm font-medium text-gray-600">Assessed</div>
              </div>
              <div className="p-4 bg-gray-100 rounded-xl">
                <div className="text-3xl font-bold text-gray-700">
                  {dpiaItems.filter(item => item.status === 'identified').length}
                </div>
                <div className="text-sm font-medium text-gray-600">Identified</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Assessment Items */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Data Processing Activities & Risks</h3>
        {dpiaItems.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow border border-gray-200 bg-white">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {getStatusIcon(item.status)}
                    {item.title}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                </div>
                <div className="flex gap-2">
                  <Badge className={getRiskColor(item.riskLevel)}>
                    {item.riskLevel.toUpperCase()} Risk
                  </Badge>
                  <Badge className={getStatusColor(item.status)}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-sm mb-1">Mitigation Measures:</h4>
                  <p className="text-sm text-gray-600">{item.mitigation}</p>
                </div>
                {item.status === 'identified' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">Action Required</span>
                    </div>
                    <p className="text-sm text-yellow-700 mt-1">
                      This risk needs to be assessed and mitigated.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Compliance Measures */}
      <Card className="border border-gray-200 shadow-lg bg-white">
        <CardHeader>
          <CardTitle>Implemented Compliance Measures</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold">Technical Measures</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Encryption of data in transit and at rest</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Access controls and authentication</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Regular security assessments</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Data backup and recovery procedures</span>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">Organizational Measures</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Data protection officer appointed</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Staff training on data protection</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Incident response procedures</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Regular compliance audits</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Next Steps & Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Immediate Actions (This Week)</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>Complete remaining risk assessments</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>Implement additional mitigation measures</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>Document all data processing activities</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Ongoing Monitoring</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-green-600" />
                    <span>Regular DPIA reviews (annually)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-green-600" />
                    <span>Monitor new data processing activities</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-green-600" />
                    <span>Update risk assessments as needed</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>DPIA Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            For questions about this DPIA or to report new data processing activities:
          </p>
          <div className="space-y-2 text-sm">
                         <div className="flex items-center gap-2">
               <FileText className="w-4 h-4 text-gray-500" />
               <span>Data Protection Officer: transport@logisticssolutionresources.com</span>
             </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-gray-500" />
              <span>ICO Application: C1752755 (Processing)</span>
            </div>
          </div>
        </CardContent>
      </Card>
        </div>
      </div>
    </div>
  );
};

export default DPIA;
