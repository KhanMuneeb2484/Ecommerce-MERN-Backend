import mongoose from "mongoose";
const Schema = mongoose.Schema;

// Define the Checkout schema
const checkoutSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "userData", required: true },
  finalCartItems: [
    {
      productId: {
        type: Schema.Types.ObjectId,
        ref: "productData",
        required: true,
      },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      totalPrice: { type: Number, required: true },
    },
  ],
  paymentMethod: {
    type: String,
    enum: ["Credit Card", "PayPal", "Bank Transfer"],
    required: true,
  },
  totalPrice: { type: Number, required: true },
  status: {
    type: String,
    enum: ["Pending", "Processing", "Completed", "Cancelled"],
    default: "Pending",
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Checkout", checkoutSchema);
