import mongoose from "mongoose";
import Cart from "../Models/cartModel.js";
import Checkout from "../Models/checkoutModel.js";
import Product from "../Models/productModel.js"; // Import the Product model
import agenda from "../config/agenda.js";
import stripe from "../config/stripe.js";
import transporter from "../config/nodeMailer.js";
import User from "../Models/userModel.js";

const createCheckout = async (req, res) => {
  const { paymentMethod } = req.body;

  if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
    return res.status(404).json({ message: "Invalid user ID" });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Fetch cart details
    const cart = await Cart.findOne({ userId: req.user.id }).populate(
      "items.productId"
    );

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    // Check stock availability for all items
    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      if (!product || product.stock < item.quantity) {
        return res.status(400).json({
          error: `Insufficient stock for product: ${
            product ? product.name : item.productId
          }`,
        });
      }
    }

    // Deduct stock for all items
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }

    // Calculate total amount in cents
    const totalAmount = Math.round(cart.totalCartPrice * 100);

    // Create a Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: "usd",
    });

    // Create a checkout record
    const checkout = new Checkout({
      userId: req.user.id,
      finalCartItems: cart.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        totalPrice: item.totalPrice,
      })),
      paymentMethod,
      totalPrice: cart.totalCartPrice,
      status: "Pending", // Default status when creating a checkout
      paymentIntentId: paymentIntent.id, // Store the payment intent ID
    });

    await checkout.save();

    // Empty the user's cart
    cart.items = [];
    cart.totalCartPrice = 0;
    await cart.save();

    // Schedule a job to update the status to 'Processing' after 30 minutes
    const jobName = "update checkout status to processing";
    await agenda.schedule("in 30 minutes", jobName, {
      checkoutId: checkout._id,
    });

    // Return the client secret to the frontend
    res.status(201).json({
      clientSecret: paymentIntent.client_secret,
    });

    // Listen for the payment to be confirmed
    stripe.paymentIntents.retrieve(
      paymentIntent.id,
      async (err, paymentIntent) => {
        if (paymentIntent.status === "succeeded") {
          // Send confirmation email
          await sendOrderConfirmationEmail(user.email, checkout._id);
        }
      }
    );
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Optionally, add a method to update the status of a checkout
const updateCheckoutStatus = async (req, res) => {
  const { checkoutId } = req.params;
  const { status } = req.body;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(checkoutId)) {
    return res.status(404).json({ message: "Invalid id" });
  }

  try {
    // Ensure the status is valid
    if (!["Pending", "Processing", "Completed", "Cancelled"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    // Update the checkout status
    const checkout = await Checkout.findByIdAndUpdate(
      checkoutId,
      { status },
      { new: true } // Return the updated document
    );

    if (!checkout) {
      return res.status(404).json({ error: "Checkout not found" });
    }

    res.status(200).json(checkout);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getAllCheckouts = async (req, res) => {
  try {
    const checkouts = await Checkout.find({})
      .populate({
        path: "userId",
        select: "name email phone address", // Select fields to exclude sensitive information
      })
      .sort({ createdAt: -1 });

    res.status(200).json(checkouts);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get a specific checkout by ID
const getCheckout = async (req, res) => {
  const checkoutId = req.params.checkoutId;
  if (!mongoose.Types.ObjectId.isValid(checkoutId)) {
    return res.status(400).json({ error: "Invalid checkout ID" });
  }

  try {
    const checkout = await Checkout.findById(checkoutId).populate({
      path: "userId",
      select: "name email phone address", // Select fields to exclude sensitive information
    });

    if (!checkout) {
      return res.status(404).json({ error: "Checkout not found" });
    }

    res.status(200).json(checkout);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Function to send the order confirmation email
// Function to send the order confirmation email
const sendOrderConfirmationEmail = async (email, orderId) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL, // Use a valid "from" address format
      to: email,
      subject: "Order Confirmation",
      text: `Thank you for your order! Your order ID is ${orderId}.`,
      html: `<p>Thank you for your order! Your order ID is <strong>${orderId}</strong>.</p>`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Order confirmation email sent to ${email}`);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

export { createCheckout, updateCheckoutStatus, getCheckout, getAllCheckouts };
