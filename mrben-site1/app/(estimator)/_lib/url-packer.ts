/**
 * URL Packer Utility
 * This obfuscates the estimator data into a single Base64 string
 * to keep the URL clean and hide pricing logic from the address bar.
 */

export function packData(data: Record<string, any>): string {
  try {
    const jsonString = JSON.stringify(data);
    // Use btoa for Base64 encoding (standard in browsers)
    // We also make it URL-safe by replacing +, / and =
    return btoa(jsonString)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  } catch (e) {
    console.error("Packing error:", e);
    return "";
  }
}

export function unpackData(packedString: string): Record<string, any> | null {
  if (!packedString) return null;
  try {
    // Reverse the URL-safe replacements
    let base64 = packedString
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    // Add back padding if needed
    while (base64.length % 4) {
      base64 += '=';
    }
    
    const jsonString = atob(base64);
    return JSON.parse(jsonString);
  } catch (e) {
    console.error("Unpacking error:", e);
    return null;
  }
}
