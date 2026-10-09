import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  name: { type:String, required:true, trim:true },
  email: { type:String, required:true, unique:true, lowercase:true, trim:true },
  password: { type:String, required:true, select:false },
  role: { type:String, enum:["ADMIN","RESEARCHER","VIEWER"], default:"RESEARCHER" },
  avatar: String,
  organization: { type:String, trim:true, default:"" },
  location: { type:String, trim:true, default:"" },
  bio: { type:String, trim:true, default:"", maxlength:1000 },
  isActive: { type:Boolean, default:true },
  preferences: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps:true });
export default mongoose.model("User", userSchema);
