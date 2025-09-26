import { Router } from "express";
import pool from "../db.js";

const router = Router();


router.post("/", async (req, res) => {
    const { user_id, status, total_amount } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO orders (user_id, status, total_amount) VALUES ($1, $2, $3) RETURNING *",
            [user_id, status || "new", total_amount || 0.00]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при создании заказа" });
    }
});


router.get("/", async (req, res) => {
    const { user_id } = req.query;
    try {
        let result;
        if (user_id) {
            result = await pool.query(
                "SELECT * FROM orders WHERE user_id = $1 ORDER BY order_date DESC",
                [user_id]
            );
        } else {
            result = await pool.query("SELECT * FROM orders ORDER BY order_date DESC");
        }
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при получении заказов" });
    }
});


router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query("SELECT * FROM orders WHERE id = $1", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Заказ не найден" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при получении заказа" });
    }
});


router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query("DELETE FROM orders WHERE id = $1 RETURNING *", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Заказ не найден" });
        }
        res.json({ message: "Заказ удалён", order: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при удалении заказа" });
    }
});

export default router;
