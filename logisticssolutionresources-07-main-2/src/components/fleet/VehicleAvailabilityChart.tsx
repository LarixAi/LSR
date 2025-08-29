
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const VehicleAvailabilityChart = () => {
  const data: Array<{ date: string; availability: number; target: number }> = [];

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          />
          <YAxis 
            domain={[85, 100]}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip 
            labelFormatter={(value) => new Date(value).toLocaleDateString()}
            formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name === 'availability' ? 'Availability' : 'Target']}
          />
          <Line 
            type="monotone" 
            dataKey="availability" 
            stroke="#2563eb" 
            strokeWidth={2}
            dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="target" 
            stroke="#dc2626" 
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: '#dc2626', strokeWidth: 2, r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VehicleAvailabilityChart;
