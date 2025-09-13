import React from "react";

import { Eye } from "lucide-react";

import OptimizeList from "../optimize-list";
import SectionHeader from "../section-header";

interface OptimizeProps {
  iconTitle: string;
  title: string;
  description: string;
}

const Optimize = ({ iconTitle, title, description }: OptimizeProps) => {
  return (
    <section id="optimized-scheduling" className="">
      <div className="border-b">
        <SectionHeader
          iconTitle={iconTitle}
          title={title}
          icon={Eye}
          description={description}
        />
      </div>

      <div className="container border-x lg:!px-0">
        <OptimizeList />
      </div>

      <div className="h-8 w-full border-y md:h-12 lg:h-[112px]">
        <div className="container h-full w-full border-x"></div>
      </div>
    </section>
  );
};

export default Optimize;
