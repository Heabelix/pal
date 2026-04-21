# PAL — Pile À Lire

Application mobile-first pour gérer sa liste de lecture.

## Stack

| Couche     | Technologie              |
|------------|--------------------------|
| Frontend   | Next.js 14, Tailwind CSS, TypeScript |
| Backend    | Java 21, Quarkus 3, Hibernate ORM Panache |
| Base de données | H2 (dev) / PostgreSQL (prod) |
| Conteneurs | Docker + Docker Compose  |

## Fonctionnalités

- Ajouter, modifier, supprimer des livres
- Statuts : À lire / En cours / Terminé / Abandonné
- Suivi de la progression (pages lues)
- Filtres par statut et recherche plein texte
- Tableau de bord avec statistiques
- Interface mobile-first (PWA)

## Lancement en développement

### Backend (Quarkus)

```bash
cd backend
./mvnw quarkus:dev
```

L'API est disponible sur `http://localhost:8080/api/books`.

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
- Swagger  : http://localhost:8080/q/swagger-ui (dev)

## API REST

| Méthode | URL                         | Description                   |
|---------|-----------------------------|-------------------------------|
| GET     | /api/books                  | Lister (filtres: status, q)   |
| GET     | /api/books/{id}             | Détail d'un livre             |
| POST    | /api/books                  | Ajouter un livre              |
| PUT     | /api/books/{id}             | Modifier un livre             |
| PATCH   | /api/books/{id}/progress    | Mettre à jour la progression  |
| DELETE  | /api/books/{id}             | Supprimer un livre            |
| GET     | /api/books/stats            | Statistiques                  |

## Structure du projet

```
pal/
├── backend/          # Quarkus REST API
│   ├── src/main/java/com/pal/
│   │   ├── entity/Book.java
│   │   ├── dto/BookDto.java
│   │   └── resource/BookResource.java
│   └── src/main/resources/application.properties
├── frontend/         # Next.js PWA
│   └── src/
│       ├── app/
│       │   ├── page.tsx          # Accueil / stats
│       │   ├── liste/page.tsx    # Liste des livres
│       │   ├── ajouter/page.tsx  # Formulaire d'ajout
│       │   └── livre/[id]/page.tsx  # Détail / édition
│       ├── components/
│       │   ├── BottomNav.tsx
│       │   ├── BookCard.tsx
│       │   └── BookForm.tsx
│       ├── lib/api.ts
│       └── types/book.ts
└── docker-compose.yml
```
