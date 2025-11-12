import supertest from "supertest";
import app from "../server.js";
import pool from "../db.js";

export const request = supertest(app);

export const clearDatabase = async () => {
    await pool.query("DELETE FROM order_items");
    await pool.query("DELETE FROM orders");
    await pool.query("DELETE FROM users");
    await pool.query("ALTER SEQUENCE users_id_seq RESTART WITH 1");
    await pool.query("ALTER SEQUENCE orders_id_seq RESTART WITH 1");
    await pool.query("ALTER SEQUENCE order_items_id_seq RESTART WITH 1");
};

export const closeDatabase = async () => {
    await pool.end();
};
