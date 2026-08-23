const backdropCache = new Map<string, string>();

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0"))
      .join("")
  );
}

/** Average RGB from ImageData sample region. */
function averageRgb(data: Uint8ClampedArray): [number, number, number] {
  let r = 0;
  let g = 0;
  let b = 0;
  const pixels = data.length / 4;
  for (let i = 0; i < data.length; i += 4) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
  }
  return [r / pixels, g / pixels, b / pixels];
}

/**
 * Sample corners of a product photo so card/PDP backgrounds match the studio backdrop.
 * Falls back to CSS `--product-image-bg` when sampling fails.
 */
export function sampleProductImageBackdrop(
  src: string,
  fallback = "#f0f0ee"
): Promise<string> {
  if (typeof window === "undefined") return Promise.resolve(fallback);

  const cached = backdropCache.get(src);
  if (cached) return Promise.resolve(cached);

  return new Promise((resolve) => {
    const img = new window.Image();
    img.decoding = "async";

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx || !img.naturalWidth || !img.naturalHeight) {
          resolve(fallback);
          return;
        }

        const patch = Math.max(
          8,
          Math.min(24, Math.floor(Math.min(img.naturalWidth, img.naturalHeight) * 0.02))
        );
        canvas.width = patch;
        canvas.height = patch;

        const corners: Array<[number, number]> = [
          [0, 0],
          [img.naturalWidth - patch, 0],
          [0, img.naturalHeight - patch],
          [img.naturalWidth - patch, img.naturalHeight - patch],
        ];

        let r = 0;
        let g = 0;
        let b = 0;

        for (const [sx, sy] of corners) {
          ctx.clearRect(0, 0, patch, patch);
          ctx.drawImage(img, sx, sy, patch, patch, 0, 0, patch, patch);
          const [cr, cg, cb] = averageRgb(ctx.getImageData(0, 0, patch, patch).data);
          r += cr;
          g += cg;
          b += cb;
        }

        const hex = rgbToHex(r / 4, g / 4, b / 4);
        backdropCache.set(src, hex);
        resolve(hex);
      } catch {
        resolve(fallback);
      }
    };

    img.onerror = () => resolve(fallback);
    img.src = src;
  });
}

export function getCachedProductImageBackdrop(src?: string | null): string | null {
  if (!src) return null;
  return backdropCache.get(src) ?? null;
}
