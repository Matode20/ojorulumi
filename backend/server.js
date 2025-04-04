import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.route.js";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";
import path from "path";
import productRoutes from "./routes/productRoute.js";
import cartRoute from "./routes/cartRoute.js";
import paymentRoutes from "./routes/paymentRoute.js";
import analyticsRoutes from "./routes/analyticsRoute.js";
import createOrder from "./routes/orderRoutes.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

// Middleware to parse JSON bodies
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/order", createOrder);
app.use("/api/cart", cartRoute);
app.use("/api/payments", paymentRoutes);
app.use("/api/analytics", analyticsRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/build/index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`server is listening on port http://localhost:${PORT}`);

  connectDB();
});
