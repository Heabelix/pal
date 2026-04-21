package book

import (
	"database/sql"
	"fmt"
	"time"
)

const cols = `id, title, author, isbn, cover_url, status, pages_total, pages_read, notes, created_at, updated_at`

type Repository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) FindAll(status Status, query string) ([]Book, error) {
	var (
		rows *sql.Rows
		err  error
	)
	base := `SELECT ` + cols + ` FROM book`
	switch {
	case query != "":
		pattern := "%" + query + "%"
		rows, err = r.db.Query(base+` WHERE LOWER(title) LIKE LOWER(?) OR LOWER(author) LIKE LOWER(?) ORDER BY created_at DESC`, pattern, pattern)
	case status != "":
		rows, err = r.db.Query(base+` WHERE status = ? ORDER BY created_at DESC`, string(status))
	default:
		rows, err = r.db.Query(base + ` ORDER BY created_at DESC`)
	}
	if err != nil {
		return nil, fmt.Errorf("findAll query: %w", err)
	}
	defer rows.Close()
	return scanRows(rows)
}

func (r *Repository) FindByID(id int64) (*Book, error) {
	row := r.db.QueryRow(`SELECT `+cols+` FROM book WHERE id = ?`, id)
	b, err := scanRow(row)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return b, err
}

func (r *Repository) Create(req CreateRequest) (*Book, error) {
	if req.Status == "" {
		req.Status = StatusToRead
	}
	now := time.Now().UTC()
	res, err := r.db.Exec(
		`INSERT INTO book (title, author, isbn, cover_url, status, pages_total, pages_read, notes, created_at, updated_at)
		 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		req.Title, req.Author, req.ISBN, req.CoverURL, req.Status,
		req.PagesTotal, req.PagesRead, req.Notes, now, now,
	)
	if err != nil {
		return nil, fmt.Errorf("create: %w", err)
	}
	id, _ := res.LastInsertId()
	return r.FindByID(id)
}

func (r *Repository) Update(id int64, req CreateRequest) (*Book, error) {
	if req.Status == "" {
		req.Status = StatusToRead
	}
	now := time.Now().UTC()
	res, err := r.db.Exec(
		`UPDATE book SET title=?, author=?, isbn=?, cover_url=?, status=?,
		 pages_total=?, pages_read=?, notes=?, updated_at=? WHERE id=?`,
		req.Title, req.Author, req.ISBN, req.CoverURL, req.Status,
		req.PagesTotal, req.PagesRead, req.Notes, now, id,
	)
	if err != nil {
		return nil, fmt.Errorf("update: %w", err)
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return nil, nil
	}
	return r.FindByID(id)
}

func (r *Repository) UpdateProgress(id int64, req ProgressRequest) (*Book, error) {
	book, err := r.FindByID(id)
	if err != nil || book == nil {
		return nil, err
	}
	pagesRead := book.PagesRead
	if req.PagesRead != nil {
		pagesRead = *req.PagesRead
	}
	status := book.Status
	if req.Status != nil {
		status = *req.Status
	}
	_, err = r.db.Exec(
		`UPDATE book SET pages_read=?, status=?, updated_at=? WHERE id=?`,
		pagesRead, status, time.Now().UTC(), id,
	)
	if err != nil {
		return nil, fmt.Errorf("updateProgress: %w", err)
	}
	return r.FindByID(id)
}

func (r *Repository) Delete(id int64) (bool, error) {
	res, err := r.db.Exec(`DELETE FROM book WHERE id=?`, id)
	if err != nil {
		return false, fmt.Errorf("delete: %w", err)
	}
	n, _ := res.RowsAffected()
	return n > 0, nil
}

func (r *Repository) Stats() (*Stats, error) {
	row := r.db.QueryRow(`
		SELECT
			COUNT(*),
			SUM(status = 'A_LIRE'),
			SUM(status = 'EN_COURS'),
			SUM(status = 'TERMINE'),
			SUM(status = 'ABANDONNE')
		FROM book`)
	var s Stats
	err := row.Scan(&s.Total, &s.ALire, &s.EnCours, &s.Termine, &s.Abandonne)
	return &s, err
}

// -------------------------------------------------------------------------

func scanRows(rows *sql.Rows) ([]Book, error) {
	var books []Book
	for rows.Next() {
		b, err := scanRow(rows)
		if err != nil {
			return nil, err
		}
		books = append(books, *b)
	}
	if books == nil {
		books = []Book{}
	}
	return books, rows.Err()
}

type scanner interface {
	Scan(dest ...any) error
}

func scanRow(s scanner) (*Book, error) {
	var b Book
	var isbn, coverURL, notes sql.NullString
	var pagesTotal sql.NullInt64
	err := s.Scan(
		&b.ID, &b.Title, &b.Author,
		&isbn, &coverURL, &b.Status,
		&pagesTotal, &b.PagesRead, &notes,
		&b.CreatedAt, &b.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("scan: %w", err)
	}
	if isbn.Valid {
		b.ISBN = &isbn.String
	}
	if coverURL.Valid {
		b.CoverURL = &coverURL.String
	}
	if notes.Valid {
		b.Notes = &notes.String
	}
	if pagesTotal.Valid {
		v := int(pagesTotal.Int64)
		b.PagesTotal = &v
	}
	return &b, nil
}
