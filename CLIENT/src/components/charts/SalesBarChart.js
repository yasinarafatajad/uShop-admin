"use client"
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { api } from '@/hooks/useApi/api';

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const SalesBarChart = () => {
  const [salesData, setSalesData] = useState([]);
  const [totalSales, setTotalSales] = useState(0);
  const todayIndex = new Date().getDay();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get('/chartData');
        const weekly = data.weeklySales || [];
        // Map to day names, fill missing days with 0
        const mapped = dayNames.map((name, i) => {
          const dayData = weekly.find(w => w._id === i + 1); // MongoDB $dayOfWeek: 1=Sun
          return { name, sales: dayData?.sales || 0 };
        });
        setSalesData(mapped);
        setTotalSales(mapped.reduce((sum, d) => sum + d.sales, 0));
      } catch (err) {
        console.log('Chart data fetch failed:', err.message);
        // Fallback empty data
        setSalesData(dayNames.map(name => ({ name, sales: 0 })));
      }
    };
    fetchData();
  }, []);

  return (
    <div className="bg-card rounded-xl shadow-card p-4 md:p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-sm md:text-base">Weekly Sales</h3>
          <p className="text-xs text-muted-foreground">Last 7 days performance</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-lg md:text-xl">৳{totalSales.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">This week</p>
        </div>
      </div>
      <div className="h-48 md:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
            <XAxis dataKey="name" axisLine={false} tickLine={false}
              tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false}
              tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
              tickFormatter={(value) => `৳${value / 1000}k`} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: '0.75rem',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              }}
              labelStyle={{ color: 'var(--color-foreground)', fontWeight: 600 }}
              formatter={(value) => [`৳${value.toLocaleString()}`, 'Sales']}
            />
            <Bar dataKey="sales" radius={[6, 6, 0, 0]}>
              {salesData.map((entry, index) => (
                <Cell key={`cell-${index}`}
                  fill={index === todayIndex ? 'var(--color-primary)' : 'var(--color-primary-half)'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesBarChart;
