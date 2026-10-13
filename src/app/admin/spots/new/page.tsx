import { SpotForm } from "@/components/admin/SpotForm";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getMessages } from "@/lib/i18n";

export default async function NewSpotPage({ searchParams }: { searchParams: Promise<{ language?: string }> }) {
  const { language = "ja" } = await searchParams;
  const t = getMessages(language);
  return <main className="mx-auto max-w-7xl space-y-6 px-6 py-12"><div className="flex justify-between"><h1 className="font-serif text-4xl text-ink">{t.newSpot}</h1><LanguageSwitcher language={language} /></div><SpotForm language={language} /></main>;
}
