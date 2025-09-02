import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Upload, Calendar } from 'lucide-react';
import StandardPageLayout, { MetricCard, ActionButton, NavigationTab } from '@/components/layout/StandardPageLayout';

const DriverDocuments = () => {
  const [activeTab, setActiveTab] = useState<string>('all');

  // Sample documents (replace with real data later)
  const documents = [
    { id: 'lic', name: 'Driving License', category: 'licenses', status: 'valid', expiry: '2026-03-15' },
    { id: 'med', name: 'Medical Certificate', category: 'certs', status: 'expiring', expiry: '2025-01-30' },
    { id: 'cpc', name: 'CPC Certificate', category: 'certs', status: 'valid', expiry: '2027-08-12' },
    { id: 'dbs', name: 'DBS Check', category: 'checks', status: 'valid', issued: '2024-06-05' },
  ] as const;

  const total = documents.length;
  const validCount = documents.filter(d => d.status === 'valid').length;
  const expiringCount = documents.filter(d => d.status === 'expiring').length;
  const missingCount = documents.filter(d => d.status === 'missing').length;

  const metricsCards: MetricCard[] = [
    { title: 'Total Docs', value: total, subtitle: 'All documents', icon: <FileText className="w-5 h-5 text-blue-600" />, bgColor: 'bg-blue-100', color: 'text-blue-600' },
    { title: 'Valid', value: validCount, subtitle: 'Up to date', icon: <Badge className="bg-green-100 text-green-800">✓</Badge>, bgColor: 'bg-green-100', color: 'text-green-600' },
    { title: 'Expiring', value: expiringCount, subtitle: 'Next 60 days', icon: <Calendar className="w-5 h-5 text-yellow-600" />, bgColor: 'bg-yellow-100', color: 'text-yellow-600' },
    { title: 'Missing', value: missingCount, subtitle: 'Action needed', icon: <Badge className="bg-red-100 text-red-800">!</Badge>, bgColor: 'bg-red-100', color: 'text-red-600' },
  ];

  const primaryAction: ActionButton = {
    label: 'Upload Document',
    onClick: () => {},
    icon: <Upload className="w-4 h-4" />
  };

  const navigationTabs: NavigationTab[] = [
    { value: 'all', label: 'All' },
    { value: 'licenses', label: 'Licenses' },
    { value: 'certs', label: 'Certificates' },
    { value: 'checks', label: 'Checks' }
  ];

  const filtered = activeTab === 'all' ? documents : documents.filter(d => d.category === activeTab);

  const getStatusBadge = (status: string) => {
    if (status === 'valid') return <Badge variant="outline" className="text-green-600 border-green-600">Valid</Badge>;
    if (status === 'expiring') return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Expires Soon</Badge>;
    return <Badge variant="outline" className="text-red-600 border-red-600">Missing</Badge>;
  };

  return (
    <StandardPageLayout
      title="My Documents"
      description="View and manage your driver documents"
      primaryAction={primaryAction}
      metricsCards={metricsCards}
      navigationTabs={navigationTabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((doc) => (
          <Card key={doc.id}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>{doc.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {getStatusBadge(doc.status)}
                {doc.expiry && (
                  <p className="text-sm text-muted-foreground">Expires: {new Date(doc.expiry).toLocaleDateString()}</p>
                )}
                {doc.issued && (
                  <p className="text-sm text-muted-foreground">Issued: {new Date(doc.issued).toLocaleDateString()}</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </StandardPageLayout>
  );
};

export default DriverDocuments;