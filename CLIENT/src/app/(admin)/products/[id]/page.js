'use client';
import { useState, useEffect } from 'react';
import { Edit, Trash2, Package, Tag, DollarSign, Box, ArrowLeft } from 'lucide-react';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useParams, useRouter } from "next/navigation";
import Image from 'next/image';
import { api } from '@/hooks/useApi/api';

const ProductDetail = () => {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/Product/${id}`);
        setProduct(data);
      } catch (err) { console.log('Fetch failed:', err.message); }
      finally { setLoading(false); }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6">
        <PageHeader title="Product Not Found" />
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">The product you&apos;re looking for doesn&apos;t exist.</p>
          <Button onClick={() => router.push('/products')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Products
          </Button>
        </div>
      </div>
    );
  }

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/DeleteProduct/${id}`);
      router.push('/products');
    } catch (err) { console.log('Delete failed:', err.message); }
    finally { setDeleting(false); }
  };

  const mainImage = product.images?.[0]?.url || '';

  return (
    <div className='min-h-screen'>
      <PageHeader title="Product Details" showBack />
      <div className="p-6 py-4 mx-auto">
        <div className="bg-card rounded-xl shadow-card overflow-hidden animate-fade-in">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="aspect-square bg-secondary relative">
              {mainImage ? (
                <Image fill src={mainImage} alt={product.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-16 h-16 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="p-6 flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold mb-2">{product.title}</h1>
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm">
                    <Tag className="w-3 h-3" /> {product.brand || 'No brand'}
                  </span>
                </div>
                {product.stock <= 5 && (
                  <span className="px-3 py-1 bg-warning text-warning-foreground text-xs font-medium rounded-full">Low stock</span>
                )}
              </div>
              <p className="text-muted-foreground mb-6 flex-grow">{product.description || 'No description'}</p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-secondary/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                    <DollarSign className="w-4 h-4" /> Price
                  </div>
                  <p className="text-2xl font-bold">৳{product.price}</p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                    <Box className="w-4 h-4" /> Stock
                  </div>
                  <p className="text-2xl font-bold">{product.stock} units</p>
                </div>
              </div>
              {product.color?.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm text-muted-foreground mb-1">Colors</p>
                  <div className="flex gap-2 flex-wrap">
                    {product.color.map(c => (
                      <span key={c} className="px-2 py-1 bg-secondary rounded-full text-xs">{c}</span>
                    ))}
                  </div>
                </div>
              )}
              {product.size?.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-1">Sizes</p>
                  <div className="flex gap-2 flex-wrap">
                    {product.size.map(s => (
                      <span key={s} className="px-2 py-1 bg-secondary rounded-full text-xs">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <Button className="flex-1" onClick={() => router.push(`/products/${product._id}/edit`)}>
                  <Edit className="w-4 h-4 mr-2" /> Edit Product
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive"><Trash2 className="w-4 h-4" /></Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Product</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete &quot;{product.title}&quot;? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={deleting}>
                        {deleting ? 'Deleting...' : 'Delete'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
