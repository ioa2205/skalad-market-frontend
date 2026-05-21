import "server-only";

import { serverFetch } from "@/lib/api/server";
import { UserPhotoDTO, UsersDTO } from "@/lib/api/schemas/user";
import { ApiError } from "@/lib/api/errors";
import { log } from "@/lib/log";

export interface ProfileResult {
  profile?: UsersDTO;
  error?: { code: string; correlationId?: string | undefined };
}

export interface PhotoResult {
  photoId?: string;
  error?: { code: string; correlationId?: string | undefined };
}

export async function fetchProfileServer(): Promise<ProfileResult> {
  try {
    const profile = await serverFetch("/api/v1/users", {
      schema: UsersDTO,
      cache: "no-store",
    });
    return { profile };
  } catch (error) {
    const err = error instanceof ApiError ? error : null;
    log.warn("account.profile.fetch.failed", {
      code: err?.code ?? "unknown.error",
      correlationId: err?.correlationId,
    });
    return {
      error: {
        code: err?.code ?? "unknown.error",
        ...(err?.correlationId ? { correlationId: err.correlationId } : {}),
      },
    };
  }
}

export async function fetchPhotoServer(): Promise<PhotoResult> {
  try {
    const data = await serverFetch("/api/v1/users/photo", {
      schema: UserPhotoDTO,
      cache: "no-store",
    });
    return { photoId: data.photoId };
  } catch (error) {
    const err = error instanceof ApiError ? error : null;
    // Photo is optional: 404 / no photo set is normal — log at debug level
    // by treating it as a soft miss instead of a route-level failure.
    if (err && err.status !== 404) {
      log.warn("account.photo.fetch.failed", {
        code: err.code,
        correlationId: err.correlationId,
      });
    }
    return {
      error: {
        code: err?.code ?? "unknown.error",
        ...(err?.correlationId ? { correlationId: err.correlationId } : {}),
      },
    };
  }
}
