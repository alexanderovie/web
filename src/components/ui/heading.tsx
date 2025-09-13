import React from "react";

type HeadingProps = React.HTMLAttributes<HTMLHeadingElement>;

export function H1({ className = "", ...props }: HeadingProps) {
  return <h1 className={`heading-1 ${className}`} {...props} />;
}
