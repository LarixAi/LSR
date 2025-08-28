import { aiService } from '../AIService';
import { TMSContext } from '../AIService';

export interface CostAnalysis {
  period: { start: string; end: string };
  totalCosts: {
    fuel: number;
    maintenance: number;
    insurance: number;
    licensing: number;
    labor: number;
    overhead: number;
    total: number;
  };
  costBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    forecast: number;
  }>;
  costPerMile: number;
  costPerVehicle: number;
  costPerDriver: number;
  aiInsights: {
    costDrivers: string[];
    optimizationOpportunities: string[];
    riskFactors: string[];
    recommendations: string[];
  };
}

export interface BudgetOptimization {
  currentBudget: {
    fuel: number;
    maintenance: number;
    insurance: number;
    licensing: number;
    labor: number;
    overhead: number;
    total: number;
  };
  optimizedBudget: {
    fuel: number;
    maintenance: number;
    insurance: number;
    licensing: number;
    labor: number;
    overhead: number;
    total: number;
  };
  savings: {
    amount: number;
    percentage: number;
    breakdown: Array<{
      category: string;
      current: number;
      optimized: number;
      savings: number;
    }>;
  };
  recommendations: Array<{
    category: string;
    action: string;
    expectedSavings: number;
    implementation: string[];
    priority: 'low' | 'medium' | 'high';
  }>;
}

export interface FinancialForecast {
  timeHorizon: { start: string; end: string };
  revenueForecast: Array<{
    period: string;
    projected: number;
    confidence: number;
    factors: string[];
  }>;
  costForecast: Array<{
    period: string;
    projected: number;
    confidence: number;
    factors: string[];
  }>;
  profitForecast: Array<{
    period: string;
    projected: number;
    margin: number;
    confidence: number;
  }>;
  cashFlowProjection: Array<{
    period: string;
    inflow: number;
    outflow: number;
    netFlow: number;
    balance: number;
  }>;
  riskAssessment: {
    highRiskFactors: string[];
    mediumRiskFactors: string[];
    lowRiskFactors: string[];
    mitigationStrategies: string[];
  };
}

export interface ExpenseManagement {
  expenses: Array<{
    id: string;
    category: string;
    amount: number;
    date: string;
    description: string;
    vehicleId?: string;
    driverId?: string;
    status: 'pending' | 'approved' | 'rejected';
    aiAnalysis: {
      category: string;
      reasonableness: 'low' | 'medium' | 'high';
      anomalies: string[];
      recommendations: string[];
    };
  }>;
  expenseSummary: {
    totalExpenses: number;
    approvedExpenses: number;
    pendingExpenses: number;
    rejectedExpenses: number;
    averageExpense: number;
    topCategories: Array<{
      category: string;
      total: number;
      count: number;
    }>;
  };
  aiInsights: {
    unusualExpenses: string[];
    costTrends: string[];
    optimizationSuggestions: string[];
    complianceIssues: string[];
  };
}

export interface ProfitabilityAnalysis {
  period: { start: string; end: string };
  revenue: {
    total: number;
    perVehicle: number;
    perDriver: number;
    perMile: number;
    breakdown: Array<{
      source: string;
      amount: number;
      percentage: number;
    }>;
  };
  costs: {
    total: number;
    perVehicle: number;
    perDriver: number;
    perMile: number;
    breakdown: Array<{
      category: string;
      amount: number;
      percentage: number;
    }>;
  };
  profitability: {
    grossProfit: number;
    grossMargin: number;
    netProfit: number;
    netMargin: number;
    ebitda: number;
    ebitdaMargin: number;
  };
  performanceMetrics: {
    returnOnAssets: number;
    returnOnEquity: number;
    assetTurnover: number;
    profitMargin: number;
  };
  aiInsights: {
    profitabilityDrivers: string[];
    improvementOpportunities: string[];
    competitiveAnalysis: string[];
    strategicRecommendations: string[];
  };
}

export class FinancialAgent {
  private context: TMSContext | null = null;

  async setContext(context: TMSContext): Promise<void> {
    this.context = context;
  }

  async analyzeCosts(
    timeRange: { start: string; end: string },
    vehicles: any[],
    expenses: any[]
  ): Promise<CostAnalysis> {
    if (!this.context) {
      throw new Error('Context not set. Call setContext() first.');
    }

    const prompt = this.buildCostAnalysisPrompt(timeRange, vehicles, expenses);
    
    try {
      const response = await aiService.chat(prompt, this.context.user.id, 'gpt4');
      return this.parseCostAnalysisResponse(response);
    } catch (error) {
      console.error('Cost analysis error:', error);
      throw new Error('Failed to analyze costs');
    }
  }

