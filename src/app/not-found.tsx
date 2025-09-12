import Link from "next/link";

import { ChevronRight } from "lucide-react";

import DiagonalPattern from "@/components/diagonal-pattern";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="relative min-h-[80vh] py-14 md:py-20 lg:py-24">
      <div className="absolute inset-0 -z-10">
        <DiagonalPattern className="h-full w-full border-none opacity-[0.08]" />
      </div>

      <div className="relative container">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-primary text-[8rem] leading-none font-bold tracking-tight md:text-[12rem]">
            404
          </h1>

          <h2 className="mt-4 text-2xl font-semibold tracking-tight md:text-3xl">
            Page not found
          </h2>

          <p className="text-muted-foreground mt-6 text-lg tracking-[-0.32px]">
            Oops! It seems you&apos;ve ventured into uncharted territory. The
            page you&apos;re looking for doesn&apos;t exist.
          </p>

          <div className="mt-12 flex items-center justify-center gap-4">
            <Button asChild size="lg" className="gap-2">
              <Link href="/">
                Return home
                <ChevronRight className="size-4" />
              </Link>
            </Button>

            <Button asChild variant="outline" size="lg">
              <Link href="/contact">Contact support</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
