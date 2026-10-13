"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { getMessages } from "@/lib/i18n";

export function AccountMenu({
  email,
  language = "ja",
  callbackUrl = "/",
}: {
  email?: string | null;
  language?: string;
  callbackUrl?: string;
}) {
  const [open, setOpen] = useState(false);
  const text = getMessages(language);
  if (!email) {
    return <Link href={`/auth/signin?language=${encodeURIComponent(language)}&callbackUrl=${encodeURIComponent(callbackUrl)}`} className="rounded-full border border-ink/15 px-4 py-2 text-sm text-ink">{text.signIn}</Link>;
  }
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((value) => !value)} className="max-w-52 truncate rounded-full border border-ink/15 px-4 py-2 text-sm text-ink" aria-expanded={open}>
        {email}
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-2 grid min-w-44 gap-1 rounded-xl border border-ink/10 bg-white p-2 shadow-lg">
          <Link href={`/favorites?language=${encodeURIComponent(language)}`} className="rounded-lg px-3 py-2 text-sm text-ink hover:bg-sand">{text.favorites}</Link>
          <button type="button" onClick={() => signOut({ callbackUrl: "/" })} className="rounded-lg px-3 py-2 text-left text-sm text-ink hover:bg-sand">{text.signOut}</button>
        </div>
      )}
    </div>
  );
}
