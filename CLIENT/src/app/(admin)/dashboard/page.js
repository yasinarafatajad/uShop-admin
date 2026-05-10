import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import StatsCard from '../../../components/ui/StatsCard';
import SalesBarChart from '../../../components/charts/SalesBarChart';
import CategoryPieChart from '../../../components/charts/CategoryPieChart';
import Link from 'next/link';
import OrderRow from '../../../components/ui/OrderRow';
import Image from 'next/image';
import PageHeader from '@/components/layout/PageHeader';
import { api } from '@/hooks/useApi/api';

export const metadata = {
  title: 'Dashboard | Admin Panel',
  description: 'Admin dashboard overview and analytics',
};

const dashboard = async () => {
  // Fetch stats
  let Stats = { totalRevenue: 0, totalOrder: 0, totalProduct: 0, totalCustomer: 0 };
  let recentOrders = [];
  let topProducts = [];

  try {
    const { data } = await api.get('/getStats');
    Stats = data;
  } catch (err) {
    console.log('Stats fetch failed:', err.message);
  }

  try {
    const { data } = await api.get('/dashboard');
    recentOrders = data.recentOrders || [];
    topProducts = data.topProducts || [];
  } catch (err) {
    console.log('Dashboard data fetch failed:', err.message);
  }

  const stats = [
    {
      title: 'Total Revenue',
      value: `৳${Stats?.totalRevenue > 0 ? Stats.totalRevenue.toLocaleString() : 0}`,
      changeType: 'positive',
      icon: DollarSign,
    },
    {
      title: 'Orders',
      value: Stats?.totalOrder > 0 ? Stats.totalOrder : 0,
      changeType: 'positive',
      icon: ShoppingCart,
    },
    {
      title: 'Products',
      value: Stats?.totalProduct > 0 ? Stats.totalProduct : 0,
      changeType: 'positive',
      icon: Package,
    },
    {
      title: 'Customers',
      value: Stats?.totalCustomer > 0 ? Stats.totalCustomer : 0,
      changeType: 'positive',
      icon: Users,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* page header component */}
      <PageHeader title="Dashboard" subtitle="Welcome back, Admin" />

      <div className="px-4 py-4 md:px-6 md:py-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {stats.map((stat, index) => (
            <StatsCard key={stat.title} {...stat} delay={index * 50} />
          ))}
        </div>

        {/* Charts Section */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          style={{ animationDelay: '150ms' }}
        >
          <SalesBarChart />
          <CategoryPieChart />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 animate-fade-in" style={{ animationDelay: '200ms' }}>
          <Link
            href="/products/new"
            className="bg-[#4c7fff]/10 rounded-xl p-4 flex items-center gap-3 hover:bg-[#4c7fff]/20 transition-colors active:scale-[0.98]"
          >
            <div className="w-10 h-10 rounded-lg bg-[#4c7fff] flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-sm">Add Product</p>
              <p className="text-xs text-muted-foreground">Quick add</p>
            </div>
          </Link>
          <Link
            href="/reports"
            className="bg-[#29a66f]/10 rounded-xl p-4 flex items-center gap-3 hover:bg-[#29a66f]/20 transition-colors active:scale-[0.98]"
          >
            <div className="w-10 h-10 rounded-lg bg-[#29a66f] flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-sm">View Sales</p>
              <p className="text-xs text-muted-foreground">Analytics</p>
            </div>
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Recent Orders</h2>
            <Link
              href="/orders"
              className="text-sm text-primary flex items-center gap-1 hover:underline"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentOrders.length > 0 ? (
              recentOrders.map((order, index) => (
                <OrderRow
                  key={order._id}
                  order={{
                    id: order._id,
                    customer: order.shippingAddress?.fullName || 'N/A',
                    items: order.items?.length || 0,
                    total: order.totalPrice?.toFixed(2) || '0.00',
                    status: order.orderStatus || 'pending',
                    date: new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                  }}
                  delay={index * 50}
                />
              ))
            ) : (
              <div className="bg-card rounded-xl p-6 shadow-card text-center">
                <p className="text-muted-foreground text-sm">No orders yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="animate-fade-in" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Top Products</h2>
            <Link
              href="/products"
              className="text-sm text-primary flex items-center gap-1 hover:underline"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="bg-card rounded-xl shadow-card overflow-hidden">
            {topProducts.length > 0 ? (
              topProducts.map((product, index) => (
                <div
                  key={product._id}
                  className={`flex items-center gap-4 p-4 ${index !== topProducts.length - 1
                      ? 'border-b border-border'
                      : ''
                    }`}
                >
                  {product.images?.[0]?.url ? (
                    <Image
                      src={product.images[0].url}
                      alt={product.title}
                      width={48}
                      height={48}
                      className="rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                      <Package className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{product.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {product.totalSold || 0} sold • {product.stock} in stock
                    </p>
                  </div>
                  <span className="font-semibold text-sm text-success">৳{(product.totalRevenue || 0).toLocaleString()}</span>
                </div>
              ))
            ) : (
              <div className="p-6 text-center">
                <p className="text-muted-foreground text-sm">No products yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default dashboard;