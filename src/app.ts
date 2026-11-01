import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import config from "./config/index.js";
import { AuthRoutes } from "./modules/Auth/auth.routes.js";
import { UserRoutes } from "./modules/user/user.route.js";
import { CategoryRoutes } from "./modules/Category/category.route.js";
import { GearRoutes } from "./modules/Gear/gear.route.js";
import { RentalRoutes } from "./modules/Rental/rental.route.js";
import { ReviewRoutes } from "./modules/Review/review.route.js";
import { PaymentRoutes } from "./modules/Payment/payment.route.js";
import { AnalyticsRoutes } from "./modules/Analytics/analytics.route.js";
import notFoundHandler from "./middleware/notFoundHandler.js";
import globalErrorHandler from "./middleware/globalErrorHandler.js";


const app: Application = express();

const allowedOrigins = [
  "http://localhost:3000",
  "https://gear-up-backend-fornt-end.vercel.app",
  ...(config.app_url
    ?.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean) ?? []),
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World!");
});

// app.post()
//app.use("/api/users", userRoutes);
app.use("/api/auth", AuthRoutes);
app.use("/api/users", UserRoutes);
app.use("/api/categories", CategoryRoutes);
app.use("/api/gears", GearRoutes);
app.use("/api/rentals", RentalRoutes);
app.use("/api/reviews", ReviewRoutes);
app.use("/api/payments", PaymentRoutes);
app.use("/api/analytics", AnalyticsRoutes);

app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
