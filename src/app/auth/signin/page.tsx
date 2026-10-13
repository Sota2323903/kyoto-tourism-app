"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { LanguageSwitcher } from "@/components/language-switcher";
import Link from "next/link";
import { getMessages } from "@/lib/i18n";

function SignInForm() {
  const params = useSearchParams();
  const language = params.get("language") ?? "ja";
  const t = getMessages(language);
  const requestedCallbackUrl = params.get("callbackUrl") ?? "/";
  const callbackUrl = requestedCallbackUrl.startsWith("/") && !requestedCallbackUrl.startsWith("//") ? requestedCallbackUrl : "/";
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const result = await signIn("credentials", { email: data.get("email"), password: data.get("password"), callbackUrl, redirect: false });
    if (result?.error) setError(language === "en" ? "Invalid email or password." : language === "zh" ? "邮箱或密码无效。" : language === "ko" ? "이메일 또는 비밀번호가 올바르지 않습니다." : "メールアドレスまたはパスワードが正しくありません。");
    else window.location.href = result?.url ?? "/";
  }
  return <main className="mx-auto max-w-md space-y-6 px-6 py-16"><div className="flex justify-end"><LanguageSwitcher language={language} /></div><h1 className="font-serif text-4xl text-ink">{t.appName}</h1><form onSubmit={submit} className="grid gap-4 rounded-2xl border bg-white p-6"><label className="grid gap-1 text-sm">Email<input name="email" type="email" required className="rounded-lg border px-3 py-2" /></label><label className="grid gap-1 text-sm">Password<input name="password" type="password" required className="rounded-lg border px-3 py-2" /></label><button className="rounded-full bg-vermilion px-5 py-3 font-semibold text-white" type="submit">{t.signIn}</button>{error && <p role="alert" className="text-sm text-red-600">{error}</p>}<Link className="text-center text-sm text-ink/70 underline" href={`/auth/signup?language=${language}`}>{language === "en" ? "Create an account" : language === "zh" ? "创建账户" : language === "ko" ? "계정 만들기" : "アカウントを新規作成"}</Link><Link className="rounded-full border border-ink/20 px-5 py-3 text-center text-sm font-semibold text-ink" href={callbackUrl}>{t.guest}</Link></form></main>;
}

export default function SignInPage() {
  return <Suspense fallback={null}><SignInForm /></Suspense>;
}