  async optimizeBudget(
    currentBudget: any,
    historicalData: any[],
    constraints?: any
  ): Promise<BudgetOptimization> {
    if (!this.context) {
      throw new Error('Context not set. Call setContext() first.');
    }

    const prompt = this.buildBudgetOptimizationPrompt(currentBudget, historicalData, constraints);
    
    try {
      const response = await aiService.chat(prompt, this.context.user.id, 'gpt4');
      return this.parseBudgetOptimizationResponse(response);
    } catch (error) {
      console.error('Budget optimization error:', error);
      throw new Error('Failed to optimize budget');
    }
  }

  async generateFinancialForecast(
    timeHorizon: { start: string; end: string },
    historicalData: any[],
    assumptions?: any
  ): Promise<FinancialForecast> {
    if (!this.context) {
      throw new Error('Context not set. Call setContext() first.');
    }

    const prompt = this.buildFinancialForecastPrompt(timeHorizon, historicalData, assumptions);
    
    try {
      const response = await aiService.chat(prompt, this.context.user.id, 'gpt4');
      return this.parseFinancialForecastResponse(response);
    } catch (error) {
      console.error('Financial forecast error:', error);
      throw new Error('Failed to generate financial forecast');
    }
  }

  async manageExpenses(
    expenses: any[],
    policies?: any
  ): Promise<ExpenseManagement> {
    if (!this.context) {
      throw new Error('Context not set. Call setContext() first.');
    }

    const prompt = this.buildExpenseManagementPrompt(expenses, policies);
    
    try {
      const response = await aiService.chat(prompt, this.context.user.id, 'gpt4');
      return this.parseExpenseManagementResponse(response);
    } catch (error) {
      console.error('Expense management error:', error);
      throw new Error('Failed to manage expenses');
    }
  }

  async analyzeProfitability(
    timeRange: { start: string; end: string },
    financialData: any[]
  ): Promise<ProfitabilityAnalysis> {
    if (!this.context) {
      throw new Error('Context not set. Call setContext() first.');
    }

    const prompt = this.buildProfitabilityAnalysisPrompt(timeRange, financialData);
    
    try {
      const response = await aiService.chat(prompt, this.context.user.id, 'gpt4');
      return this.parseProfitabilityAnalysisResponse(response);
    } catch (error) {
      console.error('Profitability analysis error:', error);
      throw new Error('Failed to analyze profitability');
    }
  }

  private buildCostAnalysisPrompt(
    timeRange: { start: string; end: string },
    vehicles: any[],
    expenses: any[]
  ): string {
    return `As a Financial AI Agent, perform comprehensive cost analysis for this transport operation:

TIME RANGE: ${timeRange.start} to ${timeRange.end}

FLEET DATA:
- Total Vehicles: ${vehicles.length}
- Active Vehicles: ${vehicles.filter(v => v.status === 'active').length}
- Total Expenses: ${expenses.length}

Please analyze costs across:
1. Fuel costs and consumption patterns
2. Maintenance and repair expenses
3. Insurance and licensing costs
4. Labor and driver costs
5. Overhead and administrative costs
6. Cost per mile and per vehicle metrics
7. Cost trends and forecasting

Consider:
- Seasonal variations
- Vehicle age and type impact
- Driver behavior patterns
- Market conditions
- Efficiency opportunities

Return the analysis in JSON format with the following structure:
{
  "period": {
    "start": "string",
    "end": "string"
  },
  "totalCosts": {
    "fuel": number,
    "maintenance": number,
    "insurance": number,
    "licensing": number,
    "labor": number,
    "overhead": number,
    "total": number
  },
  "costBreakdown": [
    {
      "category": "string",
      "amount": number,
      "percentage": number,
      "trend": "increasing|decreasing|stable",
      "forecast": number
    }
  ],
  "costPerMile": number,
  "costPerVehicle": number,
  "costPerDriver": number,
  "aiInsights": {
    "costDrivers": ["string"],
    "optimizationOpportunities": ["string"],
    "riskFactors": ["string"],
    "recommendations": ["string"]
  }
}`;
  }

