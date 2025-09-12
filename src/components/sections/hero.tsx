import Image from "next/image";
import Link from "next/link";

import { ChevronRight } from "lucide-react";

import DiagonalPattern from "@/components/diagonal-pattern";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Hero() {
  return (
    <section className="pb-16 text-center lg:pb-0">
      <div className="flex">
        <BorderedSection className="2xl:flex-1">
          <DiagonalPattern />
        </BorderedSection>
        <div className="container mx-auto pt-16 pb-12 text-center md:pt-20 lg:pt-28">
          <h1 className="mx-auto max-w-[500px] text-[2.5rem] leading-[1.2] tracking-[-1.6px] text-balance md:text-[4rem] md:!leading-[1.15] md:tracking-[-4.32px] lg:text-7xl">
            Say Goodbye to Task Overload
          </h1>
          <p className="text-muted-foreground mx-auto mt-5 max-w-[500px] leading-[1.5] tracking-[-0.32px] md:mt-6">
            Prioritize, automate, and stay ahead—AI simplifies your tasks so you
            can focus on what matters most.
          </p>
          <Button asChild className="mt-6 gap-1 md:mt-8 lg:mt-10">
            <Link href="/dashboard">
              Get started
              <ChevronRight className="size-4" />
            </Link>
          </Button>
        </div>
        <BorderedSection className="border-r-0 border-l 2xl:flex-1">
          <DiagonalPattern />
        </BorderedSection>
      </div>
      <div className="flex h-8 gap-1 max-lg:hidden">
        <div className="flex-1 border" />
        <DiagonalPattern className="w-52" />
        <div className="w-24 border" />
        <DiagonalPattern className="w-52" />
        <div className="w-24 border" />
        <DiagonalPattern className="w-52" />
        <div className="flex-1 border" />
      </div>
      <div className="flex">
        <BorderedSection className="2xl:flex-1" />
        <div className={`container !pt-0 lg:!p-1.5`}>
          <Image
            src="/images/homepage/hero.png"
            alt="Hero"
            className="mx-auto rounded-xl border object-contain p-1 shadow-lg 2xl:max-w-[1092px] dark:invert"
            width={1000}
            height={600}
          />
        </div>
        <BorderedSection className="border-r-0 border-l 2xl:flex-1" />
      </div>
      <div className="flex max-lg:hidden">
        <div className="h-8 flex-1 border" />
        <div className="h-[96px] w-[min(753px,55vw)] -translate-y-1.5">
          <DiagonalPattern />
        </div>
        <div className="h-8 flex-1 border" />
      </div>
    </section>
  );
}

const BorderedSection = ({
  children,
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn("relative w-[159px] border-r p-1 max-lg:hidden", className)}
  >
    {children}
  </div>
);
