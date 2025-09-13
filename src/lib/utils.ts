import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Convierte un string en español a Title Case solo para palabras relevantes
export function toTitleCaseES(str: string): string {
  // Lista de palabras que NO deben ir en mayúscula (excepto si son la primera palabra)
  const minWords = [
    "de",
    "del",
    "la",
    "las",
    "el",
    "los",
    "y",
    "o",
    "en",
    "a",
    "con",
    "por",
    "para",
    "sin",
    "sobre",
    "entre",
    "e",
    "u",
    "al",
  ];
  return str
    .toLowerCase()
    .split(" ")
    .map((word, i) =>
      i === 0 || !minWords.includes(word)
        ? word.charAt(0).toUpperCase() + word.slice(1)
        : word,
    )
    .join(" ");
}
