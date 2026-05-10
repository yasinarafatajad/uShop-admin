'use client'
import { useState, useEffect } from 'react';
import { Plus, Trash2, Search, Loader2 } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { api } from '@/hooks/useApi/api';

const OrderForm = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [availableProducts, setAvailableProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  const [deliveryCharges, setDeliveryCharges] = useState([]);
  const [selectedChargeId, setSelectedChargeId] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '', customerPhone: '',
    shippingAddress: '', city: '', country: 'Bangladesh',
    paymentMethod: 'COD',
    items: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoadingProducts(true);
      try {
        const [prodRes, custRes, chargeRes] = await Promise.all([
          api.get('/AllProducts'),
          api.get('/getAllCustomer'),
          api.get('/deliveryCharges/active')
        ]);
        setAvailableProducts(prodRes.data);
        setCustomers(custRes.data);
        setDeliveryCharges(chargeRes.data);
        if (chargeRes.data.length > 0) {
          setSelectedChargeId(chargeRes.data[0]._id);
        }
      } catch (err) { console.log('Fetch failed:', err.message); }
      finally { setLoadingProducts(false); }
    };
    fetchData();
  }, []);

  const filteredProducts = availableProducts.filter(p =>
    p.title.toLowerCase().includes(productSearch.toLowerCase()) &&
    !formData.items.find(item => item._id === p._id)
  );

  const filteredCustomers = customers.filter(c => 
    c.fullName.toLowerCase().includes(customerSearch.toLowerCase()) || 
    (c.email && c.email.toLowerCase().includes(customerSearch.toLowerCase())) ||
    (c.phone && c.phone.includes(customerSearch))
  );

  const addProduct = (product) => {
    setFormData({
      ...formData,
      items: [...formData.items, {
        _id: product._id, product: product._id,
        name: product.title, price: product.price, quantity: 1,
        image: product.images?.[0]?.url || '',
      }]
    });
    setShowProductSearch(false);
    setProductSearch('');
  };

  const removeProduct = (productId) => {
    setFormData({ ...formData, items: formData.items.filter(item => item._id !== productId) });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) return;
    setFormData({
      ...formData,
      items: formData.items.map(item => item._id === productId ? { ...item, quantity } : item)
    });
  };

  const subtotal = formData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Calculate Shipping
  let shipping = 0;
  let freeShippingApplied = false;
  let minOrderForFree = 0;

  if (deliveryCharges.length === 0) {
    // Fallback if no rules exist
    shipping = 100;
  } else {
    const selectedCharge = deliveryCharges.find(c => c._id === selectedChargeId);
    if (selectedCharge) {
      shipping = selectedCharge.charge;
      minOrderForFree = selectedCharge.minOrderForFree;
      if (minOrderForFree > 0 && subtotal >= minOrderForFree) {
        shipping = 0;
        freeShippingApplied = true;
      }
    }
  }

  const total = subtotal + shipping - discount;

  const applyCoupon = async () => {
    if (!couponCode) return;
    try {
      setCouponError('');
      const res = await api.post('/coupon/apply', { code: couponCode, orderAmount: subtotal });
      setDiscount(res.data.discount);
      setAppliedCoupon(res.data.coupon);
    } catch (err) {
      setCouponError(err.response?.data?.message || err.message);
      setDiscount(0);
      setAppliedCoupon(null);
    }
  };

  const handleCustomerSelect = (customerId) => {
    const customer = customers.find(c => c._id === customerId);
    if (customer) {
      setFormData({
        ...formData, customerId,
        customerName: customer.fullName,
        customerPhone: customer.phone || '',
        shippingAddress: customer.address?.street || '',
        city: customer.address?.city || '',
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customerName || !formData.shippingAddress || formData.items.length === 0) return;
    setIsSubmitting(true);
    try {
      const orderData = {
        user: formData.customerId || undefined,
        items: formData.items.map(i => ({
          product: i.product, name: i.name, price: i.price,
          quantity: i.quantity, image: i.image,
        })),
        shippingAddress: {
          fullName: formData.customerName, phone: formData.customerPhone,
          address: formData.shippingAddress, city: formData.city, country: formData.country,
        },
        paymentMethod: formData.paymentMethod,
        itemsPrice: subtotal, shippingPrice: shipping,
        discountPrice: discount,
        couponCode: appliedCoupon ? appliedCoupon.code : undefined,
        totalPrice: total, orderStatus: 'pending', isPaid: false,
      };
      await api.post('/addOrder', orderData);
      router.push('/orders');
    } catch (err) { console.log('Create order failed:', err.message); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-6">
      <PageHeader title="New Order" subtitle="Create a new order" showBack />
      <form onSubmit={handleSubmit} className="px-4 py-4 md:px-6 md:py-6 space-y-4">
        {/* Customer */}
        <div className="bg-card rounded-xl p-4 shadow-card animate-fade-in">
          <h3 className="font-semibold mb-4">Customer Information</h3>
          <div className="space-y-4">
            {customers.length > 0 && (
              <div className="space-y-2 relative">
                <label className="block text-sm font-medium">Search Existing Customer</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="text" value={customerSearch} 
                    onChange={(e) => {
                      setCustomerSearch(e.target.value);
                      setShowCustomerSuggestions(true);
                    }}
                    onFocus={() => setShowCustomerSuggestions(true)}
                    placeholder="Type name, email or phone..."
                    className="w-full h-10 pl-9 pr-4 rounded-lg bg-background border border-input focus:border-primary outline-none text-sm" />
                </div>
                
                {showCustomerSuggestions && customerSearch && (
                  <div className="absolute z-20 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredCustomers.length > 0 ? (
                      filteredCustomers.map(c => (
                        <div key={c._id} 
                          onClick={() => {
                            handleCustomerSelect(c._id);
                            setCustomerSearch(c.fullName);
                            setShowCustomerSuggestions(false);
                          }}
                          className="p-2 hover:bg-muted cursor-pointer text-sm border-b border-border last:border-0"
                        >
                          <p className="font-medium">{c.fullName}</p>
                          <p className="text-xs text-muted-foreground">{c.phone || c.email}</p>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-sm text-muted-foreground text-center">No customer found</div>
                    )}
                  </div>
                )}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1.5">Customer Name <span className="text-destructive">*</span></label>
              <input type="text" value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                placeholder="Enter customer name"
                className="w-full h-11 px-4 rounded-xl bg-background border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Phone</label>
                <input type="tel" value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  placeholder="+8801*******83"
                  className="w-full h-11 px-4 rounded-xl bg-background border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Payment Method <span className="text-destructive">*</span></label>
                <select value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl bg-background border border-input focus:border-primary outline-none text-sm appearance-none cursor-pointer">
                  <option value="COD">Cash on Delivery</option>
                  <option value="Bkash">Bkash</option>
                  <option value="Nagad">Nagad</option>
                  <option value="Card">Card</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Shipping Address <span className="text-destructive">*</span></label>
              <textarea value={formData.shippingAddress}
                onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                placeholder="Enter full shipping address" rows={2}
                className="w-full px-4 py-3 rounded-xl bg-background border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm resize-none" />
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-card rounded-xl p-4 shadow-card animate-fade-in" style={{ animationDelay: '50ms' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Order Items</h3>
            <button type="button" onClick={() => setShowProductSearch(true)}
              className="flex items-center gap-1.5 text-sm text-primary font-medium">
              <Plus className="w-4 h-4" /> Add Product
            </button>
          </div>

          {showProductSearch && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center animate-fade-in">
              <div className="bg-card w-full md:max-w-md md:rounded-xl rounded-t-xl max-h-[80vh] overflow-hidden">
                <div className="p-4 border-b border-border">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">Add Product</h3>
                    <button type="button" onClick={() => { setShowProductSearch(false); setProductSearch(''); }}
                      className="text-muted-foreground hover:text-foreground">✕</button>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="text" value={productSearch} onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Search products..." autoFocus
                      className="w-full h-10 pl-9 pr-4 rounded-lg bg-background border border-input focus:border-primary outline-none text-sm" />
                  </div>
                </div>
                <div className="overflow-y-auto max-h-[60vh] p-2">
                  {loadingProducts ? (
                    <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                  ) : filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <button key={product._id} type="button" onClick={() => addProduct(product)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-muted rounded-lg transition-colors text-left">
                        {product.images?.[0]?.url ? (
                          <Image height={48} width={48} src={product.images[0].url} alt={product.title} className="rounded-lg object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground">No img</div>
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-sm">{product.title}</p>
                          <p className="text-xs text-muted-foreground">{product.stock} in stock</p>
                        </div>
                        <span className="font-semibold">৳{product.price}</span>
                      </button>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No products found</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {formData.items.length > 0 ? (
            <div className="space-y-3">
              {formData.items.map((item) => (
                <div key={item._id} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-xs">No img</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">৳{item.price} each</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      className="w-7 h-7 rounded-full bg-background border border-input flex items-center justify-center text-sm hover:bg-muted">-</button>
                    <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                    <button type="button" onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="w-7 h-7 rounded-full bg-background border border-input flex items-center justify-center text-sm hover:bg-muted">+</button>
                  </div>
                  <button type="button" onClick={() => removeProduct(item._id)}
                    className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No items added yet</p>
              <p className="text-xs mt-1">Click &quot;Add Product&quot; to add items</p>
            </div>
          )}
        </div>

        {/* Order Summary */}
        {formData.items.length > 0 && (
          <div className="bg-card rounded-xl p-4 shadow-card animate-fade-in" style={{ animationDelay: '100ms' }}>
            <h3 className="font-semibold mb-3">Order Summary</h3>
            <div className="space-y-4">
              {/* Delivery Select */}
              {deliveryCharges.length > 0 ? (
                <div>
                  <label className="block text-sm font-medium mb-1.5">Delivery Area</label>
                  <select value={selectedChargeId} onChange={(e) => setSelectedChargeId(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg bg-background border border-input focus:border-primary outline-none text-sm">
                    {deliveryCharges.map(charge => (
                      <option key={charge._id} value={charge._id}>{charge.name} - ৳{charge.charge}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-1.5">Delivery Area</label>
                  <div className="w-full h-10 px-3 flex items-center rounded-lg bg-muted border border-input text-sm text-muted-foreground">
                    Standard Delivery (No rules configured)
                  </div>
                </div>
              )}
              
              {/* Coupon */}
              <div>
                <label className="block text-sm font-medium mb-1.5">Discount Coupon</label>
                <div className="flex gap-2">
                  <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter code" className="flex-1 h-10 px-3 rounded-lg bg-background border border-input focus:border-primary outline-none text-sm uppercase" />
                  <button type="button" onClick={applyCoupon}
                    className="px-4 h-10 bg-secondary text-foreground rounded-lg text-sm font-medium hover:bg-secondary/80">Apply</button>
                </div>
                {couponError && <p className="text-xs text-destructive mt-1">{couponError}</p>}
                {appliedCoupon && <p className="text-xs text-success mt-1">Coupon applied successfully!</p>}
              </div>

              <div className="space-y-2 text-sm pt-2 border-t border-border">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal ({formData.items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span>৳{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{shipping === 0 ? 'Free' : `৳${shipping.toFixed(2)}`}</span>
                </div>
                {minOrderForFree > 0 && !freeShippingApplied && (
                  <p className="text-[10px] text-muted-foreground text-right">Free shipping over ৳{minOrderForFree}</p>
                )}
                {freeShippingApplied && (
                  <p className="text-[10px] text-success text-right">Free shipping applied!</p>
                )}
                {discount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Discount</span>
                    <span>-৳{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-base pt-2 border-t border-border">
                  <span>Total</span>
                  <span>৳{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <button type="submit" disabled={isSubmitting}
          className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 animate-fade-in"
          style={{ animationDelay: '150ms' }}>
          {isSubmitting ? 'Creating Order...' : 'Create Order'}
        </button>
      </form>
    </div>
  );
};

export default OrderForm;