  private buildBudgetOptimizationPrompt(
    currentBudget: any,
    historicalData: any[],
    constraints?: any
  ): string {
    return `As a Financial AI Agent, optimize the transport operation budget:

CURRENT BUDGET:
${JSON.stringify(currentBudget, null, 2)}

HISTORICAL DATA POINTS: ${historicalData.length}
CONSTRAINTS: ${constraints ? JSON.stringify(constraints, null, 2) : 'None specified'}

Please optimize the budget considering:
1. Historical spending patterns
2. Efficiency opportunities
3. Market conditions
4. Operational requirements
5. Risk management
6. Growth objectives

Provide:
- Optimized budget allocation
- Expected savings
- Implementation recommendations
- Priority actions

Return the optimization in JSON format with the following structure:
{
  "currentBudget": {
    "fuel": number,
    "maintenance": number,
    "insurance": number,
    "licensing": number,
    "labor": number,
    "overhead": number,
    "total": number
  },
  "optimizedBudget": {
    "fuel": number,
    "maintenance": number,
    "insurance": number,
    "licensing": number,
    "labor": number,
    "overhead": number,
    "total": number
  },
  "savings": {
    "amount": number,
    "percentage": number,
    "breakdown": [
      {
        "category": "string",
        "current": number,
        "optimized": number,
        "savings": number
      }
    ]
  },
  "recommendations": [
    {
      "category": "string",
      "action": "string",
      "expectedSavings": number,
      "implementation": ["string"],
      "priority": "low|medium|high"
    }
  ]
}`;
  }

  private buildFinancialForecastPrompt(
    timeHorizon: { start: string; end: string },
    historicalData: any[],
    assumptions?: any
  ): string {
    return `As a Financial AI Agent, generate comprehensive financial forecasts:

TIME HORIZON: ${timeHorizon.start} to ${timeHorizon.end}
HISTORICAL DATA POINTS: ${historicalData.length}
ASSUMPTIONS: ${assumptions ? JSON.stringify(assumptions, null, 2) : 'Standard assumptions'}

Please forecast:
1. Revenue projections with confidence intervals
2. Cost projections and trends
3. Profitability forecasts
4. Cash flow projections
5. Risk assessment and mitigation

Consider:
- Market trends and seasonality
- Fleet expansion/contraction
- Regulatory changes
- Economic factors
- Operational improvements

Return the forecast in JSON format with the following structure:
{
  "timeHorizon": {
    "start": "string",
    "end": "string"
  },
  "revenueForecast": [
    {
      "period": "string",
      "projected": number,
      "confidence": number,
      "factors": ["string"]
    }
  ],
  "costForecast": [
    {
      "period": "string",
      "projected": number,
      "confidence": number,
      "factors": ["string"]
    }
  ],
  "profitForecast": [
    {
      "period": "string",
      "projected": number,
      "margin": number,
      "confidence": number
    }
  ],
  "cashFlowProjection": [
    {
      "period": "string",
      "inflow": number,
      "outflow": number,
      "netFlow": number,
      "balance": number
    }
  ],
  "riskAssessment": {
    "highRiskFactors": ["string"],
    "mediumRiskFactors": ["string"],
    "lowRiskFactors": ["string"],
    "mitigationStrategies": ["string"]
  }
}`;
  }

  private buildExpenseManagementPrompt(
    expenses: any[],
    policies?: any
  ): string {
    return `As a Financial AI Agent, analyze and manage expenses:

EXPENSES: ${expenses.length} entries
POLICIES: ${policies ? JSON.stringify(policies, null, 2) : 'Standard policies'}

Please analyze:
1. Expense categorization and validation
2. Anomaly detection
3. Policy compliance
4. Cost optimization opportunities
5. Approval recommendations

Consider:
- Expense patterns and trends
- Policy violations
- Unusual spending
- Cost-saving opportunities
- Compliance requirements

Return the analysis in JSON format with the following structure:
{
  "expenses": [
    {
      "id": "string",
      "category": "string",
      "amount": number,
      "date": "string",
      "description": "string",
      "vehicleId": "string",
      "driverId": "string",
      "status": "pending|approved|rejected",
      "aiAnalysis": {
        "category": "string",
        "reasonableness": "low|medium|high",
        "anomalies": ["string"],
        "recommendations": ["string"]
      }
    }
  ],
  "expenseSummary": {
    "totalExpenses": number,
    "approvedExpenses": number,
    "pendingExpenses": number,
    "rejectedExpenses": number,
    "averageExpense": number,
    "topCategories": [
      {
        "category": "string",
        "total": number,
        "count": number
      }
    ]
  },
  "aiInsights": {
    "unusualExpenses": ["string"],
    "costTrends": ["string"],
    "optimizationSuggestions": ["string"],
    "complianceIssues": ["string"]
  }
}`;
  }

