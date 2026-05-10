import DeliveryCharge from "../models/deliveryCharge.js";

export const getAllCharges = async (req, res) => {
  try {
    const result = await DeliveryCharge.find().sort({ createdAt: -1 });
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getActiveCharges = async (req, res) => {
  try {
    const result = await DeliveryCharge.find({ isActive: true });
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const addCharge = async (req, res) => {
  try {
    const result = await DeliveryCharge.create(req.body);
    res.status(201).json({ success: true, charge: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateCharge = async (req, res) => {
  try {
    const result = await DeliveryCharge.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!result) return res.status(404).json({ success: false, message: "Not found" });
    res.status(200).json({ success: true, charge: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteCharge = async (req, res) => {
  try {
    const result = await DeliveryCharge.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ success: false, message: "Not found" });
    res.status(200).json({ success: true, message: "Deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
