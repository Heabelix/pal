package main

import (
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"

	"github.com/heabelix/pal/backend/internal/book"
	"github.com/heabelix/pal/backend/internal/db"
)

func main() {
	dsn := env("DATABASE_DSN",
		"root:@tcp(localhost:3306)/paldb?parseTime=true&charset=utf8mb4&loc=UTC")

	database, err := db.Connect(dsn)
	if err != nil {
		log.Fatal(err)
	}
	defer database.Close()

	if err := db.InitSchema(database); err != nil {
		log.Fatal(err)
	}

	repo := book.NewRepository(database)
	h := book.NewHandler(repo)

	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(cors)

	r.Route("/api/books", func(r chi.Router) {
		r.Get("/", h.List)
		r.Post("/", h.Create)
		r.Get("/stats", h.Stats)
		r.Get("/{id}", h.Get)
		r.Put("/{id}", h.Update)
		r.Patch("/{id}/progress", h.UpdateProgress)
		r.Delete("/{id}", h.Delete)
	})

	port := env("PORT", "8080")
	log.Printf("Serveur démarré sur :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}

func cors(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if origin == "" {
			origin = "*"
		}
		w.Header().Set("Access-Control-Allow-Origin", origin)
		w.Header().Set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type,Authorization,Accept")
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func env(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}
