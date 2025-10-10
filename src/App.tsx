import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/admin/ProtectedRoute";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PublicLayout } from "@/components/PublicLayout";
import { ScrollToTop } from "@/components/ScrollToTop";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import { useFavicon } from "@/hooks/useFavicon";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import Home from "./pages/Home";
import Cars from "./pages/Cars";
import Auction from "./pages/Auction";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import CarsManagement from "./pages/admin/content/CarsManagement";
import CarsSalesManagement from "./pages/admin/content/CarsSalesManagement";
import HomeManagement from "./pages/admin/content/HomeManagement";
import AuctionsManagement from "./pages/admin/content/AuctionsManagement";
import AboutManagement from "./pages/admin/content/AboutManagement";
import ContactManagement from "./pages/admin/content/ContactManagement";
import Settings from "./pages/admin/Settings";
import Statistics from "./pages/admin/Statistics";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();


const AppContent = () => {
  const { data: settings, isLoading } = useSiteSettings();
  const { isAdmin } = useAuth();
  const location = useLocation();
  
  useDocumentTitle();
  useFavicon();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  const onAdminRoute = location.pathname.startsWith("/admin");
  const showAdminBanner = settings?.maintenance_mode && isAdmin && onAdminRoute;

  return (
    <>
      {/* Admin banner when maintenance mode is active - only on admin routes */}
      {showAdminBanner && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-destructive text-destructive-foreground py-2 text-center text-sm font-semibold">
          ⚠️ Maintenance Mode Active - Only admins can see the site
        </div>
      )}
      <div className={showAdminBanner ? "pt-8" : ""}>
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/cars" element={<Cars />} />
            <Route path="/auction" element={<Auction />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Admin Routes - Always accessible, bypass maintenance mode */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="content/cars" element={<CarsManagement />} />
            <Route path="content/cars-sales" element={<CarsSalesManagement />} />
            <Route path="content/home" element={<HomeManagement />} />
            <Route path="content/auctions" element={<AuctionsManagement />} />
            <Route path="content/about" element={<AboutManagement />} />
            <Route path="content/contact" element={<ContactManagement />} />
            <Route path="settings" element={<Settings />} />
            <Route path="statistics" element={<Statistics />} />
          </Route>
        </Routes>
      </div>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
