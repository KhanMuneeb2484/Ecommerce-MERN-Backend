import mongoose from "mongoose";
import Cart from "../Models/cartModel.js";
import Product from "../Models/productModel.js";

const getCartByUserId = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  try {
    const cart = await Cart.findOne({ userId: req.user.id }).populate(
      "items.productId"
    );

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    res.status(200).json(cart);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const addItemToCart = async (req, res) => {
  const { productId, quantity } = req.body;

  if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
    return res.status(404).json({ message: "Invalid user ID" });
  }

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const price = product.price;

    let cart = await Cart.findOne({ userId: req.user.id });

    if (cart) {
      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
      );

      if (itemIndex > -1) {
        let item = cart.items[itemIndex];

        if (item.quantity + quantity > product.stock) {
          return res.status(400).json({
            error: `Insufficient stock available. Current stock: ${
              product.stock
            }, requested: ${item.quantity + quantity}`,
          });
        }

        item.quantity += quantity;
        item.totalPrice = item.quantity * item.price;
        cart.items[itemIndex] = item;
      } else {
        if (quantity > product.stock) {
          return res.status(400).json({
            error: `Insufficient stock available. Current stock: ${product.stock}, requested: ${quantity}`,
          });
        }

        cart.items.push({
          productId,
          quantity,
          price,
          totalPrice: quantity * price,
        });
      }

      cart.totalCartPrice = cart.items.reduce(
        (total, item) => total + item.totalPrice,
        0
      );
    } else {
      if (quantity > product.stock) {
        return res.status(400).json({
          error: `Insufficient stock available. Current stock: ${product.stock}, requested: ${quantity}`,
        });
      }

      cart = new Cart({
        userId: req.user.id,
        items: [{ productId, quantity, price, totalPrice: quantity * price }],
        totalCartPrice: quantity * price,
      });
    }

    await cart.save();
    res.status(201).json(cart);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

const removeItemFromCart = async (req, res) => {
  const productId = req.params.productId;

  if (!mongoose.Types.ObjectId.isValid(req.user.id))
    return res.status(404).json({ message: "Invalid id" });

  try {
    let cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex > -1) {
      cart.items.splice(itemIndex, 1);

      cart.totalCartPrice = cart.items.reduce(
        (total, item) => total + item.totalPrice,
        0
      );
      await cart.save();
      res.status(200).json(cart);
    } else {
      res.status(404).json({ error: "Item not found in cart" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateCart = async (req, res) => {
  const { productId, quantity } = req.body;

  if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
    return res.status(404).json({ message: "Invalid user ID" });
  }

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const price = product.price;

    let cart = await Cart.findOne({ userId: req.user.id });

    if (cart) {
      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
      );

      if (itemIndex > -1) {
        let item = cart.items[itemIndex];

        if (quantity === 0) {
          cart.items.splice(itemIndex, 1);
        } else {
          if (quantity > product.stock) {
            return res.status(400).json({
              error: `Insufficient stock available. Current stock: ${product.stock}, requested: ${quantity}`,
            });
          }

          item.quantity = quantity;
          item.totalPrice = item.quantity * item.price;
          cart.items[itemIndex] = item;
        }
      } else {
        if (quantity <= 0) {
          return res.status(400).json({
            error: "Cannot update item not in cart with non-positive quantity",
          });
        }

        if (quantity > product.stock) {
          return res.status(400).json({
            error: `Insufficient stock available. Current stock: ${product.stock}, requested: ${quantity}`,
          });
        }

        cart.items.push({
          productId,
          quantity,
          price,
          totalPrice: quantity * price,
        });
      }

      cart.totalCartPrice = cart.items.reduce(
        (total, item) => total + item.totalPrice,
        0
      );
    } else {
      if (quantity > product.stock) {
        return res.status(400).json({
          error: `Insufficient stock available. Current stock: ${product.stock}, requested: ${quantity}`,
        });
      }

      if (quantity > 0) {
        cart = new Cart({
          userId: req.user.id,
          items: [{ productId, quantity, price, totalPrice: quantity * price }],
          totalCartPrice: quantity * price,
        });
      } else {
        return res
          .status(400)
          .json({ error: "Cannot create cart with non-positive quantity" });
      }
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

const getAllCarts = async (req, res) => {
  try {
    const carts = await Cart.find()
      .populate("items.productId")
      .sort({ createdAt: -1 });
    res.status(200).json(carts);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export {
  getCartByUserId,
  addItemToCart,
  removeItemFromCart,
  updateCart,
  getAllCarts,
};
