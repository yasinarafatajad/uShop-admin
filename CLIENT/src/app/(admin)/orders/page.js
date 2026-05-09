'use client'
import { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import OrderRow from '@/components/ui/OrderRow';
import { useRouter } from 'next/navigation';
import { api } from '@/hooks/useApi/api';

const statusFilters = ['All', 'Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

const Orders = () => {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/getAllOrder');
        setOrders(data);
      } catch (err) { console.log('Fetch orders failed:', err.message); }
      finally { setLoading(false); }
    };
    fetchOrders();
  }, []);

  const mappedOrders = orders.map(o => ({
    id: o._id,
    customer: o.shippingAddress?.fullName || 'N/A',
    items: o.items?.length || 0,
    total: o.totalPrice?.toFixed(2) || '0.00',
    status: o.orderStatus || 'pending',
    date: new Date(o.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  }));

  const filteredOrders = mappedOrders.filter(order => {
    const matchesSearch = order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.includes(searchQuery);
    const matchesFilter = activeFilter === 'All' || order.status.toLowerCase() === activeFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen">
        <PageHeader title="Orders" subtitle="Loading..." />
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PageHeader 
        title="Orders" 
        subtitle={`${orders.length} total orders`}
        actions={
          <button onClick={() => router.push('/orders/new')}
            className="flex items-center gap-1.5 h-9 px-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Order</span>
          </button>
        }
      />
      <div className="px-4 py-4 md:px-6 md:py-6 space-y-4">
        <div className="flex gap-3 animate-fade-in">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order ID or customer..."
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-card border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm" />
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 animate-fade-in" style={{ animationDelay: '50ms' }}>
          {statusFilters.map((filter) => (
            <button key={filter} onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeFilter === filter
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-input text-muted-foreground hover:text-foreground'
              }`}>
              {filter}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order, index) => (
              <OrderRow key={order.id} order={order} delay={index * 30} />
            ))
          ) : (
            <div className="text-center py-12 animate-fade-in">
              <p className="text-muted-foreground">No orders found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orders;
