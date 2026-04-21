package book

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"github.com/go-chi/chi/v5"
)

type Handler struct {
	repo *Repository
}

func NewHandler(repo *Repository) *Handler {
	return &Handler{repo: repo}
}

func (h *Handler) List(w http.ResponseWriter, r *http.Request) {
	status := Status(r.URL.Query().Get("status"))
	query := strings.TrimSpace(r.URL.Query().Get("q"))

	books, err := h.repo.FindAll(status, query)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, books)
}

func (h *Handler) Stats(w http.ResponseWriter, r *http.Request) {
	stats, err := h.repo.Stats()
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusOK, stats)
}

func (h *Handler) Get(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(w, r)
	if !ok {
		return
	}
	book, err := h.repo.FindByID(id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if book == nil {
		writeError(w, http.StatusNotFound, "livre introuvable")
		return
	}
	writeJSON(w, http.StatusOK, book)
}

func (h *Handler) Create(w http.ResponseWriter, r *http.Request) {
	var req CreateRequest
	if !decode(w, r, &req) {
		return
	}
	if errs := req.Validate(); len(errs) > 0 {
		writeJSON(w, http.StatusUnprocessableEntity, map[string]any{"errors": errs})
		return
	}
	book, err := h.repo.Create(req)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	writeJSON(w, http.StatusCreated, book)
}

func (h *Handler) Update(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(w, r)
	if !ok {
		return
	}
	var req CreateRequest
	if !decode(w, r, &req) {
		return
	}
	if errs := req.Validate(); len(errs) > 0 {
		writeJSON(w, http.StatusUnprocessableEntity, map[string]any{"errors": errs})
		return
	}
	book, err := h.repo.Update(id, req)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if book == nil {
		writeError(w, http.StatusNotFound, "livre introuvable")
		return
	}
	writeJSON(w, http.StatusOK, book)
}

func (h *Handler) UpdateProgress(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(w, r)
	if !ok {
		return
	}
	var req ProgressRequest
	if !decode(w, r, &req) {
		return
	}
	book, err := h.repo.UpdateProgress(id, req)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if book == nil {
		writeError(w, http.StatusNotFound, "livre introuvable")
		return
	}
	writeJSON(w, http.StatusOK, book)
}

func (h *Handler) Delete(w http.ResponseWriter, r *http.Request) {
	id, ok := pathID(w, r)
	if !ok {
		return
	}
	deleted, err := h.repo.Delete(id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, err.Error())
		return
	}
	if !deleted {
		writeError(w, http.StatusNotFound, "livre introuvable")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// -------------------------------------------------------------------------

func pathID(w http.ResponseWriter, r *http.Request) (int64, bool) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		writeError(w, http.StatusBadRequest, "id invalide")
		return 0, false
	}
	return id, true
}

func decode(w http.ResponseWriter, r *http.Request, v any) bool {
	if err := json.NewDecoder(r.Body).Decode(v); err != nil {
		writeError(w, http.StatusBadRequest, "JSON invalide: "+err.Error())
		return false
	}
	return true
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"error": msg})
}
