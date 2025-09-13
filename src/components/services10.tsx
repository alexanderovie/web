"use client";

import {
  ArrowRight,
  CheckCircle,
  Cog,
  Code,
  PenTool,
  Shrub,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const Services10 = () => {
  const t = useTranslations("servicesPage");

  const services = [
    {
      icon: <Cog className="h-6 w-6" />,
      key: "productStrategy",
      featured: false,
    },
    {
      icon: <PenTool className="h-6 w-6" />,
      key: "design",
      featured: true,
    },
    {
      icon: <Code className="h-6 w-6" />,
      key: "webDevelopment",
      featured: true,
    },
    {
      icon: <Shrub className="h-6 w-6" />,
      key: "marketing",
      featured: false,
    },
  ];

  return (
    <section className="bg-muted/30 py-32">
      <div className="container">
        <div className="mx-auto max-w-6xl space-y-16">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {services.map((service, index) => {
              const serviceData = t.raw(`services.${service.key}`) as {
                title: string;
                description: string;
                items: string[];
                deliverables: string[];
                duration: string;
                price: string;
              };

              return (
                <div
                  key={index}
                  className={`group relative overflow-hidden rounded-xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                    service.featured
                      ? "border-primary/20 bg-background shadow-lg"
                      : "border-border bg-background/80 hover:bg-background backdrop-blur-sm"
                  }`}
                >
                  <div className="p-8">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          {service.icon}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold">
                            {serviceData.title}
                          </h3>
                          <div className="text-muted-foreground mt-1 text-sm">
                            {serviceData.duration}
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-muted-foreground mt-6 leading-relaxed">
                      {serviceData.description}
                    </p>

                    <div className="mt-6 space-y-4">
                      <div>
                        <h4 className="mb-3 text-sm font-medium">
                          {t("ui.whatsIncluded")}
                        </h4>
                        <ul className="space-y-2">
                          {serviceData.items.map((item, itemIndex) => (
                            <li
                              key={itemIndex}
                              className="flex items-center gap-3 text-sm"
                            >
                              <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-600" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-muted/50 rounded-lg p-4">
                        <h4 className="mb-2 text-sm font-medium">
                          {t("ui.deliverables")}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {serviceData.deliverables.map(
                            (deliverable, delivIndex) => (
                              <Badge
                                key={delivIndex}
                                variant="secondary"
                                className="text-xs"
                              >
                                {deliverable}
                              </Badge>
                            ),
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="border-border mt-8 border-t pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-lg font-semibold">
                            {serviceData.price}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {t("ui.customQuotes")}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant={service.featured ? "default" : "outline"}
                          className="transition-all group-hover:shadow-md"
                        >
                          {t("ui.getStarted")}
                          <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-background rounded-xl border p-8 text-center">
            <h3 className="mb-2 text-xl font-semibold">
              {t("ui.needCustomSolution")}
            </h3>
            <p className="text-muted-foreground mb-6">
              {t("ui.customSolutionDescription")}
            </p>
            <Button
              size="lg"
              className="from-primary to-primary/80 bg-gradient-to-r"
            >
              {t("ui.scheduleConsultation")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Services10 };
