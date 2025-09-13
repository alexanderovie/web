import { useEffect } from "react";

export function useLoadScript(src: string, id: string) {
  useEffect(() => {
    if (document.getElementById(id)) return;
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.id = id;
    document.body.appendChild(script);
    return () => {
      document.getElementById(id)?.remove();
    };
  }, [src, id]);
}
