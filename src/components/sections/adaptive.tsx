import React from "react";

import { Shapes } from "lucide-react";

import AdaptiveList from "../adaptive-list";
import SectionHeader from "../section-header";

interface AdaptiveProps {
  iconTitle: string;
  title: string;
  description: string;
}

const Adaptive = ({ iconTitle, title, description }: AdaptiveProps) => {
  return (
    <section id="adaptive-workflows" className="">
      <div className="border-b">
        <SectionHeader
          iconTitle={iconTitle}
          title={title}
          icon={Shapes}
          description={description}
        />
      </div>

      <div className="container border-x lg:!px-0">
        <AdaptiveList />
      </div>

      <div className="h-8 w-full border-y md:h-12 lg:h-[112px]">
        <div className="container h-full w-full border-x"></div>
      </div>
    </section>
  );
};

export default Adaptive;
