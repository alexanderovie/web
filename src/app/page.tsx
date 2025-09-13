import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const supportedLangs = ["es", "en"];
  // SSR: leer la cabecera accept-language
  const acceptLang = (await headers()).get("accept-language") || "";

  const preferred =
    supportedLangs.find((lang) => acceptLang.toLowerCase().includes(lang)) ||
    "es";

  redirect(`/${preferred}`);
  return null;
}
