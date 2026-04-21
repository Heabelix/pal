package com.pal.resource;

import com.pal.dto.BookDto;
import com.pal.entity.Book;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;
import java.util.stream.Collectors;

@Path("/api/books")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class BookResource {

    @GET
    public List<BookDto> list(
            @QueryParam("status") String status,
            @QueryParam("q") String query) {

        List<Book> books;

        if (query != null && !query.isBlank()) {
            books = Book.search(query.trim());
        } else if (status != null && !status.isBlank()) {
            books = Book.findByStatus(Book.Status.valueOf(status.toUpperCase()));
        } else {
            books = Book.listAll();
        }

        return books.stream()
                .map(BookDto::from)
                .collect(Collectors.toList());
    }

    @GET
    @Path("/{id}")
    public Response get(@PathParam("id") Long id) {
        Book book = Book.findById(id);
        if (book == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(BookDto.from(book)).build();
    }

    @POST
    @Transactional
    public Response create(@Valid BookDto dto) {
        Book book = new Book();
        applyDto(book, dto);
        book.persist();
        return Response.status(Response.Status.CREATED).entity(BookDto.from(book)).build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public Response update(@PathParam("id") Long id, @Valid BookDto dto) {
        Book book = Book.findById(id);
        if (book == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        applyDto(book, dto);
        return Response.ok(BookDto.from(book)).build();
    }

    @PATCH
    @Path("/{id}/progress")
    @Transactional
    public Response updateProgress(@PathParam("id") Long id, ProgressRequest req) {
        Book book = Book.findById(id);
        if (book == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        if (req.pagesRead != null) {
            book.pagesRead = req.pagesRead;
        }
        if (req.status != null) {
            book.status = req.status;
        }
        return Response.ok(BookDto.from(book)).build();
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Response delete(@PathParam("id") Long id) {
        boolean deleted = Book.deleteById(id);
        return deleted
                ? Response.noContent().build()
                : Response.status(Response.Status.NOT_FOUND).build();
    }

    @GET
    @Path("/stats")
    public StatsResponse stats() {
        StatsResponse s = new StatsResponse();
        s.total = Book.count();
        s.aLire = Book.count("status", Book.Status.A_LIRE);
        s.enCours = Book.count("status", Book.Status.EN_COURS);
        s.termine = Book.count("status", Book.Status.TERMINE);
        s.abandonne = Book.count("status", Book.Status.ABANDONNE);
        return s;
    }

    private void applyDto(Book book, BookDto dto) {
        book.title = dto.title;
        book.author = dto.author;
        book.isbn = dto.isbn;
        book.coverUrl = dto.coverUrl;
        book.status = dto.status != null ? dto.status : Book.Status.A_LIRE;
        book.pagesTotal = dto.pagesTotal;
        book.pagesRead = dto.pagesRead != null ? dto.pagesRead : 0;
        book.notes = dto.notes;
    }

    public static class ProgressRequest {
        public Integer pagesRead;
        public Book.Status status;
    }

    public static class StatsResponse {
        public long total;
        public long aLire;
        public long enCours;
        public long termine;
        public long abandonne;
    }
}
