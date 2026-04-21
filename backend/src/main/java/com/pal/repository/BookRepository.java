package com.pal.repository;

import com.pal.entity.Book;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

import javax.sql.DataSource;
import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class BookRepository {

    private static final String COLS =
            "id, title, author, isbn, cover_url, status, pages_total, pages_read, notes, created_at, updated_at";

    @Inject
    DataSource dataSource;

    public List<Book> findAll() {
        String sql = "SELECT " + COLS + " FROM book ORDER BY created_at DESC";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            return mapAll(rs);
        } catch (SQLException e) {
            throw new RuntimeException("findAll failed", e);
        }
    }

    public List<Book> findByStatus(Book.Status status) {
        String sql = "SELECT " + COLS + " FROM book WHERE status = ? ORDER BY created_at DESC";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, status.name());
            try (ResultSet rs = ps.executeQuery()) {
                return mapAll(rs);
            }
        } catch (SQLException e) {
            throw new RuntimeException("findByStatus failed", e);
        }
    }

    public List<Book> search(String query) {
        String pattern = "%" + query.toLowerCase() + "%";
        String sql = "SELECT " + COLS + " FROM book WHERE LOWER(title) LIKE ? OR LOWER(author) LIKE ? ORDER BY created_at DESC";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, pattern);
            ps.setString(2, pattern);
            try (ResultSet rs = ps.executeQuery()) {
                return mapAll(rs);
            }
        } catch (SQLException e) {
            throw new RuntimeException("search failed", e);
        }
    }

    public Optional<Book> findById(Long id) {
        String sql = "SELECT " + COLS + " FROM book WHERE id = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setLong(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? Optional.of(mapRow(rs)) : Optional.empty();
            }
        } catch (SQLException e) {
            throw new RuntimeException("findById failed", e);
        }
    }

    public Book create(Book book) {
        String sql = """
                INSERT INTO book (title, author, isbn, cover_url, status, pages_total, pages_read, notes, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """;
        LocalDateTime now = LocalDateTime.now();
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, book.title);
            ps.setString(2, book.author);
            ps.setString(3, book.isbn);
            ps.setString(4, book.coverUrl);
            ps.setString(5, book.status.name());
            setNullableInt(ps, 6, book.pagesTotal);
            ps.setInt(7, book.pagesRead != null ? book.pagesRead : 0);
            ps.setString(8, book.notes);
            ps.setTimestamp(9, Timestamp.valueOf(now));
            ps.setTimestamp(10, Timestamp.valueOf(now));
            ps.executeUpdate();
            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next()) {
                    book.id = keys.getLong(1);
                }
            }
            book.createdAt = now;
            book.updatedAt = now;
            return book;
        } catch (SQLException e) {
            throw new RuntimeException("create failed", e);
        }
    }

    public Optional<Book> update(Long id, Book book) {
        String sql = """
                UPDATE book
                SET title = ?, author = ?, isbn = ?, cover_url = ?, status = ?,
                    pages_total = ?, pages_read = ?, notes = ?, updated_at = ?
                WHERE id = ?
                """;
        LocalDateTime now = LocalDateTime.now();
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, book.title);
            ps.setString(2, book.author);
            ps.setString(3, book.isbn);
            ps.setString(4, book.coverUrl);
            ps.setString(5, book.status.name());
            setNullableInt(ps, 6, book.pagesTotal);
            ps.setInt(7, book.pagesRead != null ? book.pagesRead : 0);
            ps.setString(8, book.notes);
            ps.setTimestamp(9, Timestamp.valueOf(now));
            ps.setLong(10, id);
            int rows = ps.executeUpdate();
            if (rows == 0) return Optional.empty();
            book.id = id;
            book.updatedAt = now;
            return Optional.of(book);
        } catch (SQLException e) {
            throw new RuntimeException("update failed", e);
        }
    }

    public Optional<Book> updateProgress(Long id, Integer pagesRead, Book.Status status) {
        String sql = "UPDATE book SET pages_read = ?, status = ?, updated_at = ? WHERE id = ?";
        LocalDateTime now = LocalDateTime.now();
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, pagesRead != null ? pagesRead : 0);
            ps.setString(2, status != null ? status.name() : Book.Status.EN_COURS.name());
            ps.setTimestamp(3, Timestamp.valueOf(now));
            ps.setLong(4, id);
            int rows = ps.executeUpdate();
            if (rows == 0) return Optional.empty();
            return findById(id);
        } catch (SQLException e) {
            throw new RuntimeException("updateProgress failed", e);
        }
    }

    public boolean delete(Long id) {
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement("DELETE FROM book WHERE id = ?")) {
            ps.setLong(1, id);
            return ps.executeUpdate() > 0;
        } catch (SQLException e) {
            throw new RuntimeException("delete failed", e);
        }
    }

    public BookStats stats() {
        String sql = """
                SELECT
                    COUNT(*) AS total,
                    SUM(status = 'A_LIRE') AS a_lire,
                    SUM(status = 'EN_COURS') AS en_cours,
                    SUM(status = 'TERMINE') AS termine,
                    SUM(status = 'ABANDONNE') AS abandonne
                FROM book
                """;
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            BookStats s = new BookStats();
            if (rs.next()) {
                s.total = rs.getLong("total");
                s.aLire = rs.getLong("a_lire");
                s.enCours = rs.getLong("en_cours");
                s.termine = rs.getLong("termine");
                s.abandonne = rs.getLong("abandonne");
            }
            return s;
        } catch (SQLException e) {
            throw new RuntimeException("stats failed", e);
        }
    }

    // -------------------------------------------------------------------------

    private List<Book> mapAll(ResultSet rs) throws SQLException {
        List<Book> books = new ArrayList<>();
        while (rs.next()) {
            books.add(mapRow(rs));
        }
        return books;
    }

    private Book mapRow(ResultSet rs) throws SQLException {
        Book b = new Book();
        b.id = rs.getLong("id");
        b.title = rs.getString("title");
        b.author = rs.getString("author");
        b.isbn = rs.getString("isbn");
        b.coverUrl = rs.getString("cover_url");
        b.status = Book.Status.valueOf(rs.getString("status"));
        int pt = rs.getInt("pages_total");
        b.pagesTotal = rs.wasNull() ? null : pt;
        b.pagesRead = rs.getInt("pages_read");
        b.notes = rs.getString("notes");
        Timestamp ca = rs.getTimestamp("created_at");
        b.createdAt = ca != null ? ca.toLocalDateTime() : null;
        Timestamp ua = rs.getTimestamp("updated_at");
        b.updatedAt = ua != null ? ua.toLocalDateTime() : null;
        return b;
    }

    private void setNullableInt(PreparedStatement ps, int idx, Integer value) throws SQLException {
        if (value != null) {
            ps.setInt(idx, value);
        } else {
            ps.setNull(idx, Types.INTEGER);
        }
    }

    public static class BookStats {
        public long total;
        public long aLire;
        public long enCours;
        public long termine;
        public long abandonne;
    }
}
