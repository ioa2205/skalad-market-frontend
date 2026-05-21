import type { ReactNode } from "react";

import { AccountNav } from "@/features/account";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="mx-auto w-full max-w-screen-xl px-4 pt-6 md:px-6">
        <AccountNav />
      </div>
      {children}
    </>
  );
}
