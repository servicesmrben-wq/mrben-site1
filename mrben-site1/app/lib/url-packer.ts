/**
 * This obfuscates the estimator data into a single Base64 string
 * to keep the URL clean and hide pricing logic from the address bar.
 * Isomorphic: Works in both Browser (atob/btoa) and Node.js (Buffer).
 */

export function packData(data: any): string {
  try {
    const str = JSON.stringify(data);
    const encoded = encodeURIComponent(str);
    
    if (typeof window === "undefined") {
      // Server-side (Node.js)
      return Buffer.from(encoded).toString("base64");
    } else {
      // Client-side (Browser)
      return btoa(encoded);
    }
  } catch (e) {
    console.error("Packing error:", e);
    return "";
  }
}

export function unpackData(base64: string): any {
  if (!base64) return null;
  try {
    let decoded: string;
    
    if (typeof window === "undefined") {
      // Server-side (Node.js)
      decoded = Buffer.from(base64, "base64").toString("utf-8");
    } else {
      // Client-side (Browser)
      decoded = atob(base64);
    }
    
    return JSON.parse(decodeURIComponent(decoded));
  } catch (e) {
    console.error("Unpacking error:", e);
    return null;
  }
}
