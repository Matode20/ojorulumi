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
import { fileURLToPath } from "url";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON bodies
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/order", createOrder);
app.use("/api/cart", cartRoute);
app.use("/api/payments", paymentRoutes);
app.use("/api/analytics", analyticsRoutes);

// Serve frontend - Updated path handling
if (process.env.NODE_ENV === "production") {
  // Ensure the dist directory exists
  const distPath = path.join(__dirname, "./dist");
  app.use(express.static(distPath));

  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
} else {
  app.get("/", (req, res) => res.send("API is running..."));
}

app.listen(PORT, () => {
  console.log(`server is listening on port http://localhost:${PORT}`);

  connectDB();
});
