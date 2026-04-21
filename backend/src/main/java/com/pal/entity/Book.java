package com.pal.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "book")
public class Book extends PanacheEntity {

    public enum Status {
        A_LIRE, EN_COURS, TERMINE, ABANDONNE
    }

    @NotBlank
    @Size(max = 500)
    @Column(nullable = false)
    public String title;

    @NotBlank
    @Size(max = 300)
    @Column(nullable = false)
    public String author;

    @Size(max = 20)
    public String isbn;

    @Column(name = "cover_url")
    public String coverUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public Status status = Status.A_LIRE;

    @Column(name = "pages_total")
    public Integer pagesTotal;

    @Column(name = "pages_read")
    public Integer pagesRead = 0;

    @Column(length = 2000)
    public String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    public LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    public LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public static List<Book> findByStatus(Status status) {
        return list("status", status);
    }

    public static List<Book> search(String query) {
        String q = "%" + query.toLowerCase() + "%";
        return list("lower(title) like ?1 or lower(author) like ?1", q);
    }
}
