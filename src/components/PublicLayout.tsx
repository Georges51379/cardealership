import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { MaintenanceMode } from "@/components/MaintenanceMode";
import { useSiteSettings } from "@/hooks/useSiteSettings";

export const PublicLayout = () => {
  const { data: settings } = useSiteSettings();

  // Show maintenance mode for all public routes
  if (settings?.maintenance_mode) {
    return <MaintenanceMode />;
  }

  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
      <BackToTop />
    </>
  );
};
