import { Router } from "express";
import pool from "../db.js";

const router = Router();

/**
 * @openapi
 * tags:
 *   name: Users
 *   description: Управление пользователями
 */

/**
 * @openapi
 * /users:
 *   post:
 *     summary: Создать нового пользователя
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, phone]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Иван Иванов
 *               email:
 *                 type: string
 *                 example: ivan@example.com
 *               phone:
 *                 type: string
 *                 example: "+79998887766"
 *     responses:
 *       200:
 *         description: Пользователь успешно создан
 *       400:
 *         description: Пользователь с таким email уже существует
 *       500:
 *         description: Ошибка при создании пользователя
 */
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
            return res
                .status(400)
                .json({ error: "Пользователь с таким email уже существует" });
        }
        res.status(500).json({ error: "Ошибка при создании пользователя" });
    }
});

/**
 * @openapi
 * /users:
 *   get:
 *     summary: Получить список всех пользователей
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Успешный ответ со списком пользователей
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: Иван Иванов
 *                   email:
 *                     type: string
 *                     example: ivan@example.com
 *                   phone:
 *                     type: string
 *                     example: "+79998887766"
 *       500:
 *         description: Ошибка при получении пользователей
 */
router.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM users ORDER BY id");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при получении пользователей" });
    }
});

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     summary: Получить пользователя по ID
 *     tags: [Users]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID пользователя
 *     responses:
 *       200:
 *         description: Данные пользователя
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: Иван Иванов
 *                 email:
 *                   type: string
 *                   example: ivan@example.com
 *                 phone:
 *                   type: string
 *                   example: "+79998887766"
 *       404:
 *         description: Пользователь не найден
 *       500:
 *         description: Ошибка при получении пользователя
 */
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

/**
 * @openapi
 * /users/{id}:
 *   delete:
 *     summary: Удалить пользователя по ID
 *     tags: [Users]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID пользователя
 *     responses:
 *       200:
 *         description: Пользователь успешно удалён
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Пользователь удалён
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: Иван Иванов
 *       404:
 *         description: Пользователь не найден
 *       500:
 *         description: Ошибка при удалении пользователя
 */
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            "DELETE FROM users WHERE id = $1 RETURNING *",
            [id]
        );
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
