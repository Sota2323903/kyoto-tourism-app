"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getMessages } from "@/lib/i18n";

const messages = {
  ja: { title: "アカウントを作成", name: "名前（任意）", email: "メールアドレス", password: "パスワード（8文字以上）", confirm: "パスワード（確認）", submit: "アカウントを作成", signin: "サインインはこちら", mismatch: "パスワードが一致しません。", failed: "アカウントを作成できませんでした。" },
  en: { title: "Create an account", name: "Name (optional)", email: "Email", password: "Password (8+ characters)", confirm: "Confirm password", submit: "Create account", signin: "Sign in here", mismatch: "Passwords do not match.", failed: "Could not create the account." },
  zh: { title: "创建账户", name: "姓名（可选）", email: "邮箱", password: "密码（至少8个字符）", confirm: "确认密码", submit: "创建账户", signin: "登录", mismatch: "两次输入的密码不一致。", failed: "无法创建账户。" },
  ko: { title: "계정 만들기", name: "이름 (선택)", email: "이메일", password: "비밀번호 (8자 이상)", confirm: "비밀번호 확인", submit: "계정 만들기", signin: "로그인", mismatch: "비밀번호가 일치하지 않습니다.", failed: "계정을 만들 수 없습니다." },
} as const;

function SignUpForm() {
  const params = useSearchParams();
  const language = (params.get("language") ?? "ja") as keyof typeof messages;
  const text = messages[language] ?? messages.ja;
  const guestLabel = getMessages(language).guest;
  const requestedCallbackUrl = params.get("callbackUrl") ?? "/";
  const callbackUrl = requestedCallbackUrl.startsWith("/") && !requestedCallbackUrl.startsWith("//") ? requestedCallbackUrl : "/";
  const [error, setError] = useState("");
  const [complete, setComplete] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const data = new FormData(event.currentTarget);
    if (data.get("password") !== data.get("confirmPassword")) {
      setError(text.mismatch);
      return;
    }
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: data.get("name"), email: data.get("email"), password: data.get("password") }),
    });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      setError(result.error ?? text.failed);
      return;
    }
    setComplete(true);
  }

  return (
    <main className="mx-auto max-w-md space-y-6 px-6 py-16">
      <div className="flex justify-end"><LanguageSwitcher language={language} /></div>
      <h1 className="font-serif text-4xl text-ink">{getMessages(language).appName}</h1>
      {complete ? (
        <div className="grid gap-4 rounded-2xl border bg-white p-6">
          <p>{language === "en" ? "Your account has been created." : language === "zh" ? "账户已创建。" : language === "ko" ? "계정이 생성되었습니다." : "アカウントを作成しました。"}</p>
          <Link className="rounded-full bg-vermilion px-5 py-3 text-center font-semibold text-white" href={`/auth/signin?language=${language}`}>{text.signin}</Link>
        </div>
      ) : (
        <form onSubmit={submit} className="grid gap-4 rounded-2xl border bg-white p-6">
          <h2 className="text-xl font-semibold">{text.title}</h2>
          <label className="grid gap-1 text-sm">{text.name}<input name="name" type="text" maxLength={100} className="rounded-lg border px-3 py-2" /></label>
          <label className="grid gap-1 text-sm">{text.email}<input name="email" type="email" required className="rounded-lg border px-3 py-2" /></label>
          <label className="grid gap-1 text-sm">{text.password}<input name="password" type="password" minLength={8} required className="rounded-lg border px-3 py-2" /></label>
          <label className="grid gap-1 text-sm">{text.confirm}<input name="confirmPassword" type="password" minLength={8} required className="rounded-lg border px-3 py-2" /></label>
          <button className="rounded-full bg-vermilion px-5 py-3 font-semibold text-white" type="submit">{text.submit}</button>
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          <Link className="text-center text-sm text-ink/70 underline" href={`/auth/signin?language=${language}`}>{text.signin}</Link>
          <Link className="rounded-full border border-ink/20 px-5 py-3 text-center text-sm font-semibold text-ink" href={callbackUrl}>{guestLabel}</Link>
        </form>
      )}
    </main>
  );
}

export default function SignUpPage() {
  return <Suspense fallback={null}><SignUpForm /></Suspense>;
}
