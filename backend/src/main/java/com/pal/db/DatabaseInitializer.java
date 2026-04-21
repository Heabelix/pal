package com.pal.db;

import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;
import org.jboss.logging.Logger;

import javax.sql.DataSource;
import java.sql.*;

@ApplicationScoped
public class DatabaseInitializer {

    private static final Logger LOG = Logger.getLogger(DatabaseInitializer.class);

    @Inject
    DataSource dataSource;

    void onStart(@Observes StartupEvent ev) {
        createSchema();
        seedIfEmpty();
    }

    private void createSchema() {
        String sql = """
                CREATE TABLE IF NOT EXISTS book (
                    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
                    title      VARCHAR(500)  NOT NULL,
                    author     VARCHAR(300)  NOT NULL,
                    isbn       VARCHAR(20),
                    cover_url  VARCHAR(1000),
                    status     VARCHAR(20)   NOT NULL DEFAULT 'A_LIRE',
                    pages_total INT,
                    pages_read  INT          NOT NULL DEFAULT 0,
                    notes      TEXT,
                    created_at DATETIME      NOT NULL,
                    updated_at DATETIME      NOT NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
                """;
        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement()) {
            stmt.execute(sql);
            LOG.info("Schéma vérifié/créé.");
        } catch (SQLException e) {
            throw new RuntimeException("Impossible de créer le schéma", e);
        }
    }

    private void seedIfEmpty() {
        String count = "SELECT COUNT(*) FROM book";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(count);
             ResultSet rs = ps.executeQuery()) {
            if (rs.next() && rs.getLong(1) == 0) {
                insertSeedData(conn);
                LOG.info("Données de démonstration insérées.");
            }
        } catch (SQLException e) {
            throw new RuntimeException("Seed impossible", e);
        }
    }

    private void insertSeedData(Connection conn) throws SQLException {
        String sql = """
                INSERT INTO book (title, author, isbn, status, pages_total, pages_read, notes, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
                """;
        Object[][] data = {
            {"Le Petit Prince",   "Antoine de Saint-Exupéry", "9782070408504", "TERMINE",  96,  96, "Un classique intemporel."},
            {"Dune",              "Frank Herbert",             "9782266320481", "EN_COURS", 688, 320, "Fascinant univers."},
            {"Fondation",         "Isaac Asimov",              "9782070360536", "A_LIRE",   402,   0, null},
            {"L'Étranger",        "Albert Camus",              "9782070360024", "A_LIRE",   159,   0, null},
            {"1984",              "George Orwell",             "9782070368228", "TERMINE",  328, 328, "Dystopie magistrale."},
        };
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            for (Object[] row : data) {
                ps.setString(1, (String) row[0]);
                ps.setString(2, (String) row[1]);
                ps.setString(3, (String) row[2]);
                ps.setString(4, (String) row[3]);
                ps.setInt(5, (Integer) row[4]);
                ps.setInt(6, (Integer) row[5]);
                if (row[6] != null) ps.setString(7, (String) row[6]);
                else ps.setNull(7, Types.VARCHAR);
                ps.addBatch();
            }
            ps.executeBatch();
        }
    }
}
