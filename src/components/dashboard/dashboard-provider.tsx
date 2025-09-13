"use client";

import * as React from "react";

import { NextIntlClientProvider } from "next-intl";

import { locales } from "@/config";

type Props = {
  children: React.ReactNode;
  locale: (typeof locales)[number];
  messages: Record<string, unknown>;
};

export default function DashboardProvider({
  children,
  locale,
  messages,
}: Props) {
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
