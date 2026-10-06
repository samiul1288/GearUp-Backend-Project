import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import config from "./config";
import { AuthRoutes } from "./modules/Auth/auth.routes";
import { UserRoutes } from "./modules/user/user.route";
import { CategoryRoutes } from "./modules/Category/category.route";
import { GearRoutes } from "./modules/Gear/gear.route";
import { RentalRoutes } from "./modules/Rental/rental.route";
import { ReviewRoutes } from "./modules/Review/review.route";
import { PaymentRoutes } from "./modules/Payment/payment.route";
import { AnalyticsRoutes } from "./modules/Analytics/analytics.route";


const app: Application = express();

app.use(
  cors({
    origin: config.app_url,
    credentials: true,
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


export default app;
