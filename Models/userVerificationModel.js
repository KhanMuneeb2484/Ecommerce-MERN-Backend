import mongoose from "mongoose";

const verificationTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'userData'
  },
  token: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
    expires: 3600 // Token expires after 1 hour
  }
});

export default mongoose.model('userVerificationToken', verificationTokenSchema);

