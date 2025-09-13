"use client";

import { Bar, BarChart, XAxis } from "recharts";

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
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const description = "A stacked bar chart with a legend";

const chartData = [
  { fecha: "2024-07-15", visitas: 520, llamadas: 32 },
  { fecha: "2024-07-16", visitas: 610, llamadas: 41 },
  { fecha: "2024-07-17", visitas: 480, llamadas: 28 },
  { fecha: "2024-07-18", visitas: 700, llamadas: 55 },
  { fecha: "2024-07-19", visitas: 650, llamadas: 38 },
  { fecha: "2024-07-20", visitas: 590, llamadas: 44 },
];

const chartConfig = {
  visitas: {
    label: "Visitas",
    color: "var(--google-blue)",
  },
  llamadas: {
    label: "Llamadas",
    color: "var(--google-green)",
  },
} satisfies ChartConfig;

export function ChartBarStacked() {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Visitas y Llamadas</CardTitle>
        <CardDescription>
          Interacciones desde el Perfil de Google (última semana)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={chartData}>
            <XAxis
              dataKey="fecha"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => {
                return new Date(value).toLocaleDateString("es-ES", {
                  weekday: "short",
                });
              }}
            />
            <Bar
              dataKey="visitas"
              stackId="a"
              fill="var(--google-blue)"
              radius={[0, 0, 4, 4]}
            />
            <Bar
              dataKey="llamadas"
              stackId="a"
              fill="var(--google-green)"
              radius={[4, 4, 0, 0]}
            />
            <ChartTooltip
              content={<ChartTooltipContent />}
              cursor={false}
              defaultIndex={1}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
