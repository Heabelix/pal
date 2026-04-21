import type { Book, BookStats } from "@/types/book";

const BASE = "/api/books";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  list: (params?: { status?: string; q?: string }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set("status", params.status);
    if (params?.q) qs.set("q", params.q);
    const query = qs.toString() ? `?${qs}` : "";
    return request<Book[]>(`${BASE}${query}`);
  },

  get: (id: number) => request<Book>(`${BASE}/${id}`),

  stats: () => request<BookStats>(`${BASE}/stats`),

  create: (data: Omit<Book, "id">) =>
    request<Book>(BASE, { method: "POST", body: JSON.stringify(data) }),

  update: (id: number, data: Omit<Book, "id">) =>
    request<Book>(`${BASE}/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  updateProgress: (id: number, pagesRead: number) =>
    request<Book>(`${BASE}/${id}/progress`, {
      method: "PATCH",
      body: JSON.stringify({ pagesRead }),
    }),

  delete: (id: number) => request<void>(`${BASE}/${id}`, { method: "DELETE" }),
};
