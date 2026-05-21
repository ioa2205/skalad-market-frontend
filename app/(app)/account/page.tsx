import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { ErrorState } from "@/components/feedback";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AvatarUploader,
  LanguageSwitcher,
  ProfileForm,
  ProfileLinks,
  fetchPhotoServer,
  fetchProfileServer,
} from "@/features/account";
import { getSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AccountProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/account");

  const t = await getTranslations("account.profile");
  const [profileResult, photoResult] = await Promise.all([
    fetchProfileServer(),
    fetchPhotoServer(),
  ]);

  const photoUrl = photoResult.photoId
    ? `/api/proxy/api/v1/attach/open/${encodeURIComponent(photoResult.photoId)}`
    : null;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 md:px-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-h1 font-bold text-fg">{t("title")}</h1>
        <p className="text-body-sm text-fg-muted">{t("subtitle")}</p>
      </header>

      <Card>
        <CardContent className="p-6">
          <AvatarUploader currentUrl={photoUrl} name={session.username} />
        </CardContent>
      </Card>

      {profileResult.profile ? (
        <Card>
          <CardContent className="p-6">
            <ProfileForm
              initial={profileResult.profile}
              {...(session.username ? { username: session.username } : {})}
            />
          </CardContent>
        </Card>
      ) : (
        <ErrorState
          title={t("loadError.title")}
          description={t("loadError.body")}
          {...(profileResult.error?.correlationId
            ? {
                correlationId: profileResult.error.correlationId,
                correlationIdLabel: t("loadError.correlationLabel"),
              }
            : {})}
        />
      )}

      <LanguageCard />

      <ProfileLinks />
    </div>
  );
}

async function LanguageCard() {
  const t = await getTranslations("account.language");
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-h3">{t("title")}</CardTitle>
        <CardDescription>{t("subtitle")}</CardDescription>
      </CardHeader>
      <CardContent>
        <LanguageSwitcher />
      </CardContent>
    </Card>
  );
}
