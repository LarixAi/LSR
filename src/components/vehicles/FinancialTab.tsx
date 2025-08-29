import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { 
  Calculator, 
  TrendingDown, 
  TrendingUp, 
  PoundSterling, 
  Car, 
  Wrench, 
  Fuel, 
  FileText,
  Calendar,
  BarChart3,
  PieChart,
  DollarSign
} from 'lucide-react';
import { format } from 'date-fns';

interface VehicleFinancialData {
  id: string;
  vehicleId: string;
  purchasePrice: number;
  purchaseDate: string;
  estimatedLifespan: number; // in years
  salvageValue: number;
  currentMileage: number;
  fuelCosts: number;
  maintenanceCosts: number;
  insuranceCosts: number;
  licensingCosts: number;
  otherCosts: number;
  depreciationMethod: 'straight-line' | 'declining-balance';
  depreciationRate: number; // for declining balance method
}

interface DepreciationCalculation {
  year: number;
  straightLineDepreciation: number;
  straightLineBookValue: number;
  decliningBalanceDepreciation: number;
  decliningBalanceBookValue: number;
  date: string;
}

const FinancialTab: React.FC = () => {
  const [financialData, setFinancialData] = useState<VehicleFinancialData>({
    id: '1',
    vehicleId: 'v1',
    purchasePrice: 45000,
    purchaseDate: '2022-01-15',
    estimatedLifespan: 8,
    salvageValue: 5000,
    currentMileage: 45000,
    fuelCosts: 8500,
    maintenanceCosts: 3200,
    insuranceCosts: 1800,
    licensingCosts: 450,
    otherCosts: 750,
    depreciationMethod: 'straight-line',
    depreciationRate: 20 // 20% for declining balance
  });

  const [depreciationCalculations, setDepreciationCalculations] = useState<DepreciationCalculation[]>([]);

  // Calculate depreciation
  useEffect(() => {
    calculateDepreciation();
  }, [financialData]);

  const calculateDepreciation = () => {
    const calculations: DepreciationCalculation[] = [];
    const { purchasePrice, salvageValue, estimatedLifespan, depreciationRate } = financialData;
    
    // Straight-line depreciation
    const straightLineAnnualDepreciation = (purchasePrice - salvageValue) / estimatedLifespan;
    
    // Declining balance depreciation
    const decliningBalanceRate = depreciationRate / 100;
    
    let straightLineBookValue = purchasePrice;
    let decliningBalanceBookValue = purchasePrice;
    
    for (let year = 1; year <= estimatedLifespan; year++) {
      const straightLineDepreciation = straightLineAnnualDepreciation;
      straightLineBookValue -= straightLineDepreciation;
      
      const decliningBalanceDepreciation = decliningBalanceBookValue * decliningBalanceRate;
      decliningBalanceBookValue -= decliningBalanceDepreciation;
      
      // Ensure declining balance doesn't go below salvage value
      if (decliningBalanceBookValue < salvageValue) {
        const finalDepreciation = decliningBalanceBookValue - salvageValue;
        decliningBalanceBookValue = salvageValue;
        calculations.push({
          year,
          straightLineDepreciation,
          straightLineBookValue: Math.max(straightLineBookValue, salvageValue),
          decliningBalanceDepreciation: finalDepreciation,
          decliningBalanceBookValue,
          date: format(new Date(new Date(financialData.purchaseDate).getFullYear() + year - 1, 0, 1), 'yyyy')
        });
        break;
      }
      
      calculations.push({
        year,
        straightLineDepreciation,
        straightLineBookValue: Math.max(straightLineBookValue, salvageValue),
        decliningBalanceDepreciation,
        decliningBalanceBookValue,
        date: format(new Date(new Date(financialData.purchaseDate).getFullYear() + year - 1, 0, 1), 'yyyy')
      });
    }
    
    setDepreciationCalculations(calculations);
  };

  const getTotalOperatingCosts = () => {
    return financialData.fuelCosts + financialData.maintenanceCosts + 
           financialData.insuranceCosts + financialData.licensingCosts + financialData.otherCosts;
  };

  const getCurrentBookValue = () => {
    const yearsSincePurchase = new Date().getFullYear() - new Date(financialData.purchaseDate).getFullYear();
    const straightLineAnnualDepreciation = (financialData.purchasePrice - financialData.salvageValue) / financialData.estimatedLifespan;
    return Math.max(financialData.purchasePrice - (straightLineAnnualDepreciation * yearsSincePurchase), financialData.salvageValue);
  };

  const getTotalDepreciation = () => {
    return financialData.purchasePrice - getCurrentBookValue();
  };

  const getCostPerMile = () => {
    const totalCosts = getTotalOperatingCosts() + getTotalDepreciation();
    return totalCosts / financialData.currentMileage;
  };

  return (
    <div className="space-y-6">
      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Purchase Price</CardTitle>
            <PoundSterling className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{financialData.purchasePrice.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {format(new Date(financialData.purchaseDate), 'MMM dd, yyyy')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Book Value</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{getCurrentBookValue().toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {((getCurrentBookValue() / financialData.purchasePrice) * 100).toFixed(1)}% of original value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Depreciation</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{getTotalDepreciation().toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {((getTotalDepreciation() / financialData.purchasePrice) * 100).toFixed(1)}% depreciation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cost per Mile</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{getCostPerMile().toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {financialData.currentMileage.toLocaleString()} miles driven
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Operating Costs Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Operating Costs Breakdown
          </CardTitle>
          <CardDescription>Detailed breakdown of all vehicle operating costs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Fuel className="h-4 w-4 text-blue-500" />
                  <span>Fuel Costs</span>
                </div>
                <span className="font-semibold">£{financialData.fuelCosts.toLocaleString()}</span>
              </div>
              <Progress value={(financialData.fuelCosts / getTotalOperatingCosts()) * 100} className="h-2" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-orange-500" />
                  <span>Maintenance</span>
                </div>
                <span className="font-semibold">£{financialData.maintenanceCosts.toLocaleString()}</span>
              </div>
              <Progress value={(financialData.maintenanceCosts / getTotalOperatingCosts()) * 100} className="h-2" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-green-500" />
                  <span>Insurance</span>
                </div>
                <span className="font-semibold">£{financialData.insuranceCosts.toLocaleString()}</span>
              </div>
              <Progress value={(financialData.insuranceCosts / getTotalOperatingCosts()) * 100} className="h-2" />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-500" />
                  <span>Licensing</span>
                </div>
                <span className="font-semibold">£{financialData.licensingCosts.toLocaleString()}</span>
              </div>
              <Progress value={(financialData.licensingCosts / getTotalOperatingCosts()) * 100} className="h-2" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-red-500" />
                  <span>Other Costs</span>
                </div>
                <span className="font-semibold">£{financialData.otherCosts.toLocaleString()}</span>
              </div>
              <Progress value={(financialData.otherCosts / getTotalOperatingCosts()) * 100} className="h-2" />
              
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between font-bold text-lg">
                  <span>Total Operating Costs</span>
                  <span>£{getTotalOperatingCosts().toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Depreciation Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Depreciation Analysis
          </CardTitle>
          <CardDescription>
            Comparison of straight-line vs declining-balance depreciation methods
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="table" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="table">Depreciation Table</TabsTrigger>
              <TabsTrigger value="chart">Depreciation Chart</TabsTrigger>
            </TabsList>
            
            <TabsContent value="table" className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Year</TableHead>
                      <TableHead>Straight-Line</TableHead>
                      <TableHead>Straight-Line Book Value</TableHead>
                      <TableHead>Declining Balance</TableHead>
                      <TableHead>Declining Balance Book Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {depreciationCalculations.map((calc) => (
                      <TableRow key={calc.year}>
                        <TableCell className="font-medium">{calc.date}</TableCell>
                        <TableCell>£{calc.straightLineDepreciation.toLocaleString()}</TableCell>
                        <TableCell>£{calc.straightLineBookValue.toLocaleString()}</TableCell>
                        <TableCell>£{calc.decliningBalanceDepreciation.toLocaleString()}</TableCell>
                        <TableCell>£{calc.decliningBalanceBookValue.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="chart" className="space-y-4">
              <div className="h-64 flex items-center justify-center border rounded-md">
                <div className="text-center text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                  <p>Depreciation Chart Visualization</p>
                  <p className="text-sm">Chart component would be implemented here</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Financial Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Financial Settings
          </CardTitle>
          <CardDescription>Configure vehicle financial parameters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="purchasePrice">Purchase Price (£)</Label>
              <Input
                id="purchasePrice"
                type="number"
                value={financialData.purchasePrice}
                onChange={(e) => setFinancialData({
                  ...financialData,
                  purchasePrice: parseFloat(e.target.value) || 0
                })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="purchaseDate">Purchase Date</Label>
              <Input
                id="purchaseDate"
                type="date"
                value={financialData.purchaseDate}
                onChange={(e) => setFinancialData({
                  ...financialData,
                  purchaseDate: e.target.value
                })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="estimatedLifespan">Estimated Lifespan (Years)</Label>
              <Input
                id="estimatedLifespan"
                type="number"
                value={financialData.estimatedLifespan}
                onChange={(e) => setFinancialData({
                  ...financialData,
                  estimatedLifespan: parseInt(e.target.value) || 0
                })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="salvageValue">Salvage Value (£)</Label>
              <Input
                id="salvageValue"
                type="number"
                value={financialData.salvageValue}
                onChange={(e) => setFinancialData({
                  ...financialData,
                  salvageValue: parseFloat(e.target.value) || 0
                })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="depreciationMethod">Depreciation Method</Label>
              <Select
                value={financialData.depreciationMethod}
                onValueChange={(value: 'straight-line' | 'declining-balance') => 
                  setFinancialData({ ...financialData, depreciationMethod: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="straight-line">Straight-Line</SelectItem>
                  <SelectItem value="declining-balance">Declining Balance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="depreciationRate">Declining Balance Rate (%)</Label>
              <Input
                id="depreciationRate"
                type="number"
                value={financialData.depreciationRate}
                onChange={(e) => setFinancialData({
                  ...financialData,
                  depreciationRate: parseFloat(e.target.value) || 0
                })}
                disabled={financialData.depreciationMethod === 'straight-line'}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialTab;
