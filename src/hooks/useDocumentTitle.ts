import { useEffect } from "react";
import { useSiteSettings } from "./useSiteSettings";

export const useDocumentTitle = (pageTitle?: string) => {
  const { data: settings } = useSiteSettings();

  useEffect(() => {
    const siteTitle = settings?.site_title || "Premium Car Dealership";
    document.title = pageTitle ? `${pageTitle} | ${siteTitle}` : siteTitle;
  }, [settings, pageTitle]);
};
