import { redirect } from "next/navigation";

export const metadata = {
  title: "Redirecting | SliceQ",
};

export default async function SurahIndexPage() {
  redirect("/");
}
