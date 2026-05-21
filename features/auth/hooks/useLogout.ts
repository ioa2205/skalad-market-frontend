"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { toast } from "@/components/ui/sonner";
import { log } from "@/lib/log";

import { logout } from "../api/auth.client";
import { authKeys } from "../api/queryKeys";

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const t = useTranslations("shell.userMenu");

  return useMutation<void, Error, void>({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(authKeys.session, null);
      queryClient.invalidateQueries({ queryKey: authKeys.session });
      router.push("/");
      router.refresh();
    },
    onError: (error) => {
      log.warn("auth.logout.error", { msg: error.message });
      toast.error(t("logoutFailed"));
    },
  });
}
