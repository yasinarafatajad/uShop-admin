'use client'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3,
  Settings,
  LogOut,
  Store,
  Truck,
  Tag
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
// import { useAuth } from '../../contexts/AuthContext';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/products', icon: Package, label: 'Products' },
  { path: '/orders', icon: ShoppingCart, label: 'Orders' },
  { path: '/customers', icon: Users, label: 'Customers' },
  { path: '/reports', icon: BarChart3, label: 'Reports' },
  { path: '/delivery', icon: Truck, label: 'Delivery' },
  { path: '/coupons', icon: Tag, label: 'Coupons' },
];

const Sidebar = () => {
  const pathname = usePathname();
  // const { user, logout } = useAuth();
  const { user, logout } = true;

  return (
    <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border h-screen sticky top-0">
      {/* Logo */}
      <Link href={'/'} className="flex items-center gap-3 px-6 h-16 border-b border-border">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
          <Store className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="font-semibold text-lg ">ShopAdmin</span>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.path || 
            (item.path !== '/dashboard' && pathname.startsWith(item.path));
          
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <item.icon 
                className={`w-5 h-5 transition-transform duration-200 ${
                  isActive ? '' : 'group-hover:scale-110'
                }`} 
              />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-semibold text-sm">
              {user?.name?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
