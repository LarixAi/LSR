
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, TrendingUp, BarChart3, Calendar } from 'lucide-react';

const FinancialReports = () => {
  const reports = [
    {
      title: 'Weekly Financial Summary',
      description: 'Complete overview of income, expenses, and profit margins',
      type: 'weekly',
      lastGenerated: '2024-01-15',
      status: 'ready'
    },
    {
      title: 'Driver Payroll Report',
      description: 'Detailed breakdown of driver wages and deductions',
      type: 'payroll',
      lastGenerated: '2024-01-14',
      status: 'ready'
    },
    {
      title: 'Budget vs Actual Analysis',
      description: 'Comparison of planned budget against actual spending',
      type: 'budget',
      lastGenerated: '2024-01-13',
      status: 'ready'
    },
    {
      title: 'Monthly P&L Statement',
      description: 'Profit and loss statement for the current month',
      type: 'monthly',
      lastGenerated: '2024-01-01',
      status: 'pending'
    },
    {
      title: 'Tax Documentation',
      description: 'Quarterly tax reports and supporting documentation',
      type: 'tax',
      lastGenerated: '2023-12-31',
      status: 'ready'
    },
    {
      title: 'Cost Analysis by Route',
      description: 'Detailed cost breakdown for each transportation route',
      type: 'analysis',
      lastGenerated: '2024-01-10',
      status: 'ready'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getReportIcon = (type: string) => {
    switch (type) {
      case 'weekly':
      case 'monthly': return Calendar;
      case 'budget':
      case 'analysis': return BarChart3;
      default: return FileText;
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reports Generated</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.filter(r => r.status === 'ready').length}</div>
            <p className="text-xs text-muted-foreground">Ready for download</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week's Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">£4,250</div>
            <p className="text-xs text-muted-foreground">+15% from last week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.filter(r => r.status === 'pending').length}</div>
            <p className="text-xs text-muted-foreground">Awaiting generation</p>
          </CardContent>
        </Card>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report, index) => {
          const IconComponent = getReportIcon(report.type);
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <IconComponent className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{report.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {report.description}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Last Generated:</span>
                    <span>{new Date(report.lastGenerated).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                      {report.status}
                    </div>
                    <div className="flex items-center space-x-2">
                      {report.status === 'ready' ? (
                        <>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                          <Button size="sm">
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" disabled>
                          Generate
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Generate Custom Report */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Custom Report</CardTitle>
          <CardDescription>Create a custom financial report with specific parameters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Button>
              <FileText className="w-4 h-4 mr-2" />
              Custom Report Builder
            </Button>
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Automated Reports
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialReports;
