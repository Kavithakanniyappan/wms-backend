import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
user_id:{type:String},
  name: { type: String },
  email: { type: String, unique: true },
  password: { type: String },
  is_deleted: { type: Boolean, default: false }
});

const User = mongoose.model("User", userSchema);

export default User;