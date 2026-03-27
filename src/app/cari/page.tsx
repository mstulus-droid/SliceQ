import { redirect } from "next/navigation";
export const metadata = {
  title: "Redirecting | SliceQ",
};

type SearchPageProps = {
  searchParams?: Promise<{
    q?: string;
    surah?: string;
    ayat?: string;
  }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const query = new URLSearchParams(
    Object.entries(params ?? {}).flatMap(([key, value]) =>
      value ? [[key, value]] : [],
    ),
  ).toString();

  redirect(query ? `/?${query}` : "/");
}
