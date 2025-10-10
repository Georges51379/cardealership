import { useEffect } from "react";
import { useSiteSettings } from "./useSiteSettings";

export const useFavicon = () => {
  const { data: settings } = useSiteSettings();

  useEffect(() => {
    if (settings?.favicon_url) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      
      link.href = settings.favicon_url;
    }
  }, [settings?.favicon_url]);
};
