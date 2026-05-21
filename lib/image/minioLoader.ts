/**
 * next/image loader for MinIO-served images.
 *
 * Backend stores assets on MinIO and surfaces full URLs in DTOs (e.g.
 * `ProductResponse.imageUrl`, `Banner.imageUrl`). This loader leaves
 * fully-qualified URLs alone and only rewrites bare keys to the configured
 * public MinIO base. Width is honored when a `?w=` query is supported by the
 * gateway; the backend currently doesn't transform, so we just pass it
 * through and rely on the browser to scale — explicit width/height on the
 * <Image /> still prevents CLS.
 */

export interface MinioLoaderArgs {
  src: string;
  width: number;
  quality?: number;
}

function getPublicBase(): string {
  return (
    process.env.NEXT_PUBLIC_MINIO_BASE_URL ?? process.env.NEXT_PUBLIC_GATEWAY_URL ?? ""
  );
}

export function minioLoader({ src, width, quality }: MinioLoaderArgs): string {
  if (!src) return src;

  const isAbsolute = /^https?:\/\//i.test(src);
  const joined = isAbsolute ? src : joinBase(getPublicBase(), src);
  const url = new URL(joined);

  url.searchParams.set("w", String(width));
  if (quality) url.searchParams.set("q", String(quality));

  return url.toString();
}

function joinBase(base: string, key: string): string {
  if (!base) return key.startsWith("/") ? key : `/${key}`;
  const trimmedBase = base.replace(/\/+$/, "");
  const trimmedKey = key.replace(/^\/+/, "");
  return `${trimmedBase}/${trimmedKey}`;
}
