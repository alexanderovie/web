export async function apiFetch(input: RequestInfo, init?: RequestInit) {
  const res = await fetch(input, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      "Content-Type": "application/json",
      // Aquí puedes agregar lógica para tokens, etc.
    },
  });
  let data;
  try {
    data = await res.json();
  } catch {
    data = undefined;
  }
  if (!res.ok) {
    throw new Error(data?.message || data?.error || "Error en la API");
  }
  return data;
}
