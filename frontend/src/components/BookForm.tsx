"use client";

import { useState } from "react";
import type { Book, BookStatus } from "@/types/book";
import { STATUS_LABELS } from "@/types/book";

type FormData = {
  title: string;
  author: string;
  isbn?: string;
  coverUrl?: string;
  status: BookStatus;
  pagesTotal?: number;
  pagesRead?: number;
  notes?: string;
};

interface Props {
  initialValues?: Partial<Book>;
  onSubmit: (data: FormData) => Promise<void>;
  saving: boolean;
  submitLabel: string;
}

export default function BookForm({ initialValues, onSubmit, saving, submitLabel }: Props) {
  const [form, setForm] = useState<FormData>({
    title: initialValues?.title ?? "",
    author: initialValues?.author ?? "",
    isbn: initialValues?.isbn ?? "",
    coverUrl: initialValues?.coverUrl ?? "",
    status: initialValues?.status ?? "A_LIRE",
    pagesTotal: initialValues?.pagesTotal,
    pagesRead: initialValues?.pagesRead ?? 0,
    notes: initialValues?.notes ?? "",
  });

  const set = (key: keyof FormData, value: string | number | undefined) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      ...form,
      isbn: form.isbn || undefined,
      coverUrl: form.coverUrl || undefined,
      notes: form.notes || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Titre */}
      <Field label="Titre *">
        <input
          type="text"
          required
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder="Titre du livre"
          className={inputClass}
        />
      </Field>

      {/* Auteur */}
      <Field label="Auteur *">
        <input
          type="text"
          required
          value={form.author}
          onChange={(e) => set("author", e.target.value)}
          placeholder="Prénom Nom"
          className={inputClass}
        />
      </Field>

      {/* Statut */}
      <Field label="Statut">
        <select
          value={form.status}
          onChange={(e) => set("status", e.target.value as BookStatus)}
          className={inputClass}
        >
          {(Object.keys(STATUS_LABELS) as BookStatus[]).map((s) => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
      </Field>

      {/* Pages */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Nb. pages">
          <input
            type="number"
            min={0}
            value={form.pagesTotal ?? ""}
            onChange={(e) => set("pagesTotal", e.target.value ? Number(e.target.value) : undefined)}
            placeholder="—"
            className={inputClass}
          />
        </Field>
        <Field label="Pages lues">
          <input
            type="number"
            min={0}
            max={form.pagesTotal}
            value={form.pagesRead ?? ""}
            onChange={(e) => set("pagesRead", e.target.value ? Number(e.target.value) : 0)}
            placeholder="—"
            className={inputClass}
          />
        </Field>
      </div>

      {/* ISBN */}
      <Field label="ISBN">
        <input
          type="text"
          value={form.isbn ?? ""}
          onChange={(e) => set("isbn", e.target.value)}
          placeholder="9782…"
          className={inputClass}
        />
      </Field>

      {/* Cover URL */}
      <Field label="URL de couverture">
        <input
          type="url"
          value={form.coverUrl ?? ""}
          onChange={(e) => set("coverUrl", e.target.value)}
          placeholder="https://…"
          className={inputClass}
        />
      </Field>

      {/* Notes */}
      <Field label="Notes">
        <textarea
          value={form.notes ?? ""}
          onChange={(e) => set("notes", e.target.value)}
          placeholder="Vos impressions, citations…"
          rows={3}
          className={inputClass + " resize-none"}
        />
      </Field>

      <button
        type="submit"
        disabled={saving}
        className="w-full bg-brand-600 disabled:bg-brand-300 text-white font-semibold py-3.5 rounded-2xl transition-colors active:bg-brand-700 flex items-center justify-center gap-2"
      >
        {saving ? (
          <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : null}
        {submitLabel}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition";
