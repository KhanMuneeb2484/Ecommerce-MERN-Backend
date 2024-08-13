import mongoose from "mongoose";
const Schema=mongoose.Schema;

const productSchema=new Schema({
    name:{
        type: String,
        require: true,
    },
    pictures: [{
        type: String,
        required: true,
    }],
    description:{
        type:String,
        require: true,
    },
    stock:{
        type:Number,
        require: true,
    },
    price:{
        type:Number,
        require: true,
    },
    categories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
      }],
},{timestamps:true})
export default mongoose.model('productData',productSchema);