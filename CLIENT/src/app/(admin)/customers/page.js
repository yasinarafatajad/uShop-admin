'use client'
import { useState, useEffect } from 'react';
import { Search, UserPlus } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import CustomerRow from '@/components/ui/CustomerRow';
import { useRouter } from 'next/navigation';
import { api } from '@/hooks/useApi/api';

const Customers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const { data } = await api.get('/getAllCustomer');
        setCustomers(data);
      } catch (err) { console.log('Fetch customers failed:', err.message); }
      finally { setLoading(false); }
    };
    fetchCustomers();
  }, []);

  const mappedCustomers = customers.map(c => ({
    id: c._id,
    name: c.fullName,
    email: c.email,
    orders: c.orders?.length || 0,
    spent: (c.totalSpent || 0).toLocaleString(),
    joined: new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
  }));

  const filteredCustomers = mappedCustomers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen">
        <PageHeader title="Customers" subtitle="Loading..." />
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PageHeader 
        title="Customers" 
        subtitle={`${customers.length} customers`}
        actions={
          <button 
            onClick={() => router.push('/customers/new')}
            className="w-10 h-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center hover:opacity-90 active:scale-95 transition-all"
          >
            <UserPlus className="w-5 h-5" />
          </button>
        }
      />
      <div className="px-4 py-4 md:px-6 md:py-6 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 animate-fade-in">
          <div className="bg-card rounded-xl p-3 shadow-card text-center">
            <p className="text-lg font-bold">{customers.length}</p>
            <p className="text-xs text-muted-foreground">Customers</p>
          </div>
          <div className="bg-card rounded-xl p-3 shadow-card text-center">
            <p className="text-lg font-bold">{customers.filter(c => !c.isBlocked).length}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </div>
        </div>
        {/* Search */}
        <div className="relative animate-fade-in" style={{ animationDelay: '50ms' }}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customers..."
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-card border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm" />
        </div>
        {/* List */}
        <div className="space-y-3">
          {filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer, index) => (
              <CustomerRow key={customer.id} customer={customer} delay={index * 30} />
            ))
          ) : (
            <div className="text-center py-12 animate-fade-in">
              <p className="text-muted-foreground">No customers found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Customers;
