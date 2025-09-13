import React from "react";

import Image from "next/image";
import Link from "next/link";

import { Users, Twitter, Github } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

import SectionHeader from "../section-header";

import teamMembers from "@/data/team.json";

interface TeamMember {
  name: Record<string, string>;
  role: Record<string, string>;
  bio: Record<string, string>;
  image: string;
  social: {
    twitter?: string;
    github?: string;
  };
}

const Team = () => {
  const t = useTranslations("aboutPage");
  const locale = useLocale();
  return (
    <section className="">
      <SectionHeader
        iconTitle={t("teamTitle")}
        title={t("teamTitle")}
        icon={Users}
        description={t("teamDescription")}
        className={"border-none"}
      />

      <div className="container mt-10 grid gap-x-12 gap-y-16 sm:grid-cols-2 md:mt-14 lg:grid-cols-4">
        {(teamMembers as TeamMember[]).map((member) => (
          <div key={member.name[locale]} className="group flex flex-col">
            <Image
              src={member.image}
              alt={member.name[locale]}
              width={80}
              height={80}
              className="rounded-full object-contain"
            />
            <div className="mt-6 flex flex-col tracking-[-0.32px]">
              <h3 className="text-lg">{member.name[locale]}</h3>
              <p className="text-muted-foreground-subtle">
                {member.role[locale]}
              </p>
              <p className="text-muted-foreground mt-4 text-sm tracking-[-0.36px]">
                {member.bio[locale]}
              </p>
              <div className="mt-6 flex gap-2">
                {member.social.twitter && (
                  <Link
                    href={member.social.twitter}
                    className="hover:text-foreground"
                  >
                    <Twitter className="size-4" />
                  </Link>
                )}
                {member.social.github && (
                  <Link
                    href={member.social.github}
                    className="hover:text-foreground"
                  >
                    <Github className="size-4" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Team;
