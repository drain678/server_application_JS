import { request, clearDatabase, closeDatabase } from "./setup.js";

let token = "";
let userId = null;
const userData = { name: "AuthUser", email: "authuser@example.com", password: "12345", phone: "111222333" };

beforeAll(async () => {
    await clearDatabase();
});

afterAll(async () => {
    await closeDatabase();
});

describe("Auth API", () => {
    test("Регистрация нового пользователя", async () => {
        const res = await request.post("/auth/register").send(userData);
        expect(res.statusCode).toBe(201);
        expect(res.body.user).toHaveProperty("email", userData.email);
        userId = res.body.user.id;
    });

    test("Логин пользователя и получение токена", async () => {
        const res = await request.post("/auth/login").send({
            email: userData.email,
            password: userData.password
        });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("token");
        token = res.body.token;
    });

    test("Получение профиля с токеном", async () => {
        const res = await request.get("/auth/profile").set("Authorization", `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("email", userData.email);
    });

    test("Доступ без токена запрещён", async () => {
        const res = await request.get("/auth/profile");
        expect(res.statusCode).toBe(401);
    });
});
