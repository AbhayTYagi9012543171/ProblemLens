import mongoose from "mongoose";
const analysisSchema = new mongoose.Schema({
  project:{type:mongoose.Schema.Types.ObjectId,ref:"Project",required:true},
  type:{type:String,enum:["SUMMARY","KEYWORDS","SENTIMENT","CLUSTERS","PATTERNS","FULL"],default:"FULL"},
  inputEvidence:[{type:mongoose.Schema.Types.ObjectId,ref:"Evidence"}],
  result:mongoose.Schema.Types.Mixed,
  createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User"}
},{timestamps:true});
export default mongoose.model("Analysis",analysisSchema);
