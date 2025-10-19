import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export default function auth(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.status(401).json({ message: "Токен не найден" });

    jwt.verify(token, process.env.JWT_SECRET || "supersecretkey", (err, user) => {
        if (err) return res.status(403).json({ message: "Недействительный токен" });
        req.user = user;
        next();
    });
}