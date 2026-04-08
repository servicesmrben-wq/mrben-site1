let googlePlacesPromise: Promise<unknown | null> | null = null;

declare global {
  interface Window {
    google?: {
      maps?: {
        places?: unknown;
      };
    };
  }
}

export function loadGooglePlaces(): Promise<unknown | null> {
  if (typeof window === "undefined") {
    return Promise.resolve(null);
  }

  if (window.google?.maps?.places) {
    return Promise.resolve(window.google);
  }

  if (googlePlacesPromise) {
    return googlePlacesPromise;
  }

  googlePlacesPromise = new Promise((resolve) => {
    let attempts = 0;
    const maxAttempts = 100; // 10 seconds with 100ms intervals

    const check = () => {
      if (window.google?.maps?.places) {
        resolve(window.google);
      } else if (attempts < maxAttempts) {
        attempts++;
        setTimeout(check, 100);
      } else {
        // Fallback: check if script exists but not yet loaded
        const script = document.querySelector("script[data-google-maps='places']");
        if (script) {
          script.addEventListener("load", () => resolve(window.google?.maps?.places ? window.google : null), { once: true });
          script.addEventListener("error", () => resolve(null), { once: true });
        } else {
          const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
          if (apiKey) {
            const newScript = document.createElement("script");
            newScript.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
            newScript.async = true;
            newScript.defer = true;
            newScript.setAttribute("data-google-maps", "places");
            newScript.addEventListener("load", () => resolve(window.google?.maps?.places ? window.google : null), { once: true });
            newScript.addEventListener("error", () => resolve(null), { once: true });
            document.head.appendChild(newScript);
          } else {
            resolve(null);
          }
        }
      }
    };

    check();
  });

  return googlePlacesPromise;
}
