import express from "express";
import { getAllCoupons, addCoupon, updateCoupon, deleteCoupon, applyCoupon } from "../controllers/coupon.js";

const router = express.Router();

router.get("/coupons", getAllCoupons);
router.post("/coupon", addCoupon);
router.put("/coupon/:id", updateCoupon);
router.delete("/coupon/:id", deleteCoupon);
router.post("/coupon/apply", applyCoupon);

export default router;
