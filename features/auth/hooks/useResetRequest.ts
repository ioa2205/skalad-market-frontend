"use client";

import { useMutation } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/errors";
import { log } from "@/lib/log";

import { resetRequest } from "../api/auth.client";

export function useResetRequest() {
  return useMutation<{ sent: true }, ApiError, string>({
    mutationFn: resetRequest,
    onError: (error) => {
      log.warn("auth.reset.error", {
        code: error.code,
        status: error.status,
        correlationId: error.correlationId,
      });
    },
  });
}
