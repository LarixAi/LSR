
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const CostAnalysisChart = () => {
  const data: Array<{ month: string; planned: number; unplanned: number; total: number }> = [];

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
          <Tooltip 
            formatter={(value: number, name: string) => [
              `$${value.toLocaleString()}`, 
              name === 'planned' ? 'Planned Maintenance' : 
              name === 'unplanned' ? 'Unplanned Repairs' : 'Total Cost'
            ]}
          />
          <Legend />
          <Bar dataKey="planned" stackId="a" fill="#10b981" name="Planned Maintenance" />
          <Bar dataKey="unplanned" stackId="a" fill="#f59e0b" name="Unplanned Repairs" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CostAnalysisChart;
