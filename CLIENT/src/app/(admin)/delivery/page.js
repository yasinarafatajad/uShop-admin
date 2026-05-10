'use client'
import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import { api } from '@/hooks/useApi/api';

const DeliveryCharges = () => {
  const [charges, setCharges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    area: '',
    charge: 0,
    minOrderForFree: 0,
    isActive: true
  });

  const fetchCharges = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/deliveryCharges');
      setCharges(data);
    } catch (err) {
      console.log('Fetch failed:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharges();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/deliveryCharge/${currentId}`, formData);
      } else {
        await api.post('/deliveryCharge', formData);
      }
      resetForm();
      fetchCharges();
    } catch (err) {
      console.log('Submit failed:', err.message);
    }
  };

  const handleEdit = (charge) => {
    setIsEditing(true);
    setCurrentId(charge._id);
    setFormData({
      name: charge.name,
      area: charge.area || '',
      charge: charge.charge,
      minOrderForFree: charge.minOrderForFree || 0,
      isActive: charge.isActive
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this delivery charge?')) return;
    try {
      await api.delete(`/deliveryCharge/${id}`);
      fetchCharges();
    } catch (err) {
      console.log('Delete failed:', err.message);
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      name: '',
      area: '',
      charge: 0,
      minOrderForFree: 0,
      isActive: true
    });
  };

  return (
    <div className="min-h-screen">
      <PageHeader title="Delivery Charges" subtitle="Manage delivery rules and pricing" />
      
      <div className="px-4 py-4 md:px-6 md:py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form */}
        <div className="bg-card rounded-xl p-4 shadow-card h-fit">
          <h3 className="font-semibold mb-4">{isEditing ? 'Edit Rule' : 'New Delivery Rule'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Rule Name <span className="text-destructive">*</span></label>
              <input type="text" value={formData.name} required
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Inside Dhaka"
                className="w-full h-11 px-4 rounded-xl bg-background border border-input focus:border-primary outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Area/Location</label>
              <input type="text" value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                placeholder="e.g. Dhaka City"
                className="w-full h-11 px-4 rounded-xl bg-background border border-input focus:border-primary outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Delivery Charge (৳) <span className="text-destructive">*</span></label>
              <input type="number" value={formData.charge} required min="0"
                onChange={(e) => setFormData({ ...formData, charge: Number(e.target.value) })}
                className="w-full h-11 px-4 rounded-xl bg-background border border-input focus:border-primary outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Free Delivery Over (৳)</label>
              <input type="number" value={formData.minOrderForFree} min="0"
                onChange={(e) => setFormData({ ...formData, minOrderForFree: Number(e.target.value) })}
                placeholder="0 means no free delivery"
                className="w-full h-11 px-4 rounded-xl bg-background border border-input focus:border-primary outline-none text-sm" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isActive" checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 rounded border-input" />
              <label htmlFor="isActive" className="text-sm font-medium cursor-pointer">Active</label>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="flex-1 h-11 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors">
                {isEditing ? 'Update Rule' : 'Save Rule'}
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
          <h3 className="font-semibold text-lg">Existing Rules</h3>
          {loading ? (
            <div className="flex justify-center py-8"><div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>
          ) : charges.length > 0 ? (
            <div className="grid gap-3">
              {charges.map(charge => (
                <div key={charge._id} className="bg-card rounded-xl p-4 shadow-card flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{charge.name}</h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${charge.isActive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                        {charge.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Area: {charge.area || 'Any'}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="font-medium text-primary">Charge: ৳{charge.charge}</span>
                      {charge.minOrderForFree > 0 && (
                        <span className="text-success font-medium">Free over ৳{charge.minOrderForFree}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleEdit(charge)} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(charge._id)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-card rounded-xl border border-dashed border-border">
              <p className="text-muted-foreground">No delivery rules defined.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryCharges;
