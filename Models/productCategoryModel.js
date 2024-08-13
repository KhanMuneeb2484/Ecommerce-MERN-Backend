import mongoose from "mongoose";
const Schema = mongoose.Schema;

const categorySchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
  parentCategory:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  },
}, { timestamps: true });

export default mongoose.model('Category', categorySchema);
