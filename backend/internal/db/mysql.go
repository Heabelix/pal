package db

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	_ "github.com/go-sql-driver/mysql"
)

func Connect(dsn string) (*sql.DB, error) {
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		return nil, fmt.Errorf("sql.Open: %w", err)
	}
	db.SetMaxOpenConns(10)
	db.SetMaxIdleConns(2)
	db.SetConnMaxLifetime(5 * time.Minute)

	// Retry pour laisser MySQL démarrer (Docker Compose)
	for i := range 10 {
		if err = db.Ping(); err == nil {
			break
		}
		log.Printf("MySQL pas prêt, tentative %d/10…", i+1)
		time.Sleep(2 * time.Second)
	}
	if err != nil {
		return nil, fmt.Errorf("db.Ping: %w", err)
	}
	log.Println("Connexion MySQL établie.")
	return db, nil
}

func InitSchema(db *sql.DB) error {
	_, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS book (
			id          BIGINT AUTO_INCREMENT PRIMARY KEY,
			title       VARCHAR(500)  NOT NULL,
			author      VARCHAR(300)  NOT NULL,
			isbn        VARCHAR(20),
			cover_url   VARCHAR(1000),
			status      VARCHAR(20)   NOT NULL DEFAULT 'A_LIRE',
			pages_total INT,
			pages_read  INT           NOT NULL DEFAULT 0,
			notes       TEXT,
			created_at  DATETIME      NOT NULL,
			updated_at  DATETIME      NOT NULL
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
	`)
	if err != nil {
		return fmt.Errorf("create table: %w", err)
	}
	log.Println("Schéma vérifié/créé.")
	return seedIfEmpty(db)
}

func seedIfEmpty(db *sql.DB) error {
	var count int
	if err := db.QueryRow(`SELECT COUNT(*) FROM book`).Scan(&count); err != nil {
		return err
	}
	if count > 0 {
		return nil
	}

	type row struct{ title, author, isbn, status string; total, read int; notes *string }
	note := func(s string) *string { return &s }
	data := []row{
		{"Le Petit Prince", "Antoine de Saint-Exupéry", "9782070408504", "TERMINE", 96, 96, note("Un classique intemporel.")},
		{"Dune", "Frank Herbert", "9782266320481", "EN_COURS", 688, 320, note("Fascinant univers.")},
		{"Fondation", "Isaac Asimov", "9782070360536", "A_LIRE", 402, 0, nil},
		{"L'Étranger", "Albert Camus", "9782070360024", "A_LIRE", 159, 0, nil},
		{"1984", "George Orwell", "9782070368228", "TERMINE", 328, 328, note("Dystopie magistrale.")},
	}

	stmt, err := db.Prepare(`
		INSERT INTO book (title, author, isbn, status, pages_total, pages_read, notes, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
	`)
	if err != nil {
		return fmt.Errorf("prepare seed: %w", err)
	}
	defer stmt.Close()

	for _, d := range data {
		if _, err := stmt.Exec(d.title, d.author, d.isbn, d.status, d.total, d.read, d.notes); err != nil {
			return fmt.Errorf("seed insert: %w", err)
		}
	}
	log.Println("Données de démonstration insérées.")
	return nil
}
