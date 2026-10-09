import mongoose from "mongoose";
const reportSchema = new mongoose.Schema({
  project:{type:mongoose.Schema.Types.ObjectId,ref:"Project",required:true},
  title:{type:String,required:true},
  format:{type:String,enum:["JSON","CSV","HTML"],default:"JSON"},
  content:mongoose.Schema.Types.Mixed,
  createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User"}
},{timestamps:true});
export default mongoose.model("Report",reportSchema);
