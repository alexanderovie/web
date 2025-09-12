"use client";

import Terms from "./terms.mdx";

const Page = () => {
  return (
    <div className="mx-auto max-w-4xl px-4 py-20 lg:py-32">
      <div className="space-y-6 pb-20 text-center lg:pb-32">
        <h1 className="text-[2.5rem] font-semibold tracking-[-1.6px] md:text-5xl lg:text-7xl lg:tracking-[-4.32px]">
          Terms of Service
        </h1>
        <p className="text-muted-foreground-subtle tracking-[-0.32px]">
          Effective date: November 1, 2024
        </p>
      </div>

      <article className="prose dark:prose-invert text-muted-foreground">
        <Terms />
      </article>
    </div>
  );
};

export default Page;
