'use client'
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation'
import { Save, User, Mail, Phone, MapPin, FileText, Loader2 } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import { api } from '@/hooks/useApi/api';

const CustomerForm = () => {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '',
    street: '', city: '', district: '', postalCode: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEditing);

  useEffect(() => {
    if (!isEditing) return;
    const fetchCustomer = async () => {
      try {
        const { data } = await api.get(`/getCustomer/${id}`);
        setFormData({
          fullName: data.fullName || '', email: data.email || '',
          phone: data.phone || '', street: data.address?.street || '',
          city: data.address?.city || '', district: data.address?.district || '',
          postalCode: data.address?.postalCode || '', notes: '',
        });
      } catch (err) { console.log('Fetch failed:', err.message); }
      finally { setLoading(false); }
    };
    fetchCustomer();
  }, [id, isEditing]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    const payload = {
      fullName: formData.fullName, email: formData.email, phone: formData.phone,
      address: {
        street: formData.street, city: formData.city,
        district: formData.district, postalCode: formData.postalCode,
      },
    };
    try {
      if (isEditing) {
        await api.put(`/updateCustomer/${id}`, payload);
      } else {
        await api.post('/addCustomer', payload);
      }
      router.push('/customers');
    } catch (err) { console.log('Save failed:', err.message); }
    finally { setIsSubmitting(false); }
  };

  const inputClasses = (error) => `w-full h-11 px-4 rounded-xl bg-background border ${error ? 'border-destructive' : 'border-input'} focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-6">
      <PageHeader title={isEditing ? "Edit Customer" : "New Customer"} showBack
        actions={
          <button onClick={handleSubmit} disabled={isSubmitting}
            className="w-10 h-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center hover:opacity-90 active:scale-95 transition-all disabled:opacity-50">
            <Save className="w-5 h-5" />
          </button>
        }
      />
      <form onSubmit={handleSubmit} className="px-4 py-4 md:px-6 md:py-6 space-y-4">
        <div className="bg-card rounded-xl p-4 shadow-card animate-fade-in">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><User className="w-4 h-4" /> Basic Information</h3>
          <div>
            <label className="block text-sm font-medium mb-1.5">Full Name *</label>
            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange}
              placeholder="Enter customer name" className={inputClasses(errors.fullName)} />
            {errors.fullName && <p className="text-destructive text-xs mt-1">{errors.fullName}</p>}
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-card animate-fade-in" style={{ animationDelay: '50ms' }}>
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Mail className="w-4 h-4" /> Contact</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Email *</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange}
                placeholder="customer@email.com" className={inputClasses(errors.email)} />
              {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Phone *</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                placeholder="+8801712972683" className={inputClasses(errors.phone)} />
              {errors.phone && <p className="text-destructive text-xs mt-1">{errors.phone}</p>}
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-card animate-fade-in" style={{ animationDelay: '100ms' }}>
          <h3 className="font-semibold mb-4 flex items-center gap-2"><MapPin className="w-4 h-4" /> Address</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Street</label>
              <input type="text" name="street" value={formData.street} onChange={handleChange}
                placeholder="Street address" className={inputClasses()} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1.5">City</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange}
                  placeholder="City" className={inputClasses()} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">District</label>
                <input type="text" name="district" value={formData.district} onChange={handleChange}
                  placeholder="District" className={inputClasses()} />
              </div>
            </div>
            <div className="w-1/2">
              <label className="block text-sm font-medium mb-1.5">Postal Code</label>
              <input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange}
                placeholder="2400" className={inputClasses()} />
            </div>
          </div>
        </div>
        <button type="submit" disabled={isSubmitting}
          className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 md:hidden animate-fade-in">
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" />{isEditing ? 'Update Customer' : 'Create Customer'}</>}
        </button>
      </form>
    </div>
  );
};

export default CustomerForm;
