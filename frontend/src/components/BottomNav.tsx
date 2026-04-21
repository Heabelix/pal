"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, PlusCircle } from "lucide-react";
import clsx from "clsx";

const TABS = [
  { href: "/", icon: Home, label: "Accueil" },
  { href: "/liste", icon: BookOpen, label: "Ma liste" },
  { href: "/ajouter", icon: PlusCircle, label: "Ajouter" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/90 backdrop-blur-md border-t border-gray-100 flex items-center justify-around"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 8px)", paddingTop: "8px" }}
    >
      {TABS.map(({ href, icon: Icon, label }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={clsx(
              "flex flex-col items-center gap-0.5 px-5 py-1 rounded-xl transition-colors",
              active ? "text-brand-600" : "text-gray-400"
            )}
          >
            <Icon
              size={24}
              className={clsx("transition-transform", active && "scale-110")}
              strokeWidth={active ? 2.5 : 1.8}
            />
            <span className={clsx("text-xs font-medium", active ? "text-brand-600" : "text-gray-400")}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
