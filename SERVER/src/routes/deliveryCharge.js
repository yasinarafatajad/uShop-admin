import express from "express";
import { getAllCharges, getActiveCharges, addCharge, updateCharge, deleteCharge } from "../controllers/deliveryCharge.js";

const router = express.Router();

router.get("/deliveryCharges", getAllCharges);
router.get("/deliveryCharges/active", getActiveCharges);
router.post("/deliveryCharge", addCharge);
router.put("/deliveryCharge/:id", updateCharge);
router.delete("/deliveryCharge/:id", deleteCharge);

export default router;
