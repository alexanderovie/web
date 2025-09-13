import { LucideIcon } from "lucide-react";

import { Badge } from "./ui/badge";

const TitleTag = ({
  title,
  icon: Icon,
}: {
  title: string;
  icon: LucideIcon;
}) => {
  return (
    <Badge
      variant="outline"
      className="bg-card w-fit gap-1 px-3 text-sm font-normal tracking-tight shadow-sm"
    >
      <Icon className="size-4" />
      <span>{title}</span>
    </Badge>
  );
};

export default TitleTag;
