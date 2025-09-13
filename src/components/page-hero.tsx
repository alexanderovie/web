import * as React from "react";

import { LucideIcon } from "lucide-react";

import TitleTag from "@/components/title-tag";
import { cn, toTitleCaseES } from "@/lib/utils";

interface PageHeroProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  iconTitle?: string;
  className?: string;
  lang?: string;
}

const PageHero: React.FC<PageHeroProps> = ({
  title,
  description,
  icon: Icon,
  iconTitle,
  className = "",
  lang,
}) => {
  const displayTitle = lang === "es" ? toTitleCaseES(title) : title;
  return (
    <div
      className={cn(
        "container flex flex-col gap-6 border-x py-4 max-lg:border-x lg:py-8 max-w-[480px] mx-auto items-start text-left md:items-center md:text-center",
        className,
      )}
    >
      {Icon && iconTitle && <TitleTag title={iconTitle} icon={Icon} />}
      <h1 className="text-4xl leading-tight tracking-tight md:text-5xl lg:text-6xl font-bold !text-4xl md:!text-5xl lg:!text-6xl">
        {displayTitle}
      </h1>
      <p className="text-muted-foreground max-w-[600px] tracking-[-0.32px]">
        {description}
      </p>
    </div>
  );
};

export default PageHero;
