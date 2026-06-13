/**
 * Client-side image compression utility using HTML5 Canvas.
 * Iteratively reduces JPEG quality until the file size matches the target KB threshold.
 * 
 * @param {File} file - The raw uploaded file object from the input element.
 * @param {number} targetSizeKb - The maximum acceptable file size in kilobytes.
 * @param {number} maxWidth - Bounding box maximum width in pixels.
 * @param {number} maxHeight - Bounding box maximum height in pixels.
 * @returns {Promise<{blob: Blob, url: string, sizeKb: number, dimensions: {width: number, height: number}}>}
 */
export const compressImageToTarget = (file, targetSizeKb, maxWidth, maxHeight) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate responsive dimensions maintaining aspect ratio to fit inside boundary boxes
        if (maxWidth && maxHeight) {
          const aspectRatio = width / height;
          const targetRatio = maxWidth / maxHeight;

          if (width > maxWidth || height > maxHeight) {
            if (aspectRatio > targetRatio) {
              // Width is the primary bounding constraint
              width = maxWidth;
              height = Math.round(maxWidth / aspectRatio);
            } else {
              // Height is the primary bounding constraint
              height = maxHeight;
              width = Math.round(maxHeight * aspectRatio);
            }
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error("Failed to initialize canvas execution context."));
          return;
        }

        // Force solid white background block to prevent transparent PNGs/WebPs turning solid black
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        
        // Render the image down onto the computed frame dimensions
        ctx.drawImage(img, 0, 0, width, height);

        const targetBytes = targetSizeKb * 1024;
        let quality = 0.95;

        // Recursive extraction loop
        const iterate = (currentQuality) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Canvas frame stream extraction failed."));
                return;
              }

              // If file is still too heavy and quality margin remains, squeeze further
              if (blob.size > targetBytes && currentQuality > 0.05) {
                iterate(currentQuality - 0.05);
              } else {
                // Targeted size boundary cleared or minimum compression floor reached
                resolve({
                  blob,
                  url: URL.createObjectURL(blob),
                  sizeKb: parseFloat((blob.size / 1024).toFixed(1)),
                  dimensions: { width, height }
                });
              }
            },
            'image/jpeg',
            currentQuality
          );
        };

        iterate(quality);
      };

      img.onerror = () => reject(new Error("Failed to parse visual assets into memory."));
    };

    reader.onerror = (err) => reject(err);
  });
};