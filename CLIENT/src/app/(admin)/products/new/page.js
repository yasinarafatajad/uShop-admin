'use client';
import { useState, useEffect } from 'react';
import { Upload, X, Save, Loader2, Plus, ChevronDown } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import Image from 'next/image';
import { api } from '@/hooks/useApi/api';

const ProductForm = () => {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id;
  const isEditing = Boolean(productId);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [brands, setBrands] = useState([]);
  const [showNewBrand, setShowNewBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [formData, setFormData] = useState({
    title: '', brand: '', price: '', stock: '', description: '', sku: '',
    images: [], color: '', size: '', tags: '', status: 'draft',
  });

  // Fetch existing brands from all products
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const { data } = await api.get('/AllProducts');
        const uniqueBrands = [...new Set(data.map(p => p.brand).filter(Boolean))].sort();
        setBrands(uniqueBrands);
      } catch (err) { console.log('Fetch brands failed:', err.message); }
    };
    fetchBrands();
  }, []);

  useEffect(() => {
    if (!isEditing) return;
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/Product/${productId}`);
        setFormData({
          title: data.title || '', brand: data.brand || '',
          price: data.price?.toString() || '', stock: data.stock?.toString() || '',
          description: data.description || '', sku: data.sku || '',
          images: data.images || [], color: data.color?.join(', ') || '',
          size: data.size?.join(', ') || '', tags: data.tags?.join(', ') || '',
          status: data.status || 'draft',
        });
      } catch (err) { console.log('Fetch failed:', err.message); }
    };
    fetchProduct();
  }, [isEditing, productId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBrandSelect = (value) => {
    if (value === '__add_new__') {
      setShowNewBrand(true);
      setNewBrandName('');
    } else {
      setFormData(prev => ({ ...prev, brand: value }));
      setShowNewBrand(false);
    }
  };

  const handleAddNewBrand = () => {
    const trimmed = newBrandName.trim();
    if (!trimmed) return;
    if (!brands.includes(trimmed)) {
      setBrands(prev => [...prev, trimmed].sort());
    }
    setFormData(prev => ({ ...prev, brand: trimmed }));
    setShowNewBrand(false);
    setNewBrandName('');
  };

  const removeImage = (index) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const { data } = await api.post('/upload?folder=products', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (data.success) {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, { url: data.url, alt: prev.title || 'product' }],
        }));
      }
    } catch (err) { console.log('Upload failed:', err.message); }
    finally { setUploading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      title: formData.title, brand: formData.brand,
      price: parseFloat(formData.price), stock: parseInt(formData.stock),
      description: formData.description, sku: formData.sku || `SKU-${Date.now()}`,
      images: formData.images, status: formData.status,
      color: formData.color ? formData.color.split(',').map(s => s.trim()) : [],
      size: formData.size ? formData.size.split(',').map(s => s.trim()) : [],
      tags: formData.tags ? formData.tags.split(',').map(s => s.trim()) : [],
    };
    try {
      if (isEditing) {
        await api.put(`/UpdateProduct/${productId}`, payload);
      } else {
        await api.post('/AddProduct', payload);
      }
      router.push('/products');
    } catch (err) { console.log('Save failed:', err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen pb-24">
      <PageHeader title={isEditing ? 'Edit Product' : 'Add Product'}
        subtitle={isEditing ? `Editing ${formData.title}` : 'Create a new product'} showBack />
      <form onSubmit={handleSubmit} className="px-4 py-4 md:px-6 md:py-6 space-y-6 max-w-2xl mx-auto">
        {/* Image Upload */}
        <div className="animate-fade-in">
          <label className="block text-sm font-medium mb-2">Product Images</label>
          <div className="flex flex-wrap gap-3 mb-3">
            {formData.images.map((img, i) => (
              <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden bg-secondary">
                <Image fill src={img.url} alt={img.alt || 'product'} className="object-cover" />
                <button type="button" onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          <div onClick={() => document.getElementById('imgUpload')?.click()}
            className="cursor-pointer w-full aspect-video rounded-xl border-2 border-dashed border-border bg-secondary/50 flex flex-col items-center justify-center gap-2 hover:border-primary transition">
            {uploading ? <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
              : <Upload className="w-8 h-8 text-muted-foreground" />}
            <p className="text-sm text-muted-foreground">
              {uploading ? 'Uploading to Cloudinary...' : 'Click to upload image'}
            </p>
          </div>
          <input id="imgUpload" type="file" accept="image/*" hidden onChange={handleFileUpload} />
        </div>
        {/* Title */}
        <div className="animate-fade-in" style={{ animationDelay: '50ms' }}>
          <label className="block text-sm font-medium mb-2">Product Title *</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} required
            placeholder="Enter product title"
            className="w-full h-11 px-4 rounded-xl bg-card border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm" />
        </div>
        {/* Brand (Dropdown) & SKU */}
        <div className="grid grid-cols-2 gap-4 animate-fade-in" style={{ animationDelay: '75ms' }}>
          <div>
            <label className="block text-sm font-medium mb-2">Brand</label>
            {showNewBrand ? (
              <div className="flex gap-2">
                <input type="text" value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  placeholder="Enter new brand name" autoFocus
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddNewBrand(); } }}
                  className="flex-1 h-11 px-4 rounded-xl bg-card border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm" />
                <button type="button" onClick={handleAddNewBrand}
                  className="h-11 px-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-all flex items-center">
                  <Plus className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => setShowNewBrand(false)}
                  className="h-11 px-3 bg-muted text-muted-foreground rounded-xl hover:bg-muted/80 transition-all flex items-center">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <select value={formData.brand} onChange={(e) => handleBrandSelect(e.target.value)}
                  className="w-full h-11 px-4 pr-10 rounded-xl bg-card border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm appearance-none cursor-pointer">
                  <option value="">Select brand</option>
                  {brands.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                  <option value="__add_new__">+ Add new brand</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">SKU</label>
            <input type="text" name="sku" value={formData.sku} onChange={handleChange}
              placeholder="Auto-generated if empty"
              className="w-full h-11 px-4 rounded-xl bg-card border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm" />
          </div>
        </div>
        {/* Price and Stock */}
        <div className="grid grid-cols-2 gap-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div>
            <label className="block text-sm font-medium mb-2">Price *</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">৳</span>
              <input type="number" name="price" value={formData.price} onChange={handleChange} required
                step="0.01" min="0" placeholder="0.00"
                className="w-full h-11 pl-8 pr-4 rounded-xl bg-card border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Stock *</label>
            <input type="number" name="stock" value={formData.stock} onChange={handleChange} required
              min="0" placeholder="0"
              className="w-full h-11 px-4 rounded-xl bg-card border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm" />
          </div>
        </div>
        {/* Color, Size, Tags */}
        <div className="space-y-4 animate-fade-in" style={{ animationDelay: '125ms' }}>
          <div>
            <label className="block text-sm font-medium mb-2">Colors (comma separated)</label>
            <input type="text" name="color" value={formData.color} onChange={handleChange}
              placeholder="Red, Blue, Green"
              className="w-full h-11 px-4 rounded-xl bg-card border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Sizes (comma separated)</label>
            <input type="text" name="size" value={formData.size} onChange={handleChange}
              placeholder="S, M, L, XL"
              className="w-full h-11 px-4 rounded-xl bg-card border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Tags (comma separated)</label>
            <input type="text" name="tags" value={formData.tags} onChange={handleChange}
              placeholder="new, trending, sale"
              className="w-full h-11 px-4 rounded-xl bg-card border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm" />
          </div>
        </div>
        {/* Status */}
        <div className="animate-fade-in" style={{ animationDelay: '150ms' }}>
          <label className="block text-sm font-medium mb-2">Status</label>
          <select name="status" value={formData.status} onChange={handleChange}
            className="w-full h-11 px-4 rounded-xl bg-card border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm appearance-none cursor-pointer">
            <option value="draft">Draft</option>
            <option value="active">Active</option>
          </select>
        </div>
        {/* Description */}
        <div className="animate-fade-in" style={{ animationDelay: '175ms' }}>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} rows={4}
            placeholder="Enter product description..."
            className="w-full px-4 py-3 rounded-xl bg-card border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm resize-none" />
        </div>
        {/* Submit */}
        <div className="flex justify-end animate-fade-in" style={{ animationDelay: '200ms' }}>
          <button type="submit" disabled={loading}
            className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-medium flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed md:max-w-xs">
            {loading ? (<><Loader2 className="w-5 h-5 animate-spin" />Saving...</>)
              : (<><Save className="w-5 h-5" />{isEditing ? 'Update Product' : 'Create Product'}</>)}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;