  private buildProfitabilityAnalysisPrompt(
    timeRange: { start: string; end: string },
    financialData: any[]
  ): string {
    return `As a Financial AI Agent, perform comprehensive profitability analysis:

TIME RANGE: ${timeRange.start} to ${timeRange.end}
FINANCIAL DATA POINTS: ${financialData.length}

Please analyze:
1. Revenue breakdown and trends
2. Cost structure and efficiency
3. Profitability metrics
4. Performance ratios
5. Competitive analysis
6. Strategic insights

Consider:
- Revenue per vehicle/driver/mile
- Cost efficiency metrics
- Profit margin trends
- Return on investment
- Industry benchmarks

Return the analysis in JSON format with the following structure:
{
  "period": {
    "start": "string",
    "end": "string"
  },
  "revenue": {
    "total": number,
    "perVehicle": number,
    "perDriver": number,
    "perMile": number,
    "breakdown": [
      {
        "source": "string",
        "amount": number,
        "percentage": number
      }
    ]
  },
  "costs": {
    "total": number,
    "perVehicle": number,
    "perDriver": number,
    "perMile": number,
    "breakdown": [
      {
        "category": "string",
        "amount": number,
        "percentage": number
      }
    ]
  },
  "profitability": {
    "grossProfit": number,
    "grossMargin": number,
    "netProfit": number,
    "netMargin": number,
    "ebitda": number,
    "ebitdaMargin": number
  },
  "performanceMetrics": {
    "returnOnAssets": number,
    "returnOnEquity": number,
    "assetTurnover": number,
    "profitMargin": number
  },
  "aiInsights": {
    "profitabilityDrivers": ["string"],
    "improvementOpportunities": ["string"],
    "competitiveAnalysis": ["string"],
    "strategicRecommendations": ["string"]
  }
}`;
  }

