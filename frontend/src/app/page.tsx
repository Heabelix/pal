"use client";

import { useEffect, useState } from "react";
import { BookOpen, Clock, CheckCircle2, BookMarked, TrendingUp } from "lucide-react";
import { api } from "@/lib/api";
import type { BookStats } from "@/types/book";
import Link from "next/link";

export default function HomePage() {
  const [stats, setStats] = useState<BookStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.stats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const readingPercent = stats && stats.total > 0
    ? Math.round((stats.termine / stats.total) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900">
      {/* Header */}
      <div className="px-5 pt-14 pb-8">
        <p className="text-brand-200 text-sm font-medium tracking-wide uppercase">Bienvenue</p>
        <h1 className="text-white text-3xl font-bold mt-1">Ma Pile à Lire</h1>
        <p className="text-brand-200 text-sm mt-1">
          {new Date().toLocaleDateString("fr-FR", {
            weekday: "long", day: "numeric", month: "long",
          })}
        </p>
      </div>

      {/* Main card */}
      <div className="bg-gray-50 rounded-t-3xl min-h-screen px-5 pt-6">

        {/* Progress ring */}
        <div className="bg-white rounded-2xl p-5 mb-4 shadow-sm flex items-center gap-5">
          <div className="relative w-20 h-20 shrink-0">
            <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
              <circle cx="40" cy="40" r="32" fill="none" stroke="#f3d0fe" strokeWidth="8" />
              <circle
                cx="40" cy="40" r="32" fill="none"
                stroke="#a626d9" strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 32}`}
                strokeDashoffset={`${2 * Math.PI * 32 * (1 - readingPercent / 100)}`}
                className="transition-all duration-700"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-brand-700">
              {readingPercent}%
            </span>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Progression globale</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">
              {loading ? "—" : stats?.termine ?? 0}
              <span className="text-gray-400 font-normal text-base"> / {stats?.total ?? 0} livres</span>
            </p>
            <p className="text-brand-600 text-sm font-medium mt-1 flex items-center gap-1">
              <TrendingUp size={14} />
              {stats?.enCours ?? 0} en cours de lecture
            </p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-6 stagger-children">
          <StatCard
            icon={<BookOpen size={22} className="text-blue-500" />}
            label="À lire"
            value={stats?.aLire ?? 0}
            bg="bg-blue-50"
            loading={loading}
          />
          <StatCard
            icon={<Clock size={22} className="text-amber-500" />}
            label="En cours"
            value={stats?.enCours ?? 0}
            bg="bg-amber-50"
            loading={loading}
          />
          <StatCard
            icon={<CheckCircle2 size={22} className="text-green-500" />}
            label="Terminés"
            value={stats?.termine ?? 0}
            bg="bg-green-50"
            loading={loading}
          />
          <StatCard
            icon={<BookMarked size={22} className="text-gray-400" />}
            label="Abandonnés"
            value={stats?.abandonne ?? 0}
            bg="bg-gray-100"
            loading={loading}
          />
        </div>

        {/* Quick actions */}
        <h2 className="text-gray-700 font-semibold mb-3 text-sm uppercase tracking-wide">
          Actions rapides
        </h2>
        <div className="flex flex-col gap-3">
          <Link
            href="/liste?status=EN_COURS"
            className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4 active:bg-gray-50 transition-colors"
          >
            <div className="w-11 h-11 rounded-xl bg-amber-100 flex items-center justify-center">
              <Clock size={22} className="text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Continuer à lire</p>
              <p className="text-gray-400 text-sm">Reprendre mes lectures en cours</p>
            </div>
          </Link>

          <Link
            href="/ajouter"
            className="bg-brand-600 rounded-2xl p-4 flex items-center gap-4 active:bg-brand-700 transition-colors"
          >
            <div className="w-11 h-11 rounded-xl bg-brand-500 flex items-center justify-center">
              <BookOpen size={22} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-white">Ajouter un livre</p>
              <p className="text-brand-200 text-sm">Enrichir ma liste de lecture</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon, label, value, bg, loading,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  bg: string;
  loading: boolean;
}) {
  return (
    <div className={`${bg} rounded-2xl p-4 animate-slide-up`}>
      <div className="mb-2">{icon}</div>
      <p className="text-2xl font-bold text-gray-900">
        {loading ? <span className="inline-block w-8 h-7 bg-gray-200 rounded animate-pulse" /> : value}
      </p>
      <p className="text-gray-500 text-sm mt-0.5">{label}</p>
    </div>
  );
}
