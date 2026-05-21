"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/errors";
import { log } from "@/lib/log";

import { authKeys } from "../api/queryKeys";
import { login, type LoginPayload, type LoginResult } from "../api/auth.client";

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation<LoginResult, ApiError, LoginPayload>({
    mutationFn: login,
    onSuccess: () => {
      // Invalidate so any session-aware components refetch through /api/auth/session.
      queryClient.invalidateQueries({ queryKey: authKeys.session });
    },
    onError: (error) => {
      log.warn("auth.login.error", {
        code: error.code,
        status: error.status,
        correlationId: error.correlationId,
      });
    },
  });
}