  private parseCostAnalysisResponse(response: string): CostAnalysis {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback structure
      return {
        period: { start: '', end: '' },
        totalCosts: {
          fuel: 0,
          maintenance: 0,
          insurance: 0,
          licensing: 0,
          labor: 0,
          overhead: 0,
          total: 0
        },
        costBreakdown: [],
        costPerMile: 0,
        costPerVehicle: 0,
        costPerDriver: 0,
        aiInsights: {
          costDrivers: [response.substring(0, 100)],
          optimizationOpportunities: [],
          riskFactors: [],
          recommendations: []
        }
      };
    } catch (error) {
      console.error('Error parsing cost analysis response:', error);
      return {
        period: { start: '', end: '' },
        totalCosts: {
          fuel: 0,
          maintenance: 0,
          insurance: 0,
          licensing: 0,
          labor: 0,
          overhead: 0,
          total: 0
        },
        costBreakdown: [],
        costPerMile: 0,
        costPerVehicle: 0,
        costPerDriver: 0,
        aiInsights: {
          costDrivers: ['Failed to parse cost analysis'],
          optimizationOpportunities: [],
          riskFactors: [],
          recommendations: []
        }
      };
    }
  }

  private parseBudgetOptimizationResponse(response: string): BudgetOptimization {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback structure
      return {
        currentBudget: {
          fuel: 0,
          maintenance: 0,
          insurance: 0,
          licensing: 0,
          labor: 0,
          overhead: 0,
          total: 0
        },
        optimizedBudget: {
          fuel: 0,
          maintenance: 0,
          insurance: 0,
          licensing: 0,
          labor: 0,
          overhead: 0,
          total: 0
        },
        savings: {
          amount: 0,
          percentage: 0,
          breakdown: []
        },
        recommendations: [{
          category: 'general',
          action: response.substring(0, 100),
          expectedSavings: 0,
          implementation: [],
          priority: 'medium'
        }]
      };
    } catch (error) {
      console.error('Error parsing budget optimization response:', error);
      return {
        currentBudget: {
          fuel: 0,
          maintenance: 0,
          insurance: 0,
          licensing: 0,
          labor: 0,
          overhead: 0,
          total: 0
        },
        optimizedBudget: {
          fuel: 0,
          maintenance: 0,
          insurance: 0,
          licensing: 0,
          labor: 0,
          overhead: 0,
          total: 0
        },
        savings: {
          amount: 0,
          percentage: 0,
          breakdown: []
        },
        recommendations: [{
          category: 'general',
          action: 'Failed to parse budget optimization',
          expectedSavings: 0,
          implementation: [],
          priority: 'medium'
        }]
      };
    }
  }

  private parseFinancialForecastResponse(response: string): FinancialForecast {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback structure
      return {
        timeHorizon: { start: '', end: '' },
        revenueForecast: [],
        costForecast: [],
        profitForecast: [],
        cashFlowProjection: [],
        riskAssessment: {
          highRiskFactors: [response.substring(0, 100)],
          mediumRiskFactors: [],
          lowRiskFactors: [],
          mitigationStrategies: []
        }
      };
    } catch (error) {
      console.error('Error parsing financial forecast response:', error);
      return {
        timeHorizon: { start: '', end: '' },
        revenueForecast: [],
        costForecast: [],
        profitForecast: [],
        cashFlowProjection: [],
        riskAssessment: {
          highRiskFactors: ['Failed to parse financial forecast'],
          mediumRiskFactors: [],
          lowRiskFactors: [],
          mitigationStrategies: []
        }
      };
    }
  }

  private parseExpenseManagementResponse(response: string): ExpenseManagement {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback structure
      return {
        expenses: [],
        expenseSummary: {
          totalExpenses: 0,
          approvedExpenses: 0,
          pendingExpenses: 0,
          rejectedExpenses: 0,
          averageExpense: 0,
          topCategories: []
        },
        aiInsights: {
          unusualExpenses: [response.substring(0, 100)],
          costTrends: [],
          optimizationSuggestions: [],
          complianceIssues: []
        }
      };
    } catch (error) {
      console.error('Error parsing expense management response:', error);
      return {
        expenses: [],
        expenseSummary: {
          totalExpenses: 0,
          approvedExpenses: 0,
          pendingExpenses: 0,
          rejectedExpenses: 0,
          averageExpense: 0,
          topCategories: []
        },
        aiInsights: {
          unusualExpenses: ['Failed to parse expense management'],
          costTrends: [],
          optimizationSuggestions: [],
          complianceIssues: []
        }
      };
    }
  }

  private parseProfitabilityAnalysisResponse(response: string): ProfitabilityAnalysis {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback structure
      return {
        period: { start: '', end: '' },
        revenue: {
          total: 0,
          perVehicle: 0,
          perDriver: 0,
          perMile: 0,
          breakdown: []
        },
        costs: {
          total: 0,
          perVehicle: 0,
          perDriver: 0,
          perMile: 0,
          breakdown: []
        },
        profitability: {
          grossProfit: 0,
          grossMargin: 0,
          netProfit: 0,
          netMargin: 0,
          ebitda: 0,
          ebitdaMargin: 0
        },
        performanceMetrics: {
          returnOnAssets: 0,
          returnOnEquity: 0,
          assetTurnover: 0,
          profitMargin: 0
        },
        aiInsights: {
          profitabilityDrivers: [response.substring(0, 100)],
          improvementOpportunities: [],
          competitiveAnalysis: [],
          strategicRecommendations: []
        }
      };
    } catch (error) {
      console.error('Error parsing profitability analysis response:', error);
      return {
        period: { start: '', end: '' },
        revenue: {
          total: 0,
          perVehicle: 0,
          perDriver: 0,
          perMile: 0,
          breakdown: []
        },
        costs: {
          total: 0,
          perVehicle: 0,
          perDriver: 0,
          perMile: 0,
          breakdown: []
        },
        profitability: {
          grossProfit: 0,
          grossMargin: 0,
          netProfit: 0,
          netMargin: 0,
          ebitda: 0,
          ebitdaMargin: 0
        },
        performanceMetrics: {
          returnOnAssets: 0,
          returnOnEquity: 0,
          assetTurnover: 0,
          profitMargin: 0
        },
        aiInsights: {
          profitabilityDrivers: ['Failed to parse profitability analysis'],
          improvementOpportunities: [],
          competitiveAnalysis: [],
          strategicRecommendations: []
        }
      };
    }
  }
}

// Export singleton instance
export const financialAgent = new FinancialAgent();



