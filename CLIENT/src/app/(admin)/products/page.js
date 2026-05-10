'use client'
import { useState, useEffect } from 'react';
import { Grid3X3, List, Plus, Search, Filter, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ui/ProductCard';
import { api } from '@/hooks/useApi/api';

const priceRanges = [
  { label: 'All Prices', min: 0, max: Infinity },
  { label: 'Under ৳500', min: 0, max: 500 },
  { label: '৳500 - ৳1000', min: 500, max: 1000 },
  { label: '৳1000 - ৳2000', min: 1000, max: 2000 },
  { label: 'Over ৳2000', min: 2000, max: Infinity },
];
const stockOptions = [
  { label: 'All Stock', value: 'all' },
  { label: 'In Stock', value: 'in-stock' },
  { label: 'Low Stock (< 10)', value: 'low' },
  { label: 'Out of Stock', value: 'out' },
];
const sortOptions = [
  { label: 'Name (A-Z)', value: 'name-asc' },
  { label: 'Name (Z-A)', value: 'name-desc' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Stock: Low to High', value: 'stock-asc' },
  { label: 'Stock: High to Low', value: 'stock-desc' },
];

const Products = () => {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState(0);
  const [stockFilter, setStockFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name-asc');
  const [deleteProduct, setDeleteProduct] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Fetch real products from API
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/AllProducts');
      setProducts(data.map(p => ({
        id: p._id,
        name: p.title,
        category: p.brand || 'Uncategorized',
        price: p.price,
        stock: p.stock,
        image: p.images?.[0]?.url || '',
        description: p.description,
      })));
    } catch (err) {
      console.log('Failed to fetch products:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPrice = product.price >= priceRanges[priceRange].min && 
        product.price < priceRanges[priceRange].max;
      const matchesStock = stockFilter === 'all' ||
        (stockFilter === 'in-stock' && product.stock > 0) ||
        (stockFilter === 'low' && product.stock > 0 && product.stock < 10) ||
        (stockFilter === 'out' && product.stock === 0);
      
      return matchesSearch && matchesPrice && matchesStock;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name-asc': return a.name.localeCompare(b.name);
        case 'name-desc': return b.name.localeCompare(a.name);
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        case 'stock-asc': return a.stock - b.stock;
        case 'stock-desc': return b.stock - a.stock;
        default: return 0;
      }
    });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, priceRange, stockFilter, sortBy]);

  const handleViewProduct = (productId) => {
    router.push(`/products/${productId}`);
  };

  const handleDeleteProduct = (product) => {
    setDeleteProduct(product);
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/DeleteProduct/${deleteProduct.id}`);
      setProducts(prev => prev.filter(p => p.id !== deleteProduct.id));
    } catch (err) {
      console.log('Delete failed:', err.message);
    }
    setDeleteProduct(null);
  };

  const clearFilters = () => {
    setPriceRange(0);
    setStockFilter('all');
    setSortBy('name-asc');
    setSearchQuery('');
  };

  const hasActiveFilters = priceRange !== 0 || stockFilter !== 'all' || sortBy !== 'name-asc';

  if (loading) {
    return (
      <div className="min-h-screen">
        <PageHeader title="Products" subtitle="Loading..." />
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Products" 
        subtitle={`${products.length} items`}
        actions={
          <button 
            onClick={() => router.push('/products/new')}
            className="w-10 h-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center hover:opacity-90 active:scale-95 transition-all"
          >
            <Plus className="w-5 h-5" />
          </button>
        }
      />

      <div className="px-4 py-4 md:px-6 md:py-6 space-y-4">
        {/* Search and Filters */}
        <div className="flex gap-3 animate-fade-in">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-card border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
            />
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <button className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors relative ${
                hasActiveFilters 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-card border border-input hover:bg-secondary'
              }`}>
                <Filter className="w-5 h-5" />
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                    !
                  </span>
                )}
              </button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Filter Products</SheetTitle>
              </SheetHeader>
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price Range</label>
                  <Select value={priceRange.toString()} onValueChange={(v) => setPriceRange(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priceRanges.map((range, i) => (
                        <SelectItem key={i} value={i.toString()}>{range.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Stock Status</label>
                  <Select value={stockFilter} onValueChange={setStockFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {stockOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Sort By</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <SheetFooter className="gap-2">
                <Button variant="outline" onClick={clearFilters}>Clear All</Button>
                <SheetClose asChild>
                  <Button>Apply Filters</Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>

        {/* Active Filters Pills */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 animate-fade-in">
            {priceRange !== 0 && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                {priceRanges[priceRange].label}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setPriceRange(0)} />
              </span>
            )}
            {stockFilter !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                {stockOptions.find(o => o.value === stockFilter)?.label}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setStockFilter('all')} />
              </span>
            )}
            {sortBy !== 'name-asc' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                {sortOptions.find(o => o.value === sortBy)?.label}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSortBy('name-asc')} />
              </span>
            )}
          </div>
        )}

        {/* View Toggle */}
        <div className="flex items-center justify-between animate-fade-in" style={{ animationDelay: '50ms' }}>
          <p className="text-sm text-muted-foreground">
            {filteredProducts.length} products found
          </p>
          <div className="flex bg-card border border-input rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${
                viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${
                viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Products Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 md:gap-4">
            {paginatedProducts.map((product, index) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                delay={index * 30} 
                onDelete={handleDeleteProduct}
                onClick={() => handleViewProduct(product.id)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {paginatedProducts.map((product, index) => (
              <div
                key={product.id}
                onClick={() => handleViewProduct(product.id)}
                className="bg-card rounded-xl p-4 shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in flex items-center gap-4 cursor-pointer"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center">
                    <span className="text-muted-foreground text-xs">No img</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm mb-0.5 truncate">{product.name}</h3>
                  <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
                  <div className="flex items-center gap-3">
                    <span className="font-bold">৳{product.price}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      product.stock <= 5 
                        ? 'bg-warning/10 text-warning' 
                        : 'bg-success/10 text-success'
                    }`}>
                      {product.stock} in stock
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No products match your filters.</p>
            <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <div className="text-sm font-medium">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteProduct} onOpenChange={(open) => !open && setDeleteProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteProduct?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Products;