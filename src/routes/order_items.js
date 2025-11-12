import { Router } from "express";
import pool from "../db.js";
import auth from "../middleware/auth.js";

const router = Router();

/**
 * @openapi
 * tags:
 *   name: Order Items
 *   description: Управление позициями заказов
 */

/**
 * @openapi
 * /order_items:
 *   post:
 *     summary: Добавить позицию в заказ
 *     tags: [Order Items]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [order_id, product_name]
 *             properties:
 *               order_id:
 *                 type: integer
 *                 example: 1
 *               product_name:
 *                 type: string
 *                 example: Наушники
 *               quantity:
 *                 type: integer
 *                 example: 2
 *               price:
 *                 type: number
 *                 format: float
 *                 example: 499.99
 *     responses:
 *       200:
 *         description: Позиция заказа успешно добавлена
 *       500:
 *         description: Ошибка при создании позиции заказа
 */
router.post("/", auth, async (req, res) => {
    const { order_id, product_name, quantity, price } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO order_items (order_id, product_name, quantity, price) VALUES ($1, $2, $3, $4) RETURNING *",
            [order_id, product_name, quantity || 1, price || 0.0]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при создании позиции заказа" });
    }
});

/**
 * @openapi
 * /order_items:
 *   get:
 *     summary: Получить список позиций (опционально по order_id)
 *     tags: [Order Items]
 *     parameters:
 *       - name: order_id
 *         in: query
 *         schema:
 *           type: integer
 *         description: ID заказа
 *     responses:
 *       200:
 *         description: Список позиций заказа
 *       500:
 *         description: Ошибка при получении позиций
 */
router.get("/", async (req, res) => {
    const { order_id } = req.query;
    try {
        let result;
        if (order_id) {
            result = await pool.query("SELECT * FROM order_items WHERE order_id = $1 ORDER BY id", [order_id]);
        } else {
            result = await pool.query("SELECT * FROM order_items ORDER BY id");
        }
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка при получении позиций заказа" });
    }
});

/**
 * @openapi
 * /order_items/{id}:
 *   get:
 *     summary: Получить позицию заказа по ID
 *     tags: [Order Items]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Данные позиции заказа
 *       404:
 *         description: Позиция не найдена
 *       500:
 *         description: Ошибка при получении позиции заказа
 */
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

/**
 * @openapi
 * /order_items/{id}:
 *   delete:
 *     summary: Удалить позицию заказа по ID
 *     tags: [Order Items]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Позиция заказа удалена
 *       404:
 *         description: Позиция не найдена
 *       500:
 *         description: Ошибка при удалении позиции
 */
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
