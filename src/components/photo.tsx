import type { Image } from "@/lib/parkstack";

/** A Parkstack photo with its sizes. alt null means decorative. */
export function Photo({ image, sizes = "(min-width: 900px) 33vw, 100vw", className }: { image: Image | null; sizes?: string; className?: string }) {
  if (!image) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={image.url}
      srcSet={image.srcset ?? undefined}
      sizes={image.srcset ? sizes : undefined}
      width={image.width ?? undefined}
      height={image.height ?? undefined}
      alt={image.alt ?? ""}
      loading="lazy"
      className={className}
    />
  );
}
