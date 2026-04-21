-- Données de démonstration
INSERT INTO book (id, title, author, isbn, cover_url, status, pages_total, pages_read, notes, created_at, updated_at)
VALUES
  (nextval('book_seq'), 'Le Petit Prince', 'Antoine de Saint-Exupéry', '9782070408504', NULL, 'TERMINE', 96, 96, 'Un classique intemporel.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (nextval('book_seq'), 'Dune', 'Frank Herbert', '9782266320481', NULL, 'EN_COURS', 688, 320, 'Fascinant univers.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (nextval('book_seq'), 'Fondation', 'Isaac Asimov', '9782070360536', NULL, 'A_LIRE', 402, 0, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (nextval('book_seq'), 'L''Étranger', 'Albert Camus', '9782070360024', NULL, 'A_LIRE', 159, 0, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (nextval('book_seq'), '1984', 'George Orwell', '9782070368228', NULL, 'TERMINE', 328, 328, 'Dystopie magistrale.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
