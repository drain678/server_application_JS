import dotenv from "dotenv";
import { Router } from "express";
import pool from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

dotenv.config();

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

router.post("/register", async (req, res) => {
    const { name, email, password, phone } = req.body;

    if (!email || !password || !name) {
        return res.status(400).json({ error: "Имя, email и пароль обязательны" });
    }

    try {
        const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: "Пользователь с таким email уже существует" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            `INSERT INTO users (name, email, password, phone)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, phone, created_at`,
            [name, email, hashedPassword, phone]
        );

        const user = result.rows[0];
        res.status(201).json({ message: "Пользователь создан", user });
    } catch (err) {
        console.error("Ошибка при регистрации:", err);
        res.status(500).json({ error: "Ошибка сервера при регистрации" });
    }
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email и пароль обязательны" });
    }

    try {
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ error: "Неверный email или пароль" });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: "Неверный email или пароль" });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name },
            JWT_SECRET,
            { expiresIn: "2h" }
        );

        res.json({ message: "Успешный вход", token });
    } catch (err) {
        console.error("Ошибка при входе:", err);
        res.status(500).json({ error: "Ошибка сервера при входе" });
    }
});

router.get("/profile", async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: "Нет токена" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const result = await pool.query(
            "SELECT id, name, email, phone, created_at FROM users WHERE id = $1",
            [decoded.id]
        );
        const user = result.rows[0];
        if (!user) {
            return res.status(404).json({ error: "Пользователь не найден" });
        }

        res.json(user);
    } catch (err) {
        console.error("Ошибка валидации токена:", err);
        res.status(401).json({ error: "Неверный или просроченный токен" });
    }
});

export default router;
