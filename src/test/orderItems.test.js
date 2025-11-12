import { request, clearDatabase, closeDatabase } from "./setup.js";

let token = "";
let userId = null;
let orderId = null;
let itemId = null;

beforeAll(async () => {
    await clearDatabase();

    const userRes = await request.post("/auth/register").send({
        name: "ItemUser",
        email: "itemuser@example.com",
        password: "12345",
        phone: "111222333"
    });
    userId = userRes.body.user.id;

    const loginRes = await request.post("/auth/login").send({
        email: "itemuser@example.com",
        password: "12345"
    });
    token = loginRes.body.token;

    const orderRes = await request
        .post("/orders")
        .set("Authorization", `Bearer ${token}`)
        .send({ user_id: userId });
    orderId = orderRes.body.id;
});

afterAll(async () => {
    await closeDatabase();
});

describe("Order Items API", () => {
    test("Создание позиции заказа", async () => {
        const res = await request
            .post("/order_items")
            .set("Authorization", `Bearer ${token}`)
            .send({ order_id: orderId, product_name: "Product 1", quantity: 2, price: 50 });
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("id");
        itemId = res.body.id;
    });

    test("Получение всех позиций заказа", async () => {
        const res = await request.get(`/order_items?order_id=${orderId}`).set("Authorization", `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test("Получение позиции по ID", async () => {
        const res = await request.get(`/order_items/${itemId}`).set("Authorization", `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty("id", itemId);
    });

    test("Удаление позиции заказа", async () => {
        const res = await request.delete(`/order_items/${itemId}`).set("Authorization", `Bearer ${token}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.message).toMatch(/удалена/i);
    });
});
