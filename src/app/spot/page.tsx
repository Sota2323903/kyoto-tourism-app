import { redirect } from "next/navigation";

export default async function SpotSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; language?: string }>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.category) query.set("category", params.category);
  if (params.language) query.set("language", params.language);
  redirect(`/spots${query.toString() ? `?${query.toString()}` : ""}`);
}
