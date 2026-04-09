"use client";

import { useEffect } from "react";

/**
 * GoogleAdsTracker
 * This component adds a global event listener to catch clicks on any 'tel:' links
 * and reports them as conversions to Google Ads.
 */
export default function GoogleAdsTracker() {
  useEffect(() => {
    const handlePhoneClick = (event: MouseEvent) => {
      // Find the closest anchor tag from the click target
      const target = (event.target as HTMLElement).closest("a");
      
      // Check if it's a phone link
      if (target && target.href && target.href.startsWith("tel:")) {
        if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
          // Fire the specific "Phone call on Mobile" conversion event
          (window as any).gtag("event", "conversion", {
            'send_to': 'AW-969249151/Rx4kCJ-gvP0BEP-ils4D'
          });
        }
      }
    };

    // Attach listener to the whole document
    document.addEventListener("click", handlePhoneClick);
    
    return () => {
      document.removeEventListener("click", handlePhoneClick);
    };
  }, []);

  return null; // This component doesn't render anything
}
