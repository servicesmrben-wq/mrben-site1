let googlePlacesPromise: Promise<any | null> | null = null;

declare global {
  interface Window {
    google?: {
      maps?: {
        places?: unknown;
      };
    };
    initGoogleMaps?: () => void;
  }
}

/**
 * Loads the Google Maps Places library script and returns a promise that resolves
 * when the library is ready to use.
 */
export function loadGooglePlaces(): Promise<any | null> {
  if (typeof window === "undefined") {
    return Promise.resolve(null);
  }

  // 1. If already loaded, resolve immediately
  if (window.google?.maps?.places) {
    return Promise.resolve(window.google);
  }

  // 2. If a load is already in progress, return the existing promise
  if (googlePlacesPromise) {
    return googlePlacesPromise;
  }

  // 3. Start a new load process
  googlePlacesPromise = new Promise((resolve) => {
    // Check again if it somehow loaded between turns
    if (window.google?.maps?.places) {
      return resolve(window.google);
    }

    // Set up the global callback for Google Maps
    const CALLBACK_NAME = "initGoogleMaps";
    window[CALLBACK_NAME] = () => {
      resolve(window.google);
      delete window[CALLBACK_NAME];
    };

    // Check if script already exists in DOM
    const existingScript = document.querySelector("script[data-google-maps='places']");
    if (existingScript) {
      // If it exists but we're here, it's either still loading or failed
      existingScript.addEventListener("load", () => {
        if (window.google?.maps?.places) {
          resolve(window.google);
        }
      }, { once: true });
      existingScript.addEventListener("error", () => resolve(null), { once: true });
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error("Google Maps API Key is missing (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)");
      resolve(null);
      return;
    }

    // Create and inject the script
    const script = document.createElement("script");
    // Use the recommended loading pattern with callback
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=${CALLBACK_NAME}`;
    script.async = true;
    script.defer = true;
    
    script.setAttribute("data-google-maps", "places");

    script.addEventListener("error", () => {
      console.error("Failed to load Google Maps script");
      resolve(null);
    }, { once: true });

    document.head.appendChild(script);
  });

  return googlePlacesPromise;
}
