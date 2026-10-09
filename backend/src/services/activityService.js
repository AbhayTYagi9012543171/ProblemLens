import ActivityLog from "../models/ActivityLog.js";
export const logActivity=(data)=>ActivityLog.create(data);
