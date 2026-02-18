export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  const imageBitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    imageBitmap.close?.();
    return file;
  }

  const baseName = file.name.replace(/\.[^.]+$/, "") || "image";
  const nextName = `${baseName}.jpg`;
  const qualitySteps = [0.82, 0.72, 0.62, 0.52, 0.45];
  const dimensionSteps = [2000, 1600, 1280];
  const longestEdge = Math.max(imageBitmap.width, imageBitmap.height);
  const MAX_COMPRESSED_SIZE = 1024 * 1024; // 1MB

  const toBlob = (quality: number) =>
    new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", quality);
    });

  let finalBlob: Blob | null = null;

  for (const maxEdge of dimensionSteps) {
    const scale = Math.min(1, maxEdge / longestEdge);
    const targetWidth = Math.max(1, Math.round(imageBitmap.width * scale));
    const targetHeight = Math.max(1, Math.round(imageBitmap.height * scale));

    canvas.width = targetWidth;
    canvas.height = targetHeight;
    context.clearRect(0, 0, targetWidth, targetHeight);
    context.drawImage(imageBitmap, 0, 0, targetWidth, targetHeight);

    for (const quality of qualitySteps) {
      const blob = await toBlob(quality);
      if (blob && blob.size <= MAX_COMPRESSED_SIZE) {
        finalBlob = blob;
        break;
      }
    }

    if (finalBlob) break;
  }

  imageBitmap.close?.();

  if (!finalBlob) {
    throw new Error("image_too_large");
  }

  return new File([finalBlob], nextName, {
    type: "image/jpeg",
    lastModified: file.lastModified,
  });
}
