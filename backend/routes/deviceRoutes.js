// backend/routes/deviceRoutes.js
import express from "express";
import { listDevices, removeDevice } from "../controllers/deviceController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(authMiddleware);

router.get("/", listDevices);
router.delete("/:deviceId", removeDevice);

export default router;
