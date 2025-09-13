import React from "react";

import { useTranslations } from "next-intl";

export type { ValuesProps };

interface ValuesProps {
  namespace?: string;
}

const Values = ({ namespace = "aboutPage" }: ValuesProps) => {
  const t = useTranslations(namespace);
  const values = t.raw("values") as { title: string; description: string }[];
  return (
    <section className="">
      <div className="container">
        <h2 className="text-2xl font-bold mb-8">{t("valuesTitle")}</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {values.map((value, idx) => (
            <div
              key={idx}
              className="rounded-xl border bg-background p-6 shadow-sm flex flex-col"
            >
              <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
              <p className="text-muted-foreground-subtle">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Values;
