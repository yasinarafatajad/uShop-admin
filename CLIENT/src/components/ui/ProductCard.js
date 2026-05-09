import { MoreVertical, Edit, Trash2, Eye, Package } from 'lucide-react';
import { useState } from 'react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from './alert-dialog';
import { useRouter } from 'next/navigation';
import { api } from '@/hooks/useApi/api';

const ProductCard = ({ product, delay = 0, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const handleEdit = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    router.push(`/products/${product.id}/edit`);
  };

  const handleView = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    router.push(`/products/${product.id}`);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    setShowMenu(false);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/DeleteProduct/${product.id}`);
      if (onDelete) onDelete(product);
    } catch (err) { console.log('Delete failed:', err.message); }
    finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <div
        className="bg-card rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 animate-fade-in group cursor-pointer"
        style={{ animationDelay: `${delay}ms` }}
        onClick={() => router.push(`/products/${product.id}`)}
      >
        <div className="relative aspect-square bg-secondary overflow-hidden">
          {product.image ? (
            <img src={product.image} alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-10 h-10 text-muted-foreground" />
            </div>
          )}
          <div className="absolute top-2 right-2">
            <div className="relative">
              <button onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                className="w-8 h-8 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-card transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10"
                    onClick={(e) => { e.stopPropagation(); setShowMenu(false); }} />
                  <div className="absolute right-0 top-10 w-36 bg-card rounded-lg shadow-modal border border-border py-1 z-20 animate-scale-in">
                    <button onClick={handleView}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-secondary transition-colors">
                      <Eye className="w-4 h-4" /> View
                    </button>
                    <button onClick={handleEdit}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-secondary transition-colors">
                      <Edit className="w-4 h-4" /> Edit
                    </button>
                    <button onClick={handleDeleteClick}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors">
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
          {product.stock <= 5 && (
            <div className="absolute top-2 left-2 px-2 py-1 bg-warning text-warning-foreground text-xs font-medium rounded-full">
              Low stock
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-medium text-sm mb-1 truncate">{product.name}</h3>
          <p className="text-xs text-muted-foreground mb-2">{product.category}</p>
          <div className="flex items-center justify-between">
            <span className="font-bold text-lg">৳{product.price}</span>
            <span className="text-xs text-muted-foreground">{product.stock} in stock</span>
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{product.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ProductCard;
