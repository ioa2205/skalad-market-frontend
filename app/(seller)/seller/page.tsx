import { redirect } from "next/navigation";

export default function SellerRootPage(): never {
  redirect("/seller/overview");
}
