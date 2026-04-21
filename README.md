# PAL — Pile À Lire

Application mobile-first pour gérer sa liste de lecture.

## Stack

| Couche          | Technologie                          |
|-----------------|--------------------------------------|
| Frontend        | Next.js 14, Tailwind CSS, TypeScript |
| Backend         | Go 1.22, chi, database/sql           |
| Base de données | MySQL 8.0                            |
| Conteneurs      | Docker + Docker Compose              |

## Fonctionnalités

- Ajouter, modifier, supprimer des livres
- Statuts : À lire / En cours / Terminé / Abandonné
- Suivi de la progression (pages lues)
- Filtres par statut et recherche plein texte
- Tableau de bord avec statistiques
- Interface mobile-first (PWA)

## Lancement en développement

### Prérequis

Un serveur MySQL accessible et une base `paldb` créée :

```sql
CREATE DATABASE paldb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Backend (Go)

```bash
cd backend
DATABASE_DSN="root:@tcp(localhost:3306)/paldb?parseTime=true&charset=utf8mb4&loc=UTC" go run ./cmd/server
```

L'API est disponible sur `http://localhost:8080/api/books`.  
Le schéma et les données de démo sont créés automatiquement au premier démarrage.

### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

L'application est disponible sur `http://localhost:3000`.

## Lancement avec Docker Compose

```bash
docker compose up --build
```

- Frontend : http://localhost:3000
- Backend  : http://localhost:8080
- MySQL    : localhost:3306

## API REST

| Méthode | URL                       | Description                  |
|---------|---------------------------|------------------------------|
| GET     | /api/books                | Lister (filtres: status, q)  |
| GET     | /api/books/stats          | Statistiques                 |
| GET     | /api/books/{id}           | Détail d'un livre            |
| POST    | /api/books                | Ajouter un livre             |
| PUT     | /api/books/{id}           | Modifier un livre            |
| PATCH   | /api/books/{id}/progress  | Mettre à jour la progression |
| DELETE  | /api/books/{id}           | Supprimer un livre           |

### Variable d'environnement

| Variable       | Défaut                                                              |
|----------------|---------------------------------------------------------------------|
| `DATABASE_DSN` | `root:@tcp(localhost:3306)/paldb?parseTime=true&charset=utf8mb4&loc=UTC` |
| `PORT`         | `8080`                                                              |

## Structure du projet

```
pal/
├── backend/                    # API Go
│   ├── cmd/server/main.go      # Point d'entrée, router chi, middleware CORS
│   ├── internal/
│   │   ├── db/mysql.go         # Connexion, CREATE TABLE IF NOT EXISTS, seed
│   │   └── book/
│   │       ├── model.go        # Structs Book, Stats, requêtes
│   │       ├── repository.go   # CRUD avec database/sql
│   │       └── handler.go      # Handlers HTTP
│   ├── go.mod / go.sum
│   └── Dockerfile
├── frontend/                   # Next.js PWA
│   └── src/
│       ├── app/
│       │   ├── page.tsx              # Accueil / stats
│       │   ├── liste/page.tsx        # Liste filtrée + recherche
│       │   ├── ajouter/page.tsx      # Formulaire d'ajout
│       │   └── livre/[id]/page.tsx   # Détail / édition
│       ├── components/
│       │   ├── BottomNav.tsx
│       │   ├── BookCard.tsx
│       │   └── BookForm.tsx
│       ├── lib/api.ts
│       └── types/book.ts
└── docker-compose.yml
```
