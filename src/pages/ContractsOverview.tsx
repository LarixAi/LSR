import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, 
  Wrench, 
  Truck, 
  Building2,
  Users,
  Shield,
  PoundSterling,
  Calendar,
  ArrowRight,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import DefaultViewPageLayout from '@/components/layout/DefaultViewPageLayout';

const ContractsOverview = () => {
  const navigate = useNavigate();

  const navigationItems = [
    {
      id: 'contracts-overview',
      label: 'Overview',
    },
    {
      id: 'contract-types',
      label: 'Contract Types',
    },
    {
      id: 'legal-features',
      label: 'Legal Features',
    },
    {
      id: 'implementation-steps',
      label: 'Implementation',
    },
    {
      id: 'notes',
      label: 'Important Notes',
    }
  ];

  const contractTypes = [
    {
      id: 'standard',
      title: 'Standard Mechanic Employment Contract',
      description: 'Comprehensive employment contract for mechanics in any industry',
      icon: <Wrench className="w-8 h-8 text-blue-600" />,
      features: [
        'UK Employment Law Compliant',
        'Health & Safety Requirements',
        'Performance Standards',
        'Confidentiality Clauses',
        'Training & Development',
        'Benefits & Remuneration',
        'Disciplinary Procedures',
        'Termination Terms'
      ],
      bestFor: 'General mechanics, workshops, automotive businesses',
      route: '/mechanics/contract',
      color: 'border-blue-200 bg-blue-50'
    },
    {
      id: 'transport',
      title: 'Transport Company Mechanic Contract',
      description: 'Specialized contract for transport companies with DVSA compliance',
      icon: <Truck className="w-8 h-8 text-green-600" />,
      features: [
        'DVSA Standards Compliance',
        'O-License Support',
        'Transport Industry Specific',
        'Emergency Response Requirements',
        'Roadside Safety Procedures',
        '24/7 Support Obligations',
        'Fleet Maintenance Standards',
        'Transport Compliance'
      ],
      bestFor: 'Transport companies, bus operators, logistics firms',
      route: '/mechanics/transport-contract',
      color: 'border-green-200 bg-green-50'
    }
  ];

  const legalFeatures = [
    {
      title: 'UK Employment Law Compliant',
      description: 'Follows all current UK employment legislation including Employment Rights Act, Working Time Regulations, and Equality Act',
      icon: <Shield className="w-5 h-5 text-green-600" />
    },
    {
      title: 'Industry Standards',
      description: 'Incorporates industry best practices and regulatory requirements for mechanical work',
      icon: <CheckCircle className="w-5 h-5 text-blue-600" />
    },
    {
      title: 'Legal Protection',
      description: 'Includes confidentiality clauses, non-competition terms, and intellectual property protection',
      icon: <AlertTriangle className="w-5 h-5 text-orange-600" />
    },
    {
      title: 'Professional Structure',
      description: 'Clear sections covering all employment aspects with professional legal language',
      icon: <FileText className="w-5 h-5 text-purple-600" />
    }
  ];

  return (
    <DefaultViewPageLayout
      title="Mechanic Employment Contracts"
      description="Choose the right employment contract for your mechanics"
      navigationItems={navigationItems}
      backUrl="/mechanics"
      backLabel="Back to Mechanics"
    >
      <div className="space-y-8">
        {/* Overview Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Contract Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              We provide two comprehensive employment contract templates designed specifically for mechanics. 
              Both contracts are legally sound, UK employment law compliant, and ready for immediate use.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>UK Employment Law Compliant</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Professional Legal Structure</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Industry Best Practices</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>PDF Generation Ready</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contract Types */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {contractTypes.map((contract) => (
            <Card key={contract.id} className={`${contract.color} hover:shadow-lg transition-shadow`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    {contract.icon}
                    <div>
                      <CardTitle className="text-lg">{contract.title}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{contract.description}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">Key Features:</h4>
                  <ul className="space-y-1">
                    {contract.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                        <CheckCircle className="w-3 h-3 text-green-600 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">Best For:</h4>
                  <p className="text-sm text-gray-600">{contract.bestFor}</p>
                </div>

                <Button 
                  onClick={() => navigate(contract.route)}
                  className="w-full"
                  size="sm"
                >
                  Generate Contract
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Legal Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Legal Features & Compliance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {legalFeatures.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Implementation Guide */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Implementation Steps</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-semibold">Choose Contract Type</h4>
                  <p className="text-sm text-gray-600">Select the contract that best fits your business needs and industry requirements.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-semibold">Fill in Details</h4>
                  <p className="text-sm text-gray-600">Complete all required fields with your company and employee information.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-semibold">Generate PDF</h4>
                  <p className="text-sm text-gray-600">Click the generate button to create a professional PDF contract.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  4
                </div>
                <div>
                  <h4 className="font-semibold">Legal Review</h4>
                  <p className="text-sm text-gray-600">Have the contract reviewed by a qualified employment lawyer before use.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Notes */}
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-orange-800">
              <AlertTriangle className="w-5 h-5" />
              <span>Important Legal Notes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-orange-700">
              <p>• These contracts should be reviewed by qualified employment lawyers before use</p>
              <p>• All blank fields must be completed before signing</p>
              <p>• Company policies and procedures form part of these contracts</p>
              <p>• Changes to terms must be agreed in writing</p>
              <p>• Keep copies of all contracts for your records</p>
              <p>• Ensure compliance with current employment laws and regulations</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DefaultViewPageLayout>
  );
};

export default ContractsOverview;
