import { Router } from "express";
import pool from "../db.js";
import auth from "../middleware/auth.js";

const router = Router();

/**
 * @openapi
 * tags:
 *   name: Orders
 *   description: Управление заказами
 */

/**
 * @openapi
 * /orders:
 *   post:
 *     summary: Создать новый заказ
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [user_id]
 *             properties:
 *               user_id:
 *                 type: integer
 *                 example: 1
 *               status:
 *                 type: string
 *                 example: new
 *               total_amount:
 *                 type: number
 *                 format: float
 *                 example: 1500.50
 *     responses:
 *       200:
 *         description: Заказ успешно создан
 *       500:
 *         description: Ошибка при создании заказа
 */
router.post("/", auth, async (req, res) => {
    const { user_id, status, total_amount } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO orders (user_id, status, total_amount) VALUES ($1, $2, $3) RETURNING *",
            [user_id, status || "new", total_amount || 0.0]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при создании заказа" });
    }
});

/**
 * @openapi
 * /orders:
 *   get:
 *     summary: Получить список заказов (опционально по user_id)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: user_id
 *         in: query
 *         schema:
 *           type: integer
 *         description: ID пользователя
 *     responses:
 *       200:
 *         description: Список заказов
 *       500:
 *         description: Ошибка при получении заказов
 */
router.get("/", auth, async (req, res) => {
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

/**
 * @openapi
 * /orders/{id}:
 *   get:
 *     summary: Получить заказ по ID
 *     tags: [Orders]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID заказа
 *     responses:
 *       200:
 *         description: Данные заказа
 *       404:
 *         description: Заказ не найден
 *       500:
 *         description: Ошибка при получении заказа
 */
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

/**
 * @openapi
 * /orders/{id}:
 *   delete:
 *     summary: Удалить заказ по ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Заказ успешно удалён
 *       404:
 *         description: Заказ не найден
 *       500:
 *         description: Ошибка при удалении заказа
 */
router.delete("/:id", auth, async (req, res) => {
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
