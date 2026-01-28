let googlePlacesPromise: Promise<typeof window.google | null> | null = null;

type GoogleMapsWindow = typeof window & {
  google?: {
    maps?: {
      places?: {
        Autocomplete: new (
          input: HTMLInputElement,
          opts?: {
            types?: string[];
            componentRestrictions?: {
              country?: string | string[];
            };
          }
        ) => {
          addListener: (eventName: string, handler: () => void) => { remove: () => void };
          getPlace: () => { formatted_address?: string };
          setFields?: (fields: string[]) => void;
        };
      };
    };
  };
};

declare global {
  interface Window {
    google?: GoogleMapsWindow["google"];
  }
}

export function loadGooglePlaces(): Promise<typeof window.google | null> {
  if (typeof window === "undefined") {
    return Promise.resolve(null);
  }

  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!key) {
    return Promise.resolve(null);
  }

  if (window.google?.maps?.places) {
    return Promise.resolve(window.google);
  }

  if (googlePlacesPromise) {
    return googlePlacesPromise;
  }

  googlePlacesPromise = new Promise((resolve) => {
    const existingScript = document.querySelector("script[data-google-maps='places']");

    const handleLoad = () => {
      resolve(window.google?.maps?.places ? window.google : null);
    };

    const handleError = () => {
      resolve(null);
    };

    if (existingScript) {
      if (window.google?.maps?.places) {
        resolve(window.google);
        return;
      }
      existingScript.addEventListener("load", handleLoad, { once: true });
      existingScript.addEventListener("error", handleError, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.dataset.googleMaps = "places";
    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });
    document.head.appendChild(script);
  });

  return googlePlacesPromise;
}
