import {
  CompanyDirectoryToolbar,
  CompanyDirectoryView,
  STUB_COMPANIES,
} from "@/features/company";

export const dynamic = "force-dynamic";

export default function CompaniesPage() {
  return (
    <div className="mx-auto flex w-full max-w-screen-xl flex-col gap-6 px-4 py-6 md:px-6">
      <CompanyDirectoryToolbar />
      <CompanyDirectoryView entries={STUB_COMPANIES} />
    </div>
  );
}
