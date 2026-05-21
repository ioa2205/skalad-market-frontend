import { fetchThreadsServer } from "@/features/chat/api/chat.server";
import { SellerMessagesView } from "@/features/seller/components/messages/SellerMessagesView";

export const dynamic = "force-dynamic";

export default async function SellerMessagesPage() {
  const result = await fetchThreadsServer({ page: 1, perPage: 30 });
  return (
    <SellerMessagesView
      threads={result.items}
      {...(result.error ? { error: result.error } : {})}
    />
  );
}
