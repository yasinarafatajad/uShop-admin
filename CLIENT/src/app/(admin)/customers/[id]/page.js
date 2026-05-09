'use client'
import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Calendar, ShoppingBag, DollarSign, Edit2, Trash2 } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/hooks/useApi/api';

const CustomerDetail = () => {
  const { id } = useParams();
  const router = useRouter();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const { data } = await api.get(`/getCustomer/${id}`);
        setCustomer(data);
      } catch (err) { console.log('Fetch failed:', err.message); }
      finally { setLoading(false); }
    };
    fetchCustomer();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <p className="text-muted-foreground mb-4">Customer not found</p>
          <button onClick={() => router.push('/customers')} className="text-primary hover:underline">Back to Customers</button>
        </div>
      </div>
    );
  }

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/deleteCustomer/${id}`);
      router.push('/customers');
    } catch (err) { console.log('Delete failed:', err.message); }
    finally { setDeleting(false); }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-6">
      <PageHeader title="Customer Details" showBack
        actions={
          <div className="flex gap-2">
            <button onClick={() => router.push(`/customers/${customer._id}/edit`)}
              className="w-10 h-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center hover:opacity-90 active:scale-95 transition-all">
              <Edit2 className="w-5 h-5" />
            </button>
            <button onClick={handleDelete} disabled={deleting}
              className="w-10 h-10 bg-destructive text-destructive-foreground rounded-xl flex items-center justify-center hover:opacity-90 active:scale-95 transition-all disabled:opacity-50">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        }
      />
      <div className="px-4 py-4 md:px-6 md:py-6 space-y-4">
        {/* Header */}
        <div className="bg-card rounded-xl p-5 shadow-card animate-fade-in">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary text-2xl font-bold">{customer.fullName?.charAt(0)}</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold">{customer.fullName}</h2>
              <p className="text-sm text-muted-foreground">
                Customer since {new Date(customer.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </p>
              <div className="flex gap-2 mt-1">
                {customer.isBlocked && (
                  <span className="px-2 py-0.5 bg-destructive/10 text-destructive text-xs rounded-full">Blocked</span>
                )}
                {customer.isVerified && (
                  <span className="px-2 py-0.5 bg-success/10 text-success text-xs rounded-full">Verified</span>
                )}
                <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full capitalize">{customer.role}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 animate-fade-in" style={{ animationDelay: '50ms' }}>
          <div className="bg-card rounded-xl p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{customer.orders?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Total Orders</p>
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{customer.orders?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Orders Placed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-card rounded-xl p-4 shadow-card animate-fade-in" style={{ animationDelay: '100ms' }}>
          <h3 className="font-semibold mb-3">Contact Information</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{customer.email}</span>
            </div>
            {customer.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{customer.phone}</span>
              </div>
            )}
            {customer.address && (
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                <span className="text-sm">
                  {[customer.address.street, customer.address.city, customer.address.district, customer.address.postalCode, customer.address.country]
                    .filter(Boolean).join(', ')}
                </span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Joined {new Date(customer.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetail;
