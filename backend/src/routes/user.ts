import { Router } from "express";
import { firebaseAuth } from "../middlewares/firebaseAuth";
import { getAllRooms } from "../controllers/user";

const router = Router();

router.get("/rooms", firebaseAuth, getAllRooms);

export default router;