import ProductModel from "../models/product.js";

export const AddProduct = async (req, res) => {
  const {
    title,
    description,
    sku,
    category,
    images,
    color = [],
    size = [],
    price,
    compareAtPrice,
    stock,
    brand,
    tags = [],
    status = "draft",
    createdBy,
  } = req.body;

  const product = {
    title,
    description,
    sku,
    category,
    images,
    color,
    size,
    price,
    compareAtPrice,
    stock,
    brand,
    tags,
    status,
    createdBy,
  };

  try {
    const result = await ProductModel.create(product);
    res.status(201).json({ success: true, product: result });
    console.log('New product added..!');
  } catch (err) {
    console.log('product add failed.', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const GetProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await ProductModel.findOne({ _id: id, status: "active" });
    if (!result) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.status(200).json(result);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const GetAllProducts = async (req, res) => {
  try {
    const AllProducts = await ProductModel.find({ status: "active" }).sort({ createdAt: -1 });
    res.status(200).json(AllProducts);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const DeleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await ProductModel.findOneAndDelete({ _id: id });
    if (!result) {
      return res.status(404).json({ success: false, message: "Product doesn't exist in Database." });
    }
    res.status(200).json({ success: true, message: "Product deleted" });
    console.log('One Product has been deleted');
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const UpdateProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedProduct = await ProductModel.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    console.log('Product updated successfully.');
    res.status(200).json({ success: true, product: updatedProduct });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
