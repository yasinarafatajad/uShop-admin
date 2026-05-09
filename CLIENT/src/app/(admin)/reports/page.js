'use client'
import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package, Download } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { api } from '@/hooks/useApi/api';

const dayNames = ['', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const Reports = () => {
  const [period, setPeriod] = useState('week');
  const [metrics, setMetrics] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const weeklyIndex = new Date().getDay();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get('/chartData');
        const m = data.metrics || {};
        setMetrics([
          { label: 'Total Revenue', value: `৳${(m.totalRevenue || 0).toLocaleString()}`, icon: DollarSign },
          { label: 'Total Orders', value: (m.totalOrders || 0).toLocaleString(), icon: ShoppingCart },
          { label: 'Total Customers', value: (m.totalCustomers || 0).toLocaleString(), icon: Users },
          { label: 'Total Products', value: (m.totalProducts || 0).toLocaleString(), icon: Package },
        ]);

        // Weekly
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const weekly = days.map((name, i) => {
          const d = (data.weeklySales || []).find(w => w._id === i + 1);
          return { today: name, sales: d?.sales || 0, orders: d?.orders || 0 };
        });
        setWeeklyData(weekly);

        // Categories
        setCategoryData((data.categoryBreakdown || []).map(c => ({
          name: c._id || 'Other', count: c.count,
          percentage: 0,
        })));
        // Calc percentages
        const total = (data.categoryBreakdown || []).reduce((s, c) => s + c.count, 0);
        if (total > 0) {
          setCategoryData(prev => prev.map(c => ({ ...c, percentage: Math.round((c.count / total) * 100) })));
        }
      } catch (err) { console.log('Report data fetch failed:', err.message); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen">
        <PageHeader title="Reports" subtitle="Loading..." />
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PageHeader title="Reports" subtitle="Analytics overview"
        actions={
          <button onClick={() => window.print()}
            className="w-10 h-10 hidden bg-card border border-input rounded-xl md:flex items-center justify-center hover:bg-secondary transition-colors">
            <Download className="w-5 h-5" />
          </button>
        }
      />
      <div className="px-4 py-4 md:px-6 md:py-6 space-y-6">
        {/* Metrics */}
        <div className="grid grid-cols-2 gap-3 animate-fade-in">
          {metrics.map((metric) => (
            <div key={metric.label} className="bg-card rounded-xl p-4 shadow-card">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <metric.icon className="w-4 h-4 text-primary" />
                </div>
              </div>
              <p className="text-xl font-bold">{metric.value}</p>
              <p className="text-xs text-muted-foreground">{metric.label}</p>
            </div>
          ))}
        </div>

        {/* Weekly Chart */}
        <div className="bg-card rounded-xl p-4 shadow-card animate-fade-in" style={{ animationDelay: '100ms' }}>
          <h3 className="font-semibold mb-4">Weekly Sales</h3>
          <div className="h-48 md:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} barGap={6} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="today" axisLine={false} tickLine={false}
                  tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }} />
                <YAxis yAxisId="sales" axisLine={false} tickLine={false}
                  tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }}
                  tickFormatter={(v) => `৳${v / 1000}k`} />
                <YAxis yAxisId="orders" orientation="right" axisLine={false} tickLine={false}
                  tick={{ fill: 'var(--color-muted-foreground)', fontSize: 12 }} />
                <Tooltip cursor={{ fill: 'var(--color-secondary)' }}
                  contentStyle={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '0.75rem' }}
                  formatter={(value, name) => name === 'sales' ? [`৳${value.toLocaleString()}`, 'Revenue'] : [value, 'Orders']} />
                <Bar yAxisId="sales" dataKey="sales" radius={[6, 6, 0, 0]}>
                  {weeklyData.map((_, index) => (
                    <Cell key={index} fill={index === weeklyIndex ? 'var(--color-primary)' : 'var(--color-primary-half)'} />
                  ))}
                </Bar>
                <Bar yAxisId="orders" dataKey="orders" radius={[6, 6, 0, 0]}>
                  {weeklyData.map((_, index) => (
                    <Cell key={index} fill={index === weeklyIndex ? 'var(--color-accent)' : 'var(--color-muted)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary/50" />
              <span className="text-xs text-muted-foreground">Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-muted" />
              <span className="text-xs text-muted-foreground">Orders</span>
            </div>
          </div>
        </div>

        {/* Top Categories */}
        <div className="bg-card rounded-xl p-4 shadow-card animate-fade-in" style={{ animationDelay: '150ms' }}>
          <h3 className="font-semibold mb-4">Top Brands</h3>
          <div className="space-y-4">
            {categoryData.length > 0 ? categoryData.map((category, index) => (
              <div key={category.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">{category.name}</span>
                  <span className="text-sm font-medium">{category.count} products</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all duration-700"
                    style={{ width: `${category.percentage}%`, transitionDelay: `${index * 100}ms` }} />
                </div>
              </div>
            )) : (
              <p className="text-center text-muted-foreground py-4">No data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
