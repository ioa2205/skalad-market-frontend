import {
  CompanyDirectoryToolbar,
  CompanyDirectoryView,
} from "@/features/company";
import {
  fetchCompanyDirectory,
  fetchCompanyMap,
} from "@/features/company/api/companies.server";

export const dynamic = "force-dynamic";

interface CompaniesPageProps {
  searchParams: Promise<{ q?: string | string[] }>;
}

function stringParam(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

export default async function CompaniesPage({ searchParams }: CompaniesPageProps) {
  const sp = await searchParams;
  const q = stringParam(sp.q).trim();
  const [directory, map] = await Promise.all([
    fetchCompanyDirectory({ q }),
    fetchCompanyMap({ q }),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-screen-xl flex-col gap-6 px-4 py-6 md:px-6">
      <CompanyDirectoryToolbar />
      <CompanyDirectoryView entries={directory.items} mapEntries={map.items} />
    </div>
  );
}
