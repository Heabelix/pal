package com.pal.dto;

import com.pal.entity.Book;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class BookDto {

    public Long id;

    @NotBlank
    @Size(max = 500)
    public String title;

    @NotBlank
    @Size(max = 300)
    public String author;

    @Size(max = 20)
    public String isbn;

    public String coverUrl;

    public Book.Status status;

    public Integer pagesTotal;

    public Integer pagesRead;

    @Size(max = 2000)
    public String notes;

    public static BookDto from(Book book) {
        BookDto dto = new BookDto();
        dto.id = book.id;
        dto.title = book.title;
        dto.author = book.author;
        dto.isbn = book.isbn;
        dto.coverUrl = book.coverUrl;
        dto.status = book.status;
        dto.pagesTotal = book.pagesTotal;
        dto.pagesRead = book.pagesRead;
        dto.notes = book.notes;
        return dto;
    }

    public Book toBook() {
        Book b = new Book();
        b.title = this.title;
        b.author = this.author;
        b.isbn = this.isbn;
        b.coverUrl = this.coverUrl;
        b.status = this.status != null ? this.status : Book.Status.A_LIRE;
        b.pagesTotal = this.pagesTotal;
        b.pagesRead = this.pagesRead != null ? this.pagesRead : 0;
        b.notes = this.notes;
        return b;
    }
}
