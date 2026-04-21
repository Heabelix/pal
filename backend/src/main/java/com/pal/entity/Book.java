package com.pal.entity;

import java.time.LocalDateTime;

public class Book {

    public enum Status {
        A_LIRE, EN_COURS, TERMINE, ABANDONNE
    }

    public Long id;
    public String title;
    public String author;
    public String isbn;
    public String coverUrl;
    public Status status = Status.A_LIRE;
    public Integer pagesTotal;
    public Integer pagesRead = 0;
    public String notes;
    public LocalDateTime createdAt;
    public LocalDateTime updatedAt;
}
