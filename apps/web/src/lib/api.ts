import { env } from "@/env";

export class ApiRequestError extends Error {
  constructor(
    public status: number,
    public body: { message?: string | string[] },
  ) {
    super(`API error ${status}`);
  }
}

const NO_RETRY = ["/auth/login", "/auth/register", "/auth/refresh"];

function raw(path: string, init: RequestInit = {}) {
  return fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      ...(init.body ? { "content-type": "application/json" } : {}),
      ...init.headers,
    },
  });
}

let refreshing: Promise<boolean> | null = null;
function refresh() {
  refreshing ??= raw("/auth/refresh", { method: "POST", body: "{}" })
    .then((r) => r.ok)
    .catch(() => false)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  let res = await raw(path, init);
  if (res.status === 401 && !NO_RETRY.includes(path) && (await refresh())) {
    res = await raw(path, init);
  }
  if (!res.ok) {
    throw new ApiRequestError(res.status, await res.json().catch(() => ({})));
  }
  if (res.status === 204) return undefined as T;
  return (await res.json().catch(() => undefined)) as T;
}
