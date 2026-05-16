import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({

  title: { type: String, required: true, index: true },
  description: String,
  sku: { type: String, required: true, unique: true },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    index: true,
  },
  images: [{ url: String, alt: String }],
  color: [String],
  size: [String],
  price: { type: Number, required: true },
  compareAtPrice: Number,
  stock: { type: Number, required: true },
  brand: { type: String, index: true },
  tags: { type: [String], index: true },
  status: {
    type: String,
    enum: ["draft", "active"],
    default: "draft",
    index: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

}, { timestamps: true, versionKey: false }
);

const ProductModel = mongoose.model("Product", ProductSchema);
export default ProductModel;
