"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { api } from "@/lib/api";
import type { BookStatus } from "@/types/book";
import { STATUS_LABELS } from "@/types/book";
import BookForm from "@/components/BookForm";

export default function AjouterPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: {
    title: string;
    author: string;
    isbn?: string;
    coverUrl?: string;
    status: BookStatus;
    pagesTotal?: number;
    notes?: string;
  }) => {
    setSaving(true);
    setError(null);
    try {
      await api.create({ ...data, pagesRead: 0 });
      router.push("/liste");
    } catch (e) {
      setError("Erreur lors de l'ajout. Veuillez réessayer.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 pt-14 pb-4 sticky top-0 z-10 shadow-sm flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-600"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Ajouter un livre</h1>
      </div>

      <div className="px-4 py-5">
        {error && (
          <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 mb-4 text-sm">
            {error}
          </div>
        )}
        <BookForm onSubmit={handleSubmit} saving={saving} submitLabel="Ajouter à ma liste" />
      </div>
    </div>
  );
}
