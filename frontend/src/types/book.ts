export type BookStatus = "A_LIRE" | "EN_COURS" | "TERMINE" | "ABANDONNE";

export interface Book {
  id: number;
  title: string;
  author: string;
  isbn?: string;
  coverUrl?: string;
  status: BookStatus;
  pagesTotal?: number;
  pagesRead?: number;
  notes?: string;
}

export interface BookStats {
  total: number;
  aLire: number;
  enCours: number;
  termine: number;
  abandonne: number;
}

export const STATUS_LABELS: Record<BookStatus, string> = {
  A_LIRE: "À lire",
  EN_COURS: "En cours",
  TERMINE: "Terminé",
  ABANDONNE: "Abandonné",
};

export const STATUS_COLORS: Record<BookStatus, string> = {
  A_LIRE: "bg-blue-100 text-blue-700",
  EN_COURS: "bg-amber-100 text-amber-700",
  TERMINE: "bg-green-100 text-green-700",
  ABANDONNE: "bg-gray-100 text-gray-500",
};
