"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const languages = [
  { code: "ja", label: "日本語" },
  { code: "en", label: "English" },
  { code: "zh", label: "中文" },
  { code: "ko", label: "한국어" },
] as const;

export function LanguageSwitcher({ language = "ja" }: { language?: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <nav aria-label="Language" className="flex flex-wrap gap-1 rounded-full border border-ink/15 bg-white/60 p-1 text-xs">
      {languages.map((item) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("language", item.code);
        return (
          <Link
            key={item.code}
            href={`${pathname}?${params.toString()}`}
            className={`rounded-full px-3 py-1.5 transition-colors ${
              language === item.code ? "bg-ink text-sand" : "text-ink/65 hover:bg-white"
            }`}
            aria-current={language === item.code ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
