import { Router } from "express";
import { AnalyticsController } from "./analytics.controller.js";
import { auth } from "../../middleware/auth.js";
import { UserRole } from "../../../generated/prisma/enums.js";

const router = Router();

// Get Admin Dashboard Overview Analytics
router.get("/meta", auth(UserRole.ADMIN), AnalyticsController.getMetaData);

export const AnalyticsRoutes = router;
