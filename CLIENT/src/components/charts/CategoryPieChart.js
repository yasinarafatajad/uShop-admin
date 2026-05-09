"use client"
import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { api } from '@/hooks/useApi/api';

const COLORS = ['var(--color-primary)', 'var(--color-accent)', 'var(--color-warning)', 'var(--color-destructive)', 'var(--color-success)'];
const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="var(--color-primary-foreground)" textAnchor="middle"
      dominantBaseline="central" fontSize={12} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const CustomLegend = ({ payload }) => (
  <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
    {payload.map((entry, index) => (
      <div key={`legend-${index}`} className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
        <span className="text-xs text-muted-foreground">{entry.value}</span>
      </div>
    ))}
  </div>
);

const CategoryPieChart = () => {
  const [categoryData, setCategoryData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get('/chartData');
        const breakdown = data.categoryBreakdown || [];
        const mapped = breakdown.map((item, i) => ({
          name: item._id || 'Other',
          value: item.count,
          color: COLORS[i % COLORS.length],
        }));
        setCategoryData(mapped.length > 0 ? mapped : [{ name: 'No Data', value: 1, color: 'var(--color-muted)' }]);
      } catch (err) {
        console.log('Category data fetch failed:', err.message);
        setCategoryData([{ name: 'No Data', value: 1, color: 'var(--color-muted)' }]);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="bg-card rounded-xl shadow-card p-4 md:p-6 animate-fade-in">
      <div className="mb-4">
        <h3 className="font-semibold text-sm md:text-base">Products by Brand</h3>
        <p className="text-xs text-muted-foreground">Distribution of product brands</p>
      </div>
      <div className="h-48 md:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={categoryData} cx="50%" cy="50%" labelLine={false}
              label={renderCustomizedLabel} outerRadius={80} innerRadius={40}
              paddingAngle={2} dataKey="value" cornerRadius={5}>
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: '0.75rem',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              }}
              formatter={(value) => [`${value} products`, 'Count']}
            />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CategoryPieChart;
