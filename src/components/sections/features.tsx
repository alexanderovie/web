import React from "react";

import { PocketKnife } from "lucide-react";

import FeaturesList from "../features-list";
import SectionHeader from "../section-header";

interface FeaturesProps {
  iconTitle: string;
  title: string;
  description: string;
}

const Features = ({ iconTitle, title, description }: FeaturesProps) => {
  return (
    // CONTAINER PADRE
    <section id="smart-productivity" className="pt-12 lg:pt-20">
      {/* SECCIÓN 1: HEADER */}
      <div className="border-y">
        <SectionHeader
          iconTitle={iconTitle}
          title={title}
          icon={PocketKnife}
          description={description}
        />
      </div>

      {/* SECCIÓN 2: CONTENIDO PRINCIPAL */}
      <div className="container border-x lg:!px-0">
        <FeaturesList />
      </div>

      {/* SECCIÓN 3: FOOTER */}
      <div className="h-8 w-full border-y md:h-12 lg:h-[112px]">
        <div className="container h-full w-full border-x"></div>
      </div>
    </section>
  );
};

export default Features;
