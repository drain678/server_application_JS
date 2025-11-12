import { request, clearDatabase, closeDatabase } from "./setup.js";

let token = "";
let userId = null;
let orderId = null;

beforeAll(async () => {
    await clearDatabase();

    const userRes = await request.post("/auth/register").send({
        name: "OrderUser",
        email: "orderuser@example.com",
        password: "12345",
        phone: "111222333"
    });
    userId = userRes.body.user.id;

    const loginRes = await request.post("/auth/login").send({
        email: "orderuser@example.com",
        password: "12345"
    });
    token = loginRes.body.token;
});

afterAll(async () => {
    await closeDatabase();
});

describe("Orders API", () => {
    test("Создание заказа", async () => {
        const res = await request
            .post("/orders")
            .set("Authorization", `Bearer ${token}`)
            .send({ user_id: userId, total_amount: 100 });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("id");
        orderId = res.body.id;
    });

    test("Получение всех заказов", async () => {
        const res = await request.get("/orders").set("Authorization", `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test("Получение заказа по ID", async () => {
        const res = await request.get(`/orders/${orderId}`).set("Authorization", `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("id", orderId);
    });

    test("Удаление заказа", async () => {
        const res = await request.delete(`/orders/${orderId}`).set("Authorization", `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toMatch(/удалён/i);
    });
});
