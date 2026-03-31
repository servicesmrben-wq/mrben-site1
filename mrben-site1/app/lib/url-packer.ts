/**
 * This obfuscates the estimator data into a single Base64 string
 * to keep the URL clean and hide pricing logic from the address bar.
 * Using browser-compatible btoa/atob to avoid Node.js Buffer errors.
 */

export function packData(data: any): string {
  try {
    const str = JSON.stringify(data);
    // Use btoa for browser compatibility. We use encodeURIComponent to handle non-ASCII characters.
    return btoa(encodeURIComponent(str));
  } catch (e) {
    console.error("Packing error:", e);
    return "";
  }
}

export function unpackData(base64: string): any {
  try {
    // Use atob for browser compatibility.
    const str = decodeURIComponent(atob(base64));
    return JSON.parse(str);
  } catch (e) {
    console.error("Unpacking error:", e);
    return null;
  }
}
