/**
 * This obfuscates the estimator data into a single Base64 string
 * to keep the URL clean and hide pricing logic from the address bar.
 */

export function packData(data: any): string {
  try {
    const str = JSON.stringify(data);
    return Buffer.from(str).toString("base64");
  } catch (e) {
    console.error("Packing error:", e);
    return "";
  }
}

export function unpackData(base64: string): any {
  try {
    const str = Buffer.from(base64, "base64").toString("utf-8");
    return JSON.parse(str);
  } catch (e) {
    console.error("Unpacking error:", e);
    return null;
  }
}
