import { Router } from "express";
import pool from "../db.js";

const router = Router();


router.post("/", async (req, res) => {
    const { name, email, phone } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO users (name, email, phone) VALUES ($1, $2, $3) RETURNING *",
            [name, email, phone]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        
        if (err.code === "23505") {
            return res.status(400).json({ error: "Пользователь с таким email уже существует" });
        }
        res.status(500).json({ error: "Ошибка при создании пользователя" });
    }
});


router.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM users ORDER BY id");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при получении пользователей" });
    }
});


router.get("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Пользователь не найден" });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при получении пользователя" });
    }
});


router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING *", [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Пользователь не найден" });
        }
        res.json({ message: "Пользователь удалён", user: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при удалении пользователя" });
    }
});

export default router;
