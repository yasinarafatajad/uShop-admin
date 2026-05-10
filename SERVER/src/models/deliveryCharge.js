import mongoose from "mongoose";

const deliveryChargeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    area: { type: String, trim: true },
    charge: { type: Number, required: true, default: 0 },
    minOrderForFree: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false }
);

export default mongoose.model("DeliveryCharge", deliveryChargeSchema);
