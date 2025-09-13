import "../../globals.css";
import React from "react";

import { notFound } from "next/navigation";

import { NextIntlClientProvider } from "next-intl";

import { PublicOnlyLayout } from "@/components/PublicOnlyLayout";
import SessionProviderWrapper from "@/components/session-provider-wrapper";

import { routing } from "@/i18n/routing";

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  if (!routing.locales.includes(lang as (typeof routing.locales)[number])) {
    notFound();
  }

  let messages = {};
  try {
    messages = (await import(`../../../../messages/${lang}.json`)).default;
  } catch {}

  return (
    <SessionProviderWrapper>
      <NextIntlClientProvider locale={lang as "en" | "es"} messages={messages}>
        <PublicOnlyLayout>{children}</PublicOnlyLayout>
      </NextIntlClientProvider>
    </SessionProviderWrapper>
  );
}
