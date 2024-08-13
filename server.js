import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import checkoutRoutes from "./routes/checkoutRoutes.js";
import productCategoryRoutes from "./routes/productCategoryRoutes.js";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import agenda from "./config/agenda.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(morgan("dev"));

app.use(express.json());

// Set EJS as the view engine
app.set("view engine", "ejs");

// Set the views directory
app.set("views", path.join(__dirname, "frontend/views"));

// Serve static files from the "uploads" and "frontend/views" directories
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "frontend/views")));

app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

// Route to render the checkout page using EJS
app.get("/checkout", (req, res) => {
  const stripePublishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
  res.render("checkout", { stripePublishableKey });
});

app.use("/", userRoutes);
app.use("/", productRoutes);
app.use("/", cartRoutes);
app.use("/", checkoutRoutes);
app.use("/", productCategoryRoutes);

mongoose
  .connect(process.env.URI)
  .then(async () => {
    app.listen(process.env.PORT, () => {
      console.log(
        `Connected to DB and server is running on port ${process.env.PORT}`
      );
    });

    // Start the agenda instance
    await agenda.start();
    console.log("Agenda started");
  })
  .catch((error) => {
    console.log(error);
  });

process.on("SIGTERM", async () => {
  console.log("SIGTERM signal received: closing server");
  await agenda.stop();
  console.log("Agenda stopped");
  mongoose.connection.close(false, () => {
    console.log("MongoDB connection closed");
    process.exit(0);
  });
});
