import mongoose from "mongoose";
const projectSchema = new mongoose.Schema({
  name:{type:String,required:true,trim:true},
  description:String,
  category:{type:String,trim:true,default:"General"},
  status:{type:String,enum:["DRAFT","ACTIVE","ARCHIVED"],default:"DRAFT"},
  owner:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
  members:[{type:mongoose.Schema.Types.ObjectId,ref:"User"}],
  tags:[String],
  startDate:Date,
  endDate:Date,
  opportunityScore:{type:Number,min:0,max:100,default:0},
  isArchived:{type:Boolean,default:false}
},{timestamps:true});
export default mongoose.model("Project",projectSchema);
