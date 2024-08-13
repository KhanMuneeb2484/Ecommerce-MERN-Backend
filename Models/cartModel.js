import mongoose from "mongoose";
const Schema = mongoose.Schema;

const CartItemSchema = new Schema({
  productId: { 
    type: Schema.Types.ObjectId,
    ref: 'productData', 
    required: true 
},
  quantity: { 
    type: Number, 
    required: true 
},
  price: { 
    type: Number, 
    required: true 
},
  totalPrice: { 
    type: Number, 
    required: true 
}
});

const CartSchema = new Schema({
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'userData', 
    required: true 
},
  items: [CartItemSchema],
  totalCartPrice: { 
    type: Number, 
    required: true, 
    default: 0 }
});

export default mongoose.model('cartData',CartSchema);