import { AuthCard } from "@/features/auth/components/AuthCard";
import { VerifyClient } from "@/features/auth/components/VerifyClient";

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return (
    <AuthCard>
      <VerifyClient token={token} />
    </AuthCard>
  );
}
