import express from "express";
import dotenv from "dotenv";

import usersRouter from "./routes/users.js";
import ordersRouter from "./routes/orders.js";
import orderiRouter from "./routes/order_items.js";
import authRouter from "./routes/auth.js"

dotenv.config();
const app = express();

app.use(express.json());

app.use("/users", usersRouter);
app.use("/orders", ordersRouter);
app.use("/order_items", orderiRouter);
app.use('/auth', authRouter)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});