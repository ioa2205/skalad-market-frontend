import Image, { type ImageProps } from "next/image";

import { minioLoader } from "@/lib/image/minioLoader";

export type MinioImageProps = Omit<ImageProps, "loader">;

/**
 * next/image specialized for backend MinIO assets. Forwards all next/image
 * props (including `fill`, `priority`, `placeholder`, `blurDataURL`).
 *
 * Always pass explicit `width` + `height` (or `fill`) to prevent CLS — this
 * primitive does not enforce it because some surfaces (`fill`) are valid
 * without explicit dims.
 */
export function MinioImage(props: MinioImageProps) {
  // alt is part of MinioImageProps and forwarded; jsx-a11y can't see it through the spread.
  // eslint-disable-next-line jsx-a11y/alt-text
  return <Image loader={minioLoader} {...props} />;
}
