import Image from "next/image";

import { ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface HeroServicioProps {
  badge: string;
  heading: string;
  description: string;
  button: {
    text: string;
    url: string;
  };
  image: {
    src: string;
    alt: string;
  };
}

const HeroServicio = ({
  badge,
  heading,
  description,
  button,
  image,
}: HeroServicioProps) => {
  return (
    <section className="py-32">
      <div className="container">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            {badge && (
              <Badge variant="outline">
                {badge}
                <ArrowUpRight className="ml-2 size-4" />
              </Badge>
            )}
            <h1 className="my-6 text-pretty text-4xl font-bold md:text-5xl lg:text-6xl">
              {heading}
            </h1>
            <p className="text-muted-foreground mb-8 max-w-xl lg:text-xl">
              {description}
            </p>
            <div className="flex w-full flex-col justify-center gap-2 sm:flex-row lg:justify-start">
              <Button asChild className="w-full sm:w-auto">
                <a href={button.url}>{button.text}</a>
              </Button>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <Image
              src={image.src}
              alt={image.alt}
              width={400}
              height={300}
              className="max-h-96 w-full rounded-md object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroServicio;
