package com.pal;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@QuarkusTest
class BookResourceTest {

    @Test
    void testListBooks() {
        given()
                .when().get("/api/books")
                .then()
                .statusCode(200)
                .body("$", not(empty()));
    }

    @Test
    void testGetStats() {
        given()
                .when().get("/api/books/stats")
                .then()
                .statusCode(200)
                .body("total", greaterThanOrEqualTo(0));
    }

    @Test
    void testCreateBook() {
        String payload = """
                {
                  "title": "Test Book",
                  "author": "Test Author",
                  "status": "A_LIRE"
                }
                """;

        given()
                .contentType(ContentType.JSON)
                .body(payload)
                .when().post("/api/books")
                .then()
                .statusCode(201)
                .body("title", equalTo("Test Book"))
                .body("author", equalTo("Test Author"));
    }
}
