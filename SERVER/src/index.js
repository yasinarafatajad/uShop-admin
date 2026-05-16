import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./config/db.js";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";
import customerRoutes from "./routes/customer.js";
import statsRoutes from "./routes/stats.js";
import uploadRoutes from "./routes/upload.js";
import deliveryChargeRoutes from "./routes/deliveryCharge.js";
import couponRoutes from "./routes/coupon.js";
import authRoutes from "./routes/auth.js";

const port = process.env.PORT || 7000;
const app = express();

// conneect to database
connectDB();

// middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// all end points
app.use("/api/v1", statsRoutes);
app.use("/api/v1", productRoutes);
app.use("/api/v1", orderRoutes);
app.use("/api/v1", customerRoutes);
app.use("/api/v1", uploadRoutes);
app.use("/api/v1", deliveryChargeRoutes);
app.use("/api/v1", couponRoutes);
// all auth routes
app.use("/api/v1", authRoutes);

// test route
app.get("/", (req, res) => {
  res.status(200).send("server is running.");
});

// listen to port
app.listen(port, () => {
  console.log(`server running at ${port}`);
});

// when server running it will show a message in terminal: 'server running at ****'
// when mongodb is connected it will show a message in terminal: 'MongoDb Connected at [dbName]'