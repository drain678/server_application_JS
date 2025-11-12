import { request, clearDatabase, closeDatabase } from "./setup.js";

let userId;

beforeAll(async () => {
    await clearDatabase();
});

afterAll(async () => {
    await closeDatabase();
});

describe("Users API", () => {
    test("Создание пользователя", async () => {
        const res = await request.post("/users").send({
            name: "User A",
            email: "usera@example.com",
            phone: "111222333"
        });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("id");
        userId = res.body.id;
    });

    test("Получение всех пользователей", async () => {
        const res = await request.get("/users");
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test("Получение пользователя по ID", async () => {
        const res = await request.get(`/users/${userId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("id", userId);
    });

    test("Удаление пользователя", async () => {
        const res = await request.delete(`/users/${userId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toMatch(/удалён/i);
    });
});
