import { IconTrendingUp } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function SectionCards() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Visitas al Perfil de Google</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            3,250
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className="bg-[#E3F2FD] text-[#1976D2] border-[#BBDEFB]"
            >
              <IconTrendingUp className="text-[#1976D2]" />
              +8.2%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Más visitas este mes <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Datos de los últimos 6 meses
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Llamadas recibidas</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            412
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className="bg-[#E3F2FD] text-[#1976D2] border-[#BBDEFB]"
            >
              <IconTrendingUp className="text-[#1976D2]" />
              +5.6%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Más llamadas este mes <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Llamadas desde el Perfil de Google
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Solicitudes de indicaciones</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            198
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className="bg-[#E3F2FD] text-[#1976D2] border-[#BBDEFB]"
            >
              <IconTrendingUp className="text-[#1976D2]" />
              +3.1%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Más solicitudes este mes <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Usuarios que solicitaron cómo llegar
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Clics en el sitio web</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            1,024
          </CardTitle>
          <CardAction>
            <Badge
              variant="outline"
              className="bg-[#E3F2FD] text-[#1976D2] border-[#BBDEFB]"
            >
              <IconTrendingUp className="text-[#1976D2]" />
              +6.7%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Más clics este mes <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Clics desde el Perfil de Google
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
