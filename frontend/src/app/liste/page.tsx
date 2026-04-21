"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { api } from "@/lib/api";
import type { Book, BookStatus } from "@/types/book";
import { STATUS_LABELS } from "@/types/book";
import BookCard from "@/components/BookCard";
import { Suspense } from "react";

const FILTERS: Array<{ key: BookStatus | "ALL"; label: string }> = [
  { key: "ALL", label: "Tous" },
  { key: "A_LIRE", label: "À lire" },
  { key: "EN_COURS", label: "En cours" },
  { key: "TERMINE", label: "Terminés" },
  { key: "ABANDONNE", label: "Abandonnés" },
];

function ListeContent() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") as BookStatus | null;

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<BookStatus | "ALL">(initialStatus ?? "ALL");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    const params: { status?: string; q?: string } = {};
    if (search) params.q = search;
    else if (activeFilter !== "ALL") params.status = activeFilter;
    api.list(params)
      .then(setBooks)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeFilter, search]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setActiveFilter("ALL");
  };

  const clearSearch = () => {
    setSearch("");
    setSearchInput("");
  };

  const handleDelete = async (id: number) => {
    await api.delete(id);
    setBooks((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-5 pt-14 pb-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Ma liste</h1>
          <span className="text-sm text-gray-400 font-medium">
            {books.length} livre{books.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="relative mb-4">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Titre, auteur…"
            className="w-full bg-gray-100 rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
          {searchInput && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              <X size={16} />
            </button>
          )}
        </form>

        {/* Filters */}
        {!search && (
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeFilter === f.key
                    ? "bg-brand-600 text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {search && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <SlidersHorizontal size={14} />
            <span>Résultats pour « {search} »</span>
            <button onClick={clearSearch} className="text-brand-600 font-medium">Effacer</button>
          </div>
        )}
      </div>

      {/* List */}
      <div className="px-4 py-4">
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl h-28 animate-pulse" />
            ))}
          </div>
        ) : books.length === 0 ? (
          <EmptyState filter={activeFilter} search={search} />
        ) : (
          <div className="flex flex-col gap-3 stagger-children">
            {books.map((book) => (
              <BookCard key={book.id} book={book} onDelete={handleDelete} onUpdate={load} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ filter, search }: { filter: string; search: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-6">
      <div className="text-6xl mb-4">📚</div>
      <p className="text-gray-700 font-semibold text-lg">
        {search ? "Aucun résultat" : "Aucun livre"}
      </p>
      <p className="text-gray-400 text-sm mt-1">
        {search
          ? `Aucun livre ne correspond à « ${search} »`
          : filter === "ALL"
          ? "Ajoutez votre premier livre !"
          : `Aucun livre avec le statut « ${STATUS_LABELS[filter as BookStatus]} »`}
      </p>
    </div>
  );
}

export default function ListePage() {
  return (
    <Suspense>
      <ListeContent />
    </Suspense>
  );
}
