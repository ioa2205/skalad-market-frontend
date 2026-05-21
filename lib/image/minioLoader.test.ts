import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { minioLoader } from "./minioLoader";

describe("minioLoader", () => {
  const originalBase = process.env.NEXT_PUBLIC_MINIO_BASE_URL;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_MINIO_BASE_URL = "https://cdn.example.com/bucket";
  });

  afterEach(() => {
    if (originalBase === undefined) delete process.env.NEXT_PUBLIC_MINIO_BASE_URL;
    else process.env.NEXT_PUBLIC_MINIO_BASE_URL = originalBase;
  });

  it("appends width to fully-qualified URLs", () => {
    const out = minioLoader({ src: "https://cdn.example.com/bucket/a.jpg", width: 320 });
    expect(out).toBe("https://cdn.example.com/bucket/a.jpg?w=320");
  });

  it("joins bare keys to the configured base", () => {
    const out = minioLoader({ src: "products/1/image.jpg", width: 480, quality: 80 });
    expect(out).toBe("https://cdn.example.com/bucket/products/1/image.jpg?w=480&q=80");
  });

  it("strips duplicate slashes when joining", () => {
    const out = minioLoader({ src: "/products/1/image.jpg", width: 480 });
    expect(out).toBe("https://cdn.example.com/bucket/products/1/image.jpg?w=480");
  });
});
