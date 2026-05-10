'use client'
import { 
  LayoutDashboard, 
  Package, 
  BarChart3,
  ShoppingCart, 
  Users, 
  Truck,
  Tag
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/products', icon: Package, label: 'Products' },
  { path: '/orders', icon: ShoppingCart, label: 'Orders' },
  { path: '/customers', icon: Users, label: 'Customers' },
  { path: '/reports', icon: BarChart3, label: 'Reports' },
  { path: '/delivery', icon: Truck, label: 'Delivery' },
  { path: '/coupons', icon: Tag, label: 'Coupons' },
];

const BottomNav = () => {
  const pathname = usePathname();


  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-nav safe-bottom md:hidden">
      <div className="flex items-center justify-around h-20">
        {navItems.map((item) => {
          const isActive = pathname === item.path || 
            (item.path !== '/dashboard' && pathname.startsWith(item.path));
          
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center justify-center w-full h-full transition-all duration-200 touch-manipulation ${
                isActive 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className={`relative transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
                <item.icon 
                  className={`w-5 h-5 transition-all duration-200 ${
                    isActive ? 'stroke-[2.5px]' : 'stroke-[2px]'
                  }`} 
                />
              </div>
              <span className={`text-[10px] mt-1 font-medium transition-all duration-200 ${
                isActive ? 'opacity-100' : 'opacity-70'
              }`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
