import productData from "../Models/productModel.js";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Convert import.meta.url to a file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getProducts = async (req, res) => {
  try {
    const products = await productData.find({}).sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getProduct = async (req, res) => {
  const id = req.params.productId;
  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).json({ message: "Invalid id" });
  try {
    const product = await productData.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const { name, description, stock, price, categories } = req.body;
    const pictures = req.files.map((file) => file.path);
    const product = await productData.create({
      name,
      description,
      stock,
      price,
      pictures,
      categories,
    });
    res.status(200).json(product);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateProduct = async (req, res) => {
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(404).json({ message: "Invalid id" });
  }

  try {
    const existingProduct = await productData.findById(productId);
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    let updatedPictures = [];
    if (req.files && req.files.length > 0) {
      updatedPictures = req.files.map((file) => file.path);
    }

    const updateFields = {
      ...req.body,
    };

    if (updatedPictures.length > 0) {
      deleteImageFiles(existingProduct.pictures);
      updateFields.pictures = updatedPictures;
    }

    const updatedProduct = await productData.findByIdAndUpdate(
      productId,
      updateFields,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error });
  }
};

const deleteImageFiles = (imagePaths) => {
  imagePaths.forEach((filePath) => {
    // Construct the full path to the image file
    const fullPath = path.join(__dirname, "..", filePath);

    // Delete the file
    fs.unlink(fullPath, (err) => {
      if (err) {
        console.error(`Failed to delete image file: ${fullPath}`, err);
      } else {
        console.log(`Deleted image file: ${fullPath}`);
      }
    });
  });
};

const deleteProduct = async (req, res) => {
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(404).json({ message: "Invalid id" });
  }

  try {
    const product = await productData.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    deleteImageFiles(product.pictures);

    await productData.findByIdAndDelete(productId);
    res.status(200).json({ msg: "Product and its images deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getProducts, getProduct, createProduct, updateProduct, deleteProduct };
