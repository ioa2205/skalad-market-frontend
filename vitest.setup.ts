import "@testing-library/jest-dom/vitest";

import { afterAll, afterEach, beforeAll } from "vitest";

import { mswServer } from "./lib/test/server";

process.env.GATEWAY_URL = "http://gateway.test";
process.env.NEXT_PUBLIC_MINIO_BASE_URL ??= "http://minio.test";

beforeAll(() => {
  mswServer.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
  mswServer.resetHandlers();
});

afterAll(() => {
  mswServer.close();
});
