"use client";

import { useMutation } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/errors";
import { log } from "@/lib/log";

import { resetConfirm, type ResetConfirmPayload } from "../api/auth.client";

export function useResetConfirm() {
  return useMutation<{ updated: true }, ApiError, ResetConfirmPayload>({
    mutationFn: resetConfirm,
    onError: (error) => {
      log.warn("auth.reset.confirm.error", {
        code: error.code,
        status: error.status,
        correlationId: error.correlationId,
      });
    },
  });
}
