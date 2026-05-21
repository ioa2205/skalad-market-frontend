"use client";

import { useMutation } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/errors";
import { log } from "@/lib/log";

import {
  register,
  type RegisterPayload,
  type RegisterResult,
} from "../api/auth.client";

export function useRegister() {
  return useMutation<RegisterResult, ApiError, RegisterPayload>({
    mutationFn: register,
    onError: (error) => {
      log.warn("auth.register.error", {
        code: error.code,
        status: error.status,
        correlationId: error.correlationId,
      });
    },
  });
}
