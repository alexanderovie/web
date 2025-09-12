import React from "react";

import { Shapes } from "lucide-react";

import AdaptiveList from "../adaptive-list";
import SectionHeader from "../section-header";

const Adaptive = () => {
  return (
    <section id="adaptive-workflows" className="">
      <div className="border-b">
        <SectionHeader
          iconTitle="Adaptive"
          title="Stay agile with adaptive workflows"
          icon={Shapes}
          description={
            "AI streamlines your processes to adjust as priorities shift."
          }
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
