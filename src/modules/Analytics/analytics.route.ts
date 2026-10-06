import { Router } from "express";
import { AnalyticsController } from "./analytics.controller";
import { auth } from "../../middleware/auth";
import { UserRole } from "../../../generated/prisma/enums";

const router = Router();

// Get Admin Dashboard Overview Analytics
router.get("/meta", auth(UserRole.ADMIN), AnalyticsController.getMetaData);

export const AnalyticsRoutes = router;
