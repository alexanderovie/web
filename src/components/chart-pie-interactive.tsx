"use client";

import * as React from "react";

import { Label, Pie, PieChart, Sector } from "recharts";
import { PieSectorDataItem } from "recharts/types/polar/Pie";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const description = "An interactive pie chart";

const fuentesData = [
  { fuente: "Búsqueda de Google", valor: 520, fill: "var(--google-blue)" },
  { fuente: "Google Maps", valor: 310, fill: "var(--google-green)" },
  { fuente: "Directo", valor: 180, fill: "var(--google-yellow)" },
  { fuente: "Redes Sociales", valor: 90, fill: "var(--google-red)" },
  { fuente: "Otros", valor: 60, fill: "var(--google-purple)" },
];

const chartConfig = {
  "Búsqueda de Google": {
    label: "Búsqueda de Google",
    color: "var(--google-blue)",
  },
  "Google Maps": {
    label: "Google Maps",
    color: "var(--google-green)",
  },
  Directo: {
    label: "Directo",
    color: "var(--google-yellow)",
  },
  "Redes Sociales": {
    label: "Redes Sociales",
    color: "var(--google-red)",
  },
  Otros: {
    label: "Otros",
    color: "var(--google-purple)",
  },
} satisfies ChartConfig;

export function ChartPieInteractive() {
  const id = "pie-interactive";
  const [fuenteActiva, setFuenteActiva] = React.useState(fuentesData[0].fuente);

  const activeIndex = React.useMemo(
    () => fuentesData.findIndex((item) => item.fuente === fuenteActiva),
    [fuenteActiva],
  );
  const fuentes = React.useMemo(
    () => fuentesData.map((item) => item.fuente),
    [],
  );

  return (
    <Card data-chart={id} className="h-full flex flex-col">
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="flex-row items-start space-y-0 pb-0">
        <div className="grid gap-1">
          <CardTitle>Fuentes de Tráfico</CardTitle>
          <CardDescription>
            Distribución de visitas (últimos 30 días)
          </CardDescription>
        </div>
        <Select value={fuenteActiva} onValueChange={setFuenteActiva}>
          <div className="relative group ml-auto">
            <SelectTrigger
              className="h-7 w-[210px] rounded-lg pl-2.5"
              aria-label="Selecciona una fuente"
            >
              <SelectValue placeholder="Selecciona una fuente" />
            </SelectTrigger>
            <div
              className="pointer-events-none absolute left-0 top-full z-10 mt-1 hidden w-max min-w-[210px] max-w-xs rounded bg-black/90 px-3 py-1 text-xs text-white opacity-0 group-hover:block group-hover:opacity-100 transition-opacity"
              style={{ whiteSpace: "nowrap" }}
            >
              {fuenteActiva}
            </div>
          </div>
          <SelectContent align="end" className="rounded-xl">
            {fuentes.map((key) => {
              const config = chartConfig[key as keyof typeof chartConfig];

              if (!config) {
                return null;
              }

              return (
                <SelectItem
                  key={key}
                  value={key}
                  className="rounded-lg [&_span]:flex"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className="flex h-3 w-3 shrink-0 rounded-xs"
                      style={{
                        backgroundColor: `var(--color-${key})`,
                      }}
                    />
                    {config?.label}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex flex-1 items-start pt-4 pb-4">
        <ChartContainer
          id={id}
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={fuentesData}
              dataKey="valor"
              nameKey="fuente"
              innerRadius={60}
              strokeWidth={5}
              activeShape={({
                outerRadius = 0,
                ...props
              }: PieSectorDataItem) => (
                <g>
                  <Sector {...props} outerRadius={outerRadius + 10} />
                  <Sector
                    {...props}
                    outerRadius={outerRadius + 25}
                    innerRadius={outerRadius + 12}
                  />
                </g>
              )}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {fuentesData[activeIndex].valor.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Visitas
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
