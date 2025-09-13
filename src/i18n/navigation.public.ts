import { createNavigation } from "next-intl/navigation";

import { routing } from "./routing.public";

// Solo para rutas públicas en el segmento [lang]
export const { Link, usePathname } = createNavigation(routing);
