import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  TrendingUp, 
  BarChart3, 
  FileText, 
  Calculator,
  Loader2,
  AlertCircle,
  PieChart,
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useFinancialAI } from '@/hooks/useFinancialAI';

export const FinancialAIDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState('cost-analysis');
  const [results, setResults] = useState<any>(null);

  const {
    isLoading,
    error,
    analyzeCosts,
    optimizeBudget,
    generateFinancialForecast,
    manageExpenses,
    analyzeProfitability,
    clearError
  } = useFinancialAI();

  const sampleVehicles = [
    { id: '1', status: 'active', type: 'HGV', age: 3 },
    { id: '2', status: 'active', type: 'Van', age: 1 }
  ];

  const sampleExpenses = [
    { id: '1', category: 'fuel', amount: 2500, date: '2024-01-15', description: 'Diesel fuel' },
    { id: '2', category: 'maintenance', amount: 800, date: '2024-01-10', description: 'Brake repair' }
  ];

  const sampleBudget = {
    fuel: 50000,
    maintenance: 20000,
    insurance: 15000,
    licensing: 5000,
    labor: 80000,
    overhead: 25000,
    total: 195000
  };

  const handleAnalysis = async (type: string) => {
    let result = null;
    
    switch (type) {
      case 'cost-analysis':
        result = await analyzeCosts(
          { start: '2024-01-01', end: '2024-01-31' },
          sampleVehicles,
          sampleExpenses
        );
        break;
      case 'budget-optimization':
        result = await optimizeBudget(sampleBudget, sampleExpenses);
        break;
      case 'financial-forecast':
        result = await generateFinancialForecast(
          { start: '2024-02-01', end: '2024-12-31' },
          sampleExpenses
        );
        break;
      case 'expense-management':
        result = await manageExpenses(sampleExpenses);
        break;
      case 'profitability-analysis':
        result = await analyzeProfitability(
          { start: '2024-01-01', end: '2024-01-31' },
          sampleExpenses
        );
        break;
    }
    
    if (result) {
      setResults(result);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Financial AI Assistant</h2>
          <p className="text-gray-600">AI-powered financial analysis and optimization</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          Financial Intelligence
        </Badge>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
              <Button variant="ghost" size="sm" onClick={clearError}>
                <XCircle className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="cost-analysis" className="flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Cost Analysis
          </TabsTrigger>
          <TabsTrigger value="budget-optimization" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Budget
          </TabsTrigger>
          <TabsTrigger value="financial-forecast" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Forecast
          </TabsTrigger>
          <TabsTrigger value="expense-management" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Expenses
          </TabsTrigger>
          <TabsTrigger value="profitability-analysis" className="flex items-center gap-2">
            <PieChart className="w-4 h-4" />
            Profitability
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cost-analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Cost Analysis
              </CardTitle>
              <p className="text-gray-600">Analyze costs across fuel, maintenance, insurance, and more</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => handleAnalysis('cost-analysis')} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing Costs...
                  </>
                ) : (
                  <>
                    <Calculator className="w-4 h-4 mr-2" />
                    Analyze Costs
                  </>
                )}
              </Button>

              {results && activeTab === 'cost-analysis' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(results.totalCosts?.total || 0)}
                        </div>
                        <p className="text-sm text-gray-600">Total Costs</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-blue-600">
                          {formatCurrency(results.costPerMile || 0)}
                        </div>
                        <p className="text-sm text-gray-600">Cost per Mile</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {results.aiInsights && (
                    <Card>
                      <CardHeader>
                        <CardTitle>AI Insights</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {results.aiInsights.costDrivers?.map((driver: string, index: number) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <AlertTriangle className="w-3 h-3 text-orange-500" />
                              {driver}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget-optimization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Budget Optimization
              </CardTitle>
              <p className="text-gray-600">Optimize your budget allocation for maximum efficiency</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => handleAnalysis('budget-optimization')} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Optimizing Budget...
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4 mr-2" />
                    Optimize Budget
                  </>
                )}
              </Button>

              {results && activeTab === 'budget-optimization' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-red-600">
                          {formatCurrency(results.currentBudget?.total || 0)}
                        </div>
                        <p className="text-sm text-gray-600">Current Budget</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(results.optimizedBudget?.total || 0)}
                        </div>
                        <p className="text-sm text-gray-600">Optimized Budget</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-blue-600">
                          {formatCurrency(results.savings?.amount || 0)}
                        </div>
                        <p className="text-sm text-gray-600">Potential Savings</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial-forecast" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Financial Forecast
              </CardTitle>
              <p className="text-gray-600">Generate comprehensive financial projections</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => handleAnalysis('financial-forecast')} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Forecast...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Generate Forecast
                  </>
                )}
              </Button>

              {results && activeTab === 'financial-forecast' && (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Revenue Forecast</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {results.revenueForecast?.map((item: any, index: number) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="font-medium">{item.period}</span>
                            <div className="text-right">
                              <div className="font-medium">{formatCurrency(item.projected)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expense-management" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Expense Management
              </CardTitle>
              <p className="text-gray-600">AI-powered expense analysis and management</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => handleAnalysis('expense-management')} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing Expenses...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Analyze Expenses
                  </>
                )}
              </Button>

              {results && activeTab === 'expense-management' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-blue-600">
                          {formatCurrency(results.expenseSummary?.totalExpenses || 0)}
                        </div>
                        <p className="text-sm text-gray-600">Total Expenses</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-green-600">
                          {results.expenseSummary?.approvedExpenses || 0}
                        </div>
                        <p className="text-sm text-gray-600">Approved</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profitability-analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Profitability Analysis
              </CardTitle>
              <p className="text-gray-600">Comprehensive profitability analysis and performance metrics</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => handleAnalysis('profitability-analysis')} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing Profitability...
                  </>
                ) : (
                  <>
                    <PieChart className="w-4 h-4 mr-2" />
                    Analyze Profitability
                  </>
                )}
              </Button>

              {results && activeTab === 'profitability-analysis' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(results.profitability?.netProfit || 0)}
                        </div>
                        <p className="text-sm text-gray-600">Net Profit</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-blue-600">
                          {results.profitability?.netMargin ? `${(results.profitability.netMargin * 100).toFixed(1)}%` : '0%'}
                        </div>
                        <p className="text-sm text-gray-600">Net Margin</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
