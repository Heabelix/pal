package com.pal;

import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

/**
 * Tests d'intégration — nécessitent un MySQL accessible (voir application.properties profil %test).
 */
@QuarkusTest
class BookResourceTest {

    @Test
    void testListBooks() {
        given()
                .when().get("/api/books")
                .then()
                .statusCode(200)
                .body("$", instanceOf(java.util.List.class));
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
    void testCreateAndDeleteBook() {
        String payload = """
                {
                  "title": "Test Book",
                  "author": "Test Author",
                  "status": "A_LIRE"
                }
                """;

        Long id = given()
                .contentType(ContentType.JSON)
                .body(payload)
                .when().post("/api/books")
                .then()
                .statusCode(201)
                .body("title", equalTo("Test Book"))
                .body("author", equalTo("Test Author"))
                .extract().jsonPath().getLong("id");

        given()
                .when().delete("/api/books/" + id)
                .then()
                .statusCode(204);
    }

    @Test
    void testGetNotFound() {
        given()
                .when().get("/api/books/999999")
                .then()
                .statusCode(404);
    }
}
