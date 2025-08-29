
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, TrendingUp, TrendingDown, Calculator, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const BudgetOverview = () => {
  const { profile } = useAuth();

  // Fetch real budget data from database
  const { data: budgetData, isLoading } = useQuery({
    queryKey: ['budget-data', profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return null;
      
      // Fetch actual financial data from database
      const [payrollRes, expensesRes, revenueRes] = await Promise.all([
        supabase.from('time_entries').select('total_hours, driver_id').eq('organization_id', profile.organization_id),
        supabase.from('defect_reports').select('actual_cost, estimated_cost').eq('organization_id', profile.organization_id),
        supabase.from('schedules').select('*').eq('organization_id', profile.organization_id)
      ]);

      const timeEntries = payrollRes.data || [];
      const expenses = expensesRes.data || [];
      const schedules = revenueRes.data || [];

      // Calculate actual wages from time entries
      const totalHours = timeEntries.reduce((sum, entry) => sum + (entry.total_hours || 0), 0);
      const driverWages = totalHours * 18.50; // Default hourly rate

      // Calculate maintenance costs from defect reports
      const maintenanceCosts = expenses.reduce((sum, expense) => sum + (expense.actual_cost || expense.estimated_cost || 0), 0);

      const totalBudget = driverWages + maintenanceCosts;

      return {
        weekly: {
          total: totalBudget,
          driverWages: Math.round(driverWages),
          fuel: 0, // Would need fuel_expenses table
          maintenance: Math.round(maintenanceCosts),
          other: 0
        },
        incoming: [], // Would need revenue/contracts tables
        outgoing: [
          { category: 'Driver Wages', amount: Math.round(driverWages), status: 'calculated' },
          { category: 'Vehicle Maintenance', amount: Math.round(maintenanceCosts), status: 'actual' }
        ]
      };
    },
    enabled: !!profile?.organization_id
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'recurring': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-2 text-gray-500">Loading budget data...</p>
      </div>
    );
  }

  if (!budgetData) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No budget data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Budget Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{budgetData.weekly.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total allocated</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Driver Wages</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{budgetData.weekly.driverWages.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">68% of total budget</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              £{budgetData.incoming.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Expected this week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              £{budgetData.outgoing.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Scheduled expenses</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incoming Revenue */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span>Incoming Revenue</span>
                </CardTitle>
                <CardDescription>Expected income for this week</CardDescription>
              </div>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Income
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {budgetData.incoming.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{item.source}</div>
                    <div className="text-sm text-gray-500">Revenue source</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-green-600">£{item.amount.toLocaleString()}</span>
                    <Badge className={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Outgoing Expenses */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                  <span>Outgoing Expenses</span>
                </CardTitle>
                <CardDescription>Scheduled expenses for this week</CardDescription>
              </div>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {budgetData.outgoing.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{item.category}</div>
                    <div className="text-sm text-gray-500">Expense category</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-red-600">£{item.amount.toLocaleString()}</span>
                    <Badge className={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BudgetOverview;
