import { Router } from "express";
import pool from "../db.js";
import auth from "../middleware/auth.js";

const router = Router();


router.post("/", auth, async (req, res) => {
    const { order_id, product_name, quantity, price } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO order_items (order_id, product_name, quantity, price) VALUES ($1, $2, $3, $4) RETURNING *",
            [order_id, product_name, quantity || 1, price || 0.00]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при создании позиции заказа" });
    }
});


router.get("/", async (req, res) => {
    const { order_id } = req.query;
    try {
        let result;
        if (order_id) {
            result = await pool.query(
                "SELECT * FROM order_items WHERE order_id = $1 ORDER BY id",
                [order_id]
            );
        } else {
            result = await pool.query("SELECT * FROM order_items ORDER BY id");
        }
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при получении позиций заказа" });
    }
});


router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query("SELECT * FROM order_items WHERE id = $1", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Позиция заказа не найдена" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при получении позиции заказа" });
    }
});


router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query("DELETE FROM order_items WHERE id = $1 RETURNING *", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Позиция заказа не найдена" });
        }
        res.json({ message: "Позиция заказа удалена", item: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при удалении позиции заказа" });
    }
});

export default router;
