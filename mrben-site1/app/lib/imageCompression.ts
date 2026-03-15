/**
 * Strictly compresses images to max 1024px longest edge and 0.8 quality.
 * Essential for bulk uploads to Gemini API.
 */
export async function compressImage(file: File): Promise<File> {
  // 1. Skip if not an image
  if (!file.type.startsWith("image/")) return file;

  // 2. Create Bitmap (Low overhead)
  const imageBitmap = await createImageBitmap(file);
  
  // 3. Calculate new dimensions (Max 1024px)
  const MAX_DIMENSION = 1024;
  const scale = Math.min(1, MAX_DIMENSION / Math.max(imageBitmap.width, imageBitmap.height));
  const width = Math.round(imageBitmap.width * scale);
  const height = Math.round(imageBitmap.height * scale);

  // 4. Draw to Canvas
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  
  if (!ctx) {
    imageBitmap.close();
    return file; // Fallback if context fails
  }

  ctx.drawImage(imageBitmap, 0, 0, width, height);

  // 5. Export as JPEG 0.8
  const blob = await new Promise<Blob | null>((resolve) => 
    canvas.toBlob(resolve, "image/jpeg", 0.8)
  );

  imageBitmap.close();

  if (!blob) return file;

  // 6. Return as File
  return new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}
