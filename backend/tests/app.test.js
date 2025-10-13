import request from "supertest";
import app from "../src/app.js";

describe("Prueba básica del servidor", () => {
  it("Debería responder con mensaje base", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/NeoCDT/);
  });
});
