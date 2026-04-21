"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Trash2, BookOpen } from "lucide-react";
import { api } from "@/lib/api";
import type { Book, BookStatus } from "@/types/book";
import { STATUS_LABELS, STATUS_COLORS } from "@/types/book";
import BookForm from "@/components/BookForm";

export default function LivrePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [pagesInput, setPagesInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get(Number(id))
      .then((b) => {
        setBook(b);
        setPagesInput(String(b.pagesRead ?? 0));
      })
      .catch(() => router.push("/liste"))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleUpdate = async (data: Omit<Book, "id">) => {
    if (!book) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await api.update(book.id, data);
      setBook(updated);
    } catch {
      setError("Erreur lors de la mise à jour.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateProgress = async () => {
    if (!book) return;
    const pages = Number(pagesInput);
    if (isNaN(pages) || pages < 0) return;
    const updated = await api.updateProgress(book.id, pages);
    setBook(updated);
  };

  const handleDelete = async () => {
    if (!book) return;
    if (!confirm("Supprimer ce livre de la liste ?")) return;
    setDeleting(true);
    await api.delete(book.id);
    router.push("/liste");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!book) return null;

  const progress = book.pagesTotal && book.pagesTotal > 0
    ? Math.round(((book.pagesRead ?? 0) / book.pagesTotal) * 100)
    : null;

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
        <h1 className="text-xl font-bold text-gray-900 flex-1 truncate">{book.title}</h1>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-red-50 text-red-500"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="px-4 py-5 flex flex-col gap-4">
        {error && (
          <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm">{error}</div>
        )}

        {/* Status badge + progress */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[book.status]}`}>
              {STATUS_LABELS[book.status]}
            </span>
            {progress !== null && (
              <span className="text-sm font-semibold text-gray-700">{progress}%</span>
            )}
          </div>

          {book.status === "EN_COURS" && book.pagesTotal && (
            <>
              <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
                <div
                  className="bg-brand-500 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-gray-400 shrink-0" />
                <input
                  type="number"
                  min={0}
                  max={book.pagesTotal}
                  value={pagesInput}
                  onChange={(e) => setPagesInput(e.target.value)}
                  onBlur={handleUpdateProgress}
                  className="w-20 bg-gray-100 rounded-lg px-2.5 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
                <span className="text-sm text-gray-500">/ {book.pagesTotal} pages</span>
              </div>
            </>
          )}
        </div>

        {/* Edit form */}
        <BookForm
          initialValues={book}
          onSubmit={handleUpdate}
          saving={saving}
          submitLabel="Enregistrer les modifications"
        />
      </div>
    </div>
  );
}
