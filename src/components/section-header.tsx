import * as React from "react";

import { LucideIcon } from "lucide-react";

import TitleTag from "@/components/title-tag";
import { cn, toTitleCaseES } from "@/lib/utils";

interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  icon: LucideIcon;
  iconTitle: string;
  description: React.ReactNode;
  lang?: string; // idioma opcional
  as?: "h1" | "h2"; // permitir usar H1 o H2
}

const SectionHeader = ({
  className,
  title,
  icon: Icon,
  iconTitle,
  description,
  lang,
  as = "h2", // por defecto H2
}: SectionHeaderProps) => {
  // Si el idioma es español, aplicar Title Case relevante
  const displayTitle = lang === "es" ? toTitleCaseES(title) : title;

  const HeadingTag = as;

  return (
    <div
      className={cn(
        "container flex flex-col gap-6 border-x py-4 max-lg:border-x lg:py-8",
        className,
      )}
    >
      <TitleTag title={iconTitle} icon={Icon} />
      <HeadingTag className="text-3xl leading-tight tracking-tight md:text-[38px] lg:!text-[48px]">
        {displayTitle}
      </HeadingTag>
      <p className="text-muted-foreground max-w-[600px] tracking-[-0.32px]">
        {description}
      </p>
    </div>
  );
};

export default SectionHeader;
