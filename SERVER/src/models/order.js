import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name: String,
    image: String,
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    size: String,
    color: String
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    items: { type: [orderItemSchema], required: true },

    shippingAddress: {
      fullName: String,
      phone: String,
      address: String,
      city: String,
      country: { type: String, default: "Bangladesh" }
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "Bkash", "Nagad", "Card"],
      required: true
    },

    itemsPrice: Number,
    shippingPrice: Number,
    discountPrice: Number,
    totalPrice: Number,
    couponCode: String,

    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending"
    },

    isPaid: { type: Boolean, default: false }
  },
  { timestamps: true , versionKey: false}
);

export default mongoose.model("Order", orderSchema);
