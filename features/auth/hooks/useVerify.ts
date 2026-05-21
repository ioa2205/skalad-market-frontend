"use client";

import { useMutation } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/errors";
import { log } from "@/lib/log";

import { verify, type VerifyResult } from "../api/auth.client";

export function useVerify() {
  return useMutation<VerifyResult, ApiError, string>({
    mutationFn: verify,
    onError: (error) => {
      log.warn("auth.verify.error", {
        code: error.code,
        status: error.status,
        correlationId: error.correlationId,
      });
    },
  });
}
