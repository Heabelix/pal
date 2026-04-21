package book

import "time"

type Status string

const (
	StatusToRead    Status = "A_LIRE"
	StatusReading   Status = "EN_COURS"
	StatusFinished  Status = "TERMINE"
	StatusAbandoned Status = "ABANDONNE"
)

func (s Status) Valid() bool {
	switch s {
	case StatusToRead, StatusReading, StatusFinished, StatusAbandoned:
		return true
	}
	return false
}

type Book struct {
	ID         int64     `json:"id"`
	Title      string    `json:"title"`
	Author     string    `json:"author"`
	ISBN       *string   `json:"isbn,omitempty"`
	CoverURL   *string   `json:"coverUrl,omitempty"`
	Status     Status    `json:"status"`
	PagesTotal *int      `json:"pagesTotal,omitempty"`
	PagesRead  int       `json:"pagesRead"`
	Notes      *string   `json:"notes,omitempty"`
	CreatedAt  time.Time `json:"createdAt"`
	UpdatedAt  time.Time `json:"updatedAt"`
}

type CreateRequest struct {
	Title      string  `json:"title"`
	Author     string  `json:"author"`
	ISBN       *string `json:"isbn"`
	CoverURL   *string `json:"coverUrl"`
	Status     Status  `json:"status"`
	PagesTotal *int    `json:"pagesTotal"`
	PagesRead  int     `json:"pagesRead"`
	Notes      *string `json:"notes"`
}

func (r *CreateRequest) Validate() []string {
	var errs []string
	if r.Title == "" {
		errs = append(errs, "title est obligatoire")
	}
	if r.Author == "" {
		errs = append(errs, "author est obligatoire")
	}
	if r.Status != "" && !r.Status.Valid() {
		errs = append(errs, "status invalide")
	}
	return errs
}

type ProgressRequest struct {
	PagesRead *int    `json:"pagesRead"`
	Status    *Status `json:"status"`
}

type Stats struct {
	Total     int64 `json:"total"`
	ALire     int64 `json:"aLire"`
	EnCours   int64 `json:"enCours"`
	Termine   int64 `json:"termine"`
	Abandonne int64 `json:"abandonne"`
}
