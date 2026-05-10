import Coupon from "../models/coupon.js";

export const getAllCoupons = async (req, res) => {
  try {
    const result = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const addCoupon = async (req, res) => {
  try {
    const result = await Coupon.create(req.body);
    res.status(201).json({ success: true, coupon: result });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ success: false, message: "Coupon code already exists" });
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateCoupon = async (req, res) => {
  try {
    const result = await Coupon.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!result) return res.status(404).json({ success: false, message: "Coupon not found" });
    res.status(200).json({ success: true, coupon: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    const result = await Coupon.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ success: false, message: "Coupon not found" });
    res.status(200).json({ success: true, message: "Deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const applyCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) return res.status(404).json({ success: false, message: "Invalid coupon code" });
    if (coupon.expiresAt && new Date() > coupon.expiresAt) return res.status(400).json({ success: false, message: "Coupon expired" });
    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) return res.status(400).json({ success: false, message: "Coupon usage limit reached" });
    if (orderAmount < coupon.minOrderAmount) return res.status(400).json({ success: false, message: `Minimum order ৳${coupon.minOrderAmount} required` });

    let discount = 0;
    if (coupon.discountType === "percentage") {
      discount = (orderAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscount > 0) discount = Math.min(discount, coupon.maxDiscount);
    } else {
      discount = coupon.discountValue;
    }

    res.status(200).json({ success: true, discount: Math.round(discount), coupon });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
