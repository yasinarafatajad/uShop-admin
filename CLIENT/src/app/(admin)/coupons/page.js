'use client'
import { useState, useEffect } from 'react';
import { Trash2, Edit } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import { api } from '@/hooks/useApi/api';

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: 0,
    minOrderAmount: 0,
    maxDiscount: 0,
    usageLimit: 0,
    expiresAt: '',
    isActive: true
  });

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/coupons');
      setCoupons(data);
    } catch (err) {
      console.log('Fetch failed:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isEditing) {
        await api.put(`/coupon/${currentId}`, formData);
      } else {
        await api.post('/coupon', formData);
      }
      resetForm();
      fetchCoupons();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleEdit = (coupon) => {
    setIsEditing(true);
    setCurrentId(coupon._id);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount || 0,
      maxDiscount: coupon.maxDiscount || 0,
      usageLimit: coupon.usageLimit || 0,
      expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().split('T')[0] : '',
      isActive: coupon.isActive
    });
    setError('');
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await api.delete(`/coupon/${id}`);
      fetchCoupons();
    } catch (err) {
      console.log('Delete failed:', err.message);
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      code: '',
      discountType: 'percentage',
      discountValue: 0,
      minOrderAmount: 0,
      maxDiscount: 0,
      usageLimit: 0,
      expiresAt: '',
      isActive: true
    });
    setError('');
  };

  return (
    <div className="min-h-screen">
      <PageHeader title="Discount Coupons" subtitle="Manage promo codes and discounts" />
      
      <div className="px-4 py-4 md:px-6 md:py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form */}
        <div className="bg-card rounded-xl p-4 shadow-card h-fit">
          <h3 className="font-semibold mb-4">{isEditing ? 'Edit Coupon' : 'New Coupon'}</h3>
          {error && <p className="text-xs text-destructive mb-3 bg-destructive/10 p-2 rounded">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Coupon Code <span className="text-destructive">*</span></label>
              <input type="text" value={formData.code} required uppercase="true"
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g. SUMMER20"
                className="w-full h-11 px-4 rounded-xl bg-background border border-input focus:border-primary outline-none text-sm uppercase" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1.5">Discount Type</label>
                <select value={formData.discountType} onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl bg-background border border-input focus:border-primary outline-none text-sm appearance-none">
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (৳)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Value <span className="text-destructive">*</span></label>
                <input type="number" value={formData.discountValue} required min="1"
                  onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                  className="w-full h-11 px-4 rounded-xl bg-background border border-input focus:border-primary outline-none text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Min Order Amount (৳)</label>
              <input type="number" value={formData.minOrderAmount} min="0"
                onChange={(e) => setFormData({ ...formData, minOrderAmount: Number(e.target.value) })}
                className="w-full h-11 px-4 rounded-xl bg-background border border-input focus:border-primary outline-none text-sm" />
            </div>
            {formData.discountType === 'percentage' && (
              <div>
                <label className="block text-sm font-medium mb-1.5">Max Discount (৳) (0 = unlimited)</label>
                <input type="number" value={formData.maxDiscount} min="0"
                  onChange={(e) => setFormData({ ...formData, maxDiscount: Number(e.target.value) })}
                  className="w-full h-11 px-4 rounded-xl bg-background border border-input focus:border-primary outline-none text-sm" />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1.5">Usage Limit (0 = no limit)</label>
                <input type="number" value={formData.usageLimit} min="0"
                  onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
                  className="w-full h-11 px-4 rounded-xl bg-background border border-input focus:border-primary outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Expiry Date</label>
                <input type="date" value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl bg-background border border-input focus:border-primary outline-none text-sm" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isActive" checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 rounded border-input" />
              <label htmlFor="isActive" className="text-sm font-medium cursor-pointer">Active</label>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="flex-1 h-11 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors">
                {isEditing ? 'Update Coupon' : 'Create Coupon'}
              </button>
              {isEditing && (
                <button type="button" onClick={resetForm} className="px-4 h-11 bg-secondary text-foreground rounded-xl font-medium hover:bg-secondary/80 transition-colors">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="font-semibold text-lg">Existing Coupons</h3>
          {loading ? (
            <div className="flex justify-center py-8"><div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>
          ) : coupons.length > 0 ? (
            <div className="grid gap-3">
              {coupons.map(coupon => (
                <div key={coupon._id} className="bg-card rounded-xl p-4 shadow-card flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-lg font-mono text-primary">{coupon.code}</h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${coupon.isActive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-sm font-medium mt-1">
                      {coupon.discountType === 'percentage' ? `${coupon.discountValue}% off` : `৳${coupon.discountValue} off`}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                      {coupon.minOrderAmount > 0 && <span>Min Order: ৳{coupon.minOrderAmount}</span>}
                      {coupon.discountType === 'percentage' && coupon.maxDiscount > 0 && <span>Max: ৳{coupon.maxDiscount}</span>}
                      {coupon.usageLimit > 0 && <span>Limit: {coupon.usedCount}/{coupon.usageLimit}</span>}
                      {coupon.expiresAt && <span>Expiry: {new Date(coupon.expiresAt).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleEdit(coupon)} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(coupon._id)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-card rounded-xl border border-dashed border-border">
              <p className="text-muted-foreground">No coupons defined.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Coupons;
