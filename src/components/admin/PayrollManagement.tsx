
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Download, Eye, FileText, Calculator } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const PayrollManagement = () => {
  const { profile } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('current');

  // Fetch payroll data from time entries
  const { data: payrollData = [], isLoading } = useQuery({
    queryKey: ['payroll-data', profile?.organization_id, selectedPeriod],
    queryFn: async () => {
      if (!profile?.organization_id) return [];
      
      // Calculate date range based on selected period
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      // Fetch time entries for the period
      // Mock time entries (table doesn't exist yet)
      const timeEntries: any[] = [];

      // Group by driver and calculate totals
      const payrollMap = new Map();
      
      timeEntries?.forEach(entry => {
        const driverId = entry.driver_id;
        const driverName = `${entry.profiles?.first_name || ''} ${entry.profiles?.last_name || ''}`.trim();
        const employeeId = entry.profiles?.employee_id || 'N/A';
        
        if (!payrollMap.has(driverId)) {
          payrollMap.set(driverId, {
            id: driverId,
            driver: driverName || 'Unknown Driver',
            employeeId,
            hoursWorked: 0,
            hourlyRate: 18.50, // Default rate - could be fetched from profiles
            overtime: 0,
            overtimeRate: 27.75,
            grossPay: 0,
            deductions: 0,
            netPay: 0,
            status: 'pending'
          });
        }
        
        const payrollEntry = payrollMap.get(driverId);
        const totalHours = entry.total_hours || 0;
        const overtimeHours = entry.overtime_hours || 0;
        const regularHours = totalHours - overtimeHours;
        
        payrollEntry.hoursWorked += regularHours;
        payrollEntry.overtime += overtimeHours;
      });
      
      // Calculate pay for each driver
      return Array.from(payrollMap.values()).map(entry => {
        const regularPay = entry.hoursWorked * entry.hourlyRate;
        const overtimePay = entry.overtime * entry.overtimeRate;
        entry.grossPay = regularPay + overtimePay;
        entry.deductions = entry.grossPay * 0.15; // Estimate 15% for taxes/deductions
        entry.netPay = entry.grossPay - entry.deductions;
        return entry;
      });
    },
    enabled: !!profile?.organization_id
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalGrossPay = payrollData.reduce((sum, item) => sum + item.grossPay, 0);
  const totalNetPay = payrollData.reduce((sum, item) => sum + item.netPay, 0);
  const totalDeductions = payrollData.reduce((sum, item) => sum + item.deductions, 0);

  return (
    <div className="space-y-6">
      {/* Payroll Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gross Pay</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalGrossPay.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Before deductions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deductions</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${totalDeductions.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Tax, insurance, etc.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Net Pay</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${totalNetPay.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">After deductions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drivers</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payrollData.length}</div>
            <p className="text-xs text-muted-foreground">Active employees</p>
          </CardContent>
        </Card>
      </div>

      {/* Payroll Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Driver Payroll</CardTitle>
              <CardDescription>Manage wages and payslips for the current pay period</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Payroll
              </Button>
              <Button size="sm">Process Payroll</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading payroll data...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Driver</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Overtime</TableHead>
                  <TableHead>Gross Pay</TableHead>
                  <TableHead>Deductions</TableHead>
                  <TableHead>Net Pay</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrollData.map((payroll) => (
                <TableRow key={payroll.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{payroll.driver}</div>
                      <div className="text-sm text-gray-500">${payroll.hourlyRate}/hr</div>
                    </div>
                  </TableCell>
                  <TableCell>{payroll.employeeId}</TableCell>
                  <TableCell>{payroll.hoursWorked}h</TableCell>
                  <TableCell>{payroll.overtime}h</TableCell>
                  <TableCell className="font-medium">${payroll.grossPay.toFixed(2)}</TableCell>
                  <TableCell className="text-red-600">${payroll.deductions.toFixed(2)}</TableCell>
                  <TableCell className="font-bold text-green-600">${payroll.netPay.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(payroll.status)}>
                      {payroll.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PayrollManagement;
