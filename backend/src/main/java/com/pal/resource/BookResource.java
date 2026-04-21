package com.pal.resource;

import com.pal.dto.BookDto;
import com.pal.entity.Book;
import com.pal.repository.BookRepository;
import jakarta.inject.Inject;
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

    @Inject
    BookRepository repo;

    @GET
    public List<BookDto> list(
            @QueryParam("status") String status,
            @QueryParam("q") String query) {

        List<Book> books;
        if (query != null && !query.isBlank()) {
            books = repo.search(query.trim());
        } else if (status != null && !status.isBlank()) {
            books = repo.findByStatus(Book.Status.valueOf(status.toUpperCase()));
        } else {
            books = repo.findAll();
        }
        return books.stream().map(BookDto::from).collect(Collectors.toList());
    }

    @GET
    @Path("/stats")
    public Response stats() {
        return Response.ok(repo.stats()).build();
    }

    @GET
    @Path("/{id}")
    public Response get(@PathParam("id") Long id) {
        return repo.findById(id)
                .map(b -> Response.ok(BookDto.from(b)).build())
                .orElse(Response.status(Response.Status.NOT_FOUND).build());
    }

    @POST
    public Response create(@Valid BookDto dto) {
        Book book = dto.toBook();
        repo.create(book);
        return Response.status(Response.Status.CREATED).entity(BookDto.from(book)).build();
    }

    @PUT
    @Path("/{id}")
    public Response update(@PathParam("id") Long id, @Valid BookDto dto) {
        return repo.update(id, dto.toBook())
                .map(b -> Response.ok(BookDto.from(b)).build())
                .orElse(Response.status(Response.Status.NOT_FOUND).build());
    }

    @PATCH
    @Path("/{id}/progress")
    public Response updateProgress(@PathParam("id") Long id, ProgressRequest req) {
        return repo.updateProgress(id, req.pagesRead, req.status)
                .map(b -> Response.ok(BookDto.from(b)).build())
                .orElse(Response.status(Response.Status.NOT_FOUND).build());
    }

    @DELETE
    @Path("/{id}")
    public Response delete(@PathParam("id") Long id) {
        return repo.delete(id)
                ? Response.noContent().build()
                : Response.status(Response.Status.NOT_FOUND).build();
    }

    public static class ProgressRequest {
        public Integer pagesRead;
        public Book.Status status;
    }
}
