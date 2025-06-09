import { Router } from "express";
import { firebaseAuth } from "../middlewares/firebaseAuth";
import { saveUser, deleteUser, getCurrUserProfile } from "../controllers/auth";

const router = Router();

router.get("/profile", firebaseAuth, getCurrUserProfile);
router.post("/", firebaseAuth, saveUser);
router.delete("/", firebaseAuth, deleteUser);


export default router;