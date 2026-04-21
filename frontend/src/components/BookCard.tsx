"use client";

import Link from "next/link";
import { Trash2, ChevronRight } from "lucide-react";
import type { Book } from "@/types/book";
import { STATUS_LABELS, STATUS_COLORS } from "@/types/book";

interface Props {
  book: Book;
  onDelete: (id: number) => Promise<void>;
  onUpdate: () => void;
}

export default function BookCard({ book, onDelete }: Props) {
  const progress =
    book.pagesTotal && book.pagesTotal > 0
      ? Math.round(((book.pagesRead ?? 0) / book.pagesTotal) * 100)
      : null;

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Supprimer « ${book.title} » ?`)) return;
    await onDelete(book.id);
  };

  return (
    <Link
      href={`/livre/${book.id}`}
      className="bg-white rounded-2xl shadow-sm p-4 flex gap-4 items-start active:bg-gray-50 transition-colors animate-slide-up"
    >
      {/* Cover placeholder */}
      <div className="shrink-0 w-14 h-20 rounded-xl bg-gradient-to-br from-brand-200 to-brand-400 flex items-center justify-center overflow-hidden">
        {book.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={book.coverUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="text-2xl select-none">📖</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 leading-tight line-clamp-2">{book.title}</h3>
        <p className="text-gray-500 text-sm mt-0.5 truncate">{book.author}</p>

        <div className="mt-2 flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[book.status]}`}>
            {STATUS_LABELS[book.status]}
          </span>
          {progress !== null && (
            <span className="text-xs text-gray-400">{progress}%</span>
          )}
        </div>

        {/* Progress bar */}
        {book.status === "EN_COURS" && progress !== null && (
          <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
            <div
              className="bg-brand-500 h-1.5 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col items-center gap-3 ml-1">
        <ChevronRight size={18} className="text-gray-300" />
        <button
          onClick={handleDelete}
          className="text-gray-300 active:text-red-400 transition-colors p-1"
          aria-label="Supprimer"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </Link>
  );
}
