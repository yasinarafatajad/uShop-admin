'use client'
import { useState, useEffect } from 'react'
import { Package, Truck, CheckCircle, Clock, XCircle, MapPin, Phone, Mail } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/hooks/useApi/api';

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-warning/10 text-warning border-warning/20', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-primary/10 text-primary border-primary/20', icon: Package },
  shipped: { label: 'Shipped', color: 'bg-accent/10 text-accent border-accent/20', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-success/10 text-success border-success/20', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-destructive/10 text-destructive border-destructive/20', icon: XCircle },
};

const statusFlow = ['pending', 'confirmed', 'shipped', 'delivered'];

const OrderDetail = () => {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/getOrder/${id}`);
        setOrder(data);
      } catch (err) { console.log('Fetch order failed:', err.message); }
      finally { setLoading(false); }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Order not found</p>
          <button onClick={() => router.push('/orders')} className="text-primary hover:underline">Back to Orders</button>
        </div>
      </div>
    );
  }

  const currentStatus = order.orderStatus || 'pending';
  const StatusIcon = statusConfig[currentStatus]?.icon || Clock;
  const currentStatusIndex = statusFlow.indexOf(currentStatus);

  const updateStatus = async (newStatus) => {
    setIsUpdating(true);
    try {
      await api.put(`/updateOrder/${id}`, { orderStatus: newStatus });
      setOrder({ ...order, orderStatus: newStatus });
    } catch (err) { console.log('Update failed:', err.message); }
    finally { setIsUpdating(false); }
  };

  const cancelOrder = async () => {
    setIsUpdating(true);
    try {
      await api.put(`/updateOrder/${id}`, { orderStatus: 'cancelled' });
      setOrder({ ...order, orderStatus: 'cancelled' });
    } catch (err) { console.log('Cancel failed:', err.message); }
    finally { setIsUpdating(false); }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-6">
      <PageHeader
        title={`Order #${order._id?.slice(-6)}`}
        subtitle={new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        showBack
      />
      <div className="px-4 py-4 md:px-6 md:py-6 space-y-4">
        {/* Status Card */}
        <div className="bg-card rounded-xl p-4 shadow-card animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${statusConfig[currentStatus]?.color}`}>
                <StatusIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold">{statusConfig[currentStatus]?.label}</p>
                <p className="text-xs text-muted-foreground">Current Status</p>
              </div>
            </div>
            <span className={`text-xs font-medium px-3 py-1 rounded-full border ${statusConfig[currentStatus]?.color}`}>
              {statusConfig[currentStatus]?.label}
            </span>
          </div>
          {currentStatus !== 'cancelled' && (
            <div className="flex items-center gap-1 mb-4">
              {statusFlow.map((status, index) => (
                <div key={status} className="flex-1 flex items-center">
                  <div className={`h-1.5 flex-1 rounded-full transition-colors ${index <= currentStatusIndex ? 'bg-primary' : 'bg-muted'}`} />
                </div>
              ))}
            </div>
          )}
          {currentStatus !== 'cancelled' && currentStatus !== 'delivered' && (
            <div className="flex gap-2 flex-wrap">
              {currentStatusIndex < statusFlow.length - 1 && (
                <button onClick={() => updateStatus(statusFlow[currentStatusIndex + 1])} disabled={isUpdating}
                  className="flex-1 h-10 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
                  {isUpdating ? 'Updating...' : `Mark as ${statusConfig[statusFlow[currentStatusIndex + 1]]?.label}`}
                </button>
              )}
              <button onClick={cancelOrder} disabled={isUpdating}
                className="h-10 px-4 bg-destructive/10 text-destructive rounded-lg text-sm font-medium hover:bg-destructive/20 transition-colors disabled:opacity-50">
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Order Items */}
        <div className="bg-card rounded-xl p-4 shadow-card animate-fade-in" style={{ animationDelay: '50ms' }}>
          <h3 className="font-semibold mb-3">Items ({order.items?.length || 0})</h3>
          <div className="space-y-3">
            {order.items?.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover bg-muted" />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center">
                    <Package className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <p className="font-semibold text-sm">৳{(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-border mt-4 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>৳{(order.itemsPrice || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span>{(order.shippingPrice || 0) === 0 ? 'Free' : `৳${(order.shippingPrice || 0).toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>৳{(order.totalPrice || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-card rounded-xl p-4 shadow-card animate-fade-in" style={{ animationDelay: '100ms' }}>
          <h3 className="font-semibold mb-3">Customer</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-semibold">{order.shippingAddress?.fullName?.charAt(0) || '?'}</span>
              </div>
              <div>
                <p className="font-medium">{order.shippingAddress?.fullName || 'N/A'}</p>
                <p className="text-xs text-muted-foreground">Customer</p>
              </div>
            </div>
            {order.shippingAddress?.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{order.shippingAddress.phone}</span>
              </div>
            )}
            {order.shippingAddress?.address && (
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                <span>{order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.country}</span>
              </div>
            )}
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-card rounded-xl p-4 shadow-card animate-fade-in" style={{ animationDelay: '150ms' }}>
          <h3 className="font-semibold mb-3">Payment</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Method</span>
              <span>{order.paymentMethod || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Paid</span>
              <span className={order.isPaid ? 'text-success' : 'text-warning'}>{order.isPaid ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
