import { getTranslations } from "next-intl/server";

import { CartView, type CartContactInfo } from "@/features/cart";
import { UsersDTO } from "@/lib/api/schemas";
import { serverFetch } from "@/lib/api/server";
import { getSession } from "@/lib/auth/session";
import { log } from "@/lib/log";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const t = await getTranslations("cart");
  const session = await getSession();

  const { contact, contactNeedsAttention } = await loadContactDefaults(session);

  return (
    <div className="mx-auto flex w-full max-w-screen-xl flex-col gap-6 px-4 py-6 md:px-6">
      <h1 className="text-h1 font-bold text-fg">{t("title")}</h1>
      <CartView contactDefaults={contact} contactNeedsAttention={contactNeedsAttention} />
    </div>
  );
}

async function loadContactDefaults(
  session: Awaited<ReturnType<typeof getSession>>,
): Promise<{ contact: CartContactInfo; contactNeedsAttention: boolean }> {
  if (!session) {
    return { contact: { contactName: "", contactPhone: "" }, contactNeedsAttention: true };
  }

  // GET /users carries firstName/lastName/extraPhone — we use those, then fall
  // back to the session username (which may be email or phone) for the phone
  // field, and a humanised username for the name. Backend has no primary
  // `phone` field on UsersDTO (see backend_summary §3.2); the user can edit
  // either field in the confirm dialog before fan-out.
  try {
    const profile = await serverFetch("/api/v1/users", { schema: UsersDTO });
    const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(" ").trim();
    const phone = profile.extraPhone?.trim();
    const usernameLooksLikePhone = session.username && /^\+?\d[\d\s-]*$/.test(session.username);
    return {
      contact: {
        contactName: fullName || session.username || "",
        contactPhone: phone || (usernameLooksLikePhone ? session.username! : ""),
      },
      contactNeedsAttention: !fullName || (!phone && !usernameLooksLikePhone),
    };
  } catch (error) {
    const err = error as { code?: string; correlationId?: string };
    log.warn("cart.contactDefaults.failed", {
      code: err.code ?? "unknown.error",
      correlationId: err.correlationId,
    });
    const usernameLooksLikePhone = session.username && /^\+?\d[\d\s-]*$/.test(session.username);
    return {
      contact: {
        contactName: session.username ?? "",
        contactPhone: usernameLooksLikePhone ? session.username! : "",
      },
      contactNeedsAttention: true,
    };
  }
}
