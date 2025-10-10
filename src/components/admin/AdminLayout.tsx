import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  LayoutDashboard,
  Layers,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
  Car,
  Gavel,
  Info,
  Mail,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const navigation = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  {
    name: 'Content Management',
    icon: Layers,
    children: [
      { name: 'Home Page', href: '/admin/content/home', icon: Home },
      { name: 'Cars Page', href: '/admin/content/cars', icon: Car },
      { name: 'Cars Sales', href: '/admin/content/cars-sales', icon: BarChart3 },
      { name: 'Auction Page', href: '/admin/content/auctions', icon: Gavel },
      { name: 'About Page', href: '/admin/content/about', icon: Info },
      { name: 'Contact Page', href: '/admin/content/contact', icon: Mail },
    ],
  },
  { name: 'Statistics', href: '/admin/statistics', icon: BarChart3 },
  { name: 'Site Settings', href: '/admin/settings', icon: Settings },
];

export const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [contentOpen, setContentOpen] = useState(true);
  const { signOut, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const SidebarContent = () => (
    <>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
        <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
      </div>
      <Separator />
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navigation.map((item) =>
            item.children ? (
              <Collapsible key={item.name} open={contentOpen} onOpenChange={setContentOpen}>
                <CollapsibleTrigger className="w-full">
                  <div
                    className={cn(
                      'flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors',
                      'hover:bg-accent hover:text-accent-foreground',
                      'text-muted-foreground'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </div>
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 transition-transform',
                        contentOpen && 'transform rotate-180'
                      )}
                    />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="ml-6 mt-1 space-y-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      to={child.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                        location.pathname === child.href
                          ? 'bg-accent text-accent-foreground'
                          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      )}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <child.icon className="h-4 w-4" />
                      <span>{child.name}</span>
                    </Link>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  location.pathname === item.href
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            )
          )}
        </nav>
      </ScrollArea>
      <Separator />
      <div className="p-4">
        <Button variant="outline" className="w-full" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar */}
      <div className="lg:hidden">
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        )}
        <div
          className={cn(
            'fixed inset-y-0 left-0 z-50 w-72 bg-card border-r transform transition-transform duration-200 ease-in-out',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex flex-col h-full">
            <SidebarContent />
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-1 border-r bg-card">
          <SidebarContent />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-x-4 border-b bg-card px-4 shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-foreground">
              {navigation.find((item) => item.href === location.pathname)?.name ||
                navigation
                  .find((item) => item.children?.some((child) => child.href === location.pathname))
                  ?.children?.find((child) => child.href === location.pathname)?.name ||
                'Admin Dashboard'}
            </h2>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};