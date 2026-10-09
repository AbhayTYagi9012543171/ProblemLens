import User from "../models/User.js";

export async function updateProfile(req, res, next) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success:false, message:"User not found" });

    const name = req.body?.name !== undefined ? String(req.body.name).trim() : user.name;
    const email = req.body?.email !== undefined ? String(req.body.email).trim().toLowerCase() : user.email;
    if (name.length < 2) return res.status(400).json({ success:false, message:"Name must contain at least 2 characters." });
    if (!email) return res.status(400).json({ success:false, message:"Email is required." });

    const duplicate = await User.findOne({ email, _id: { $ne: user._id } });
    if (duplicate) return res.status(409).json({ success:false, message:"Email already registered." });

    user.name = name;
    user.email = email;
    if (req.body?.avatar !== undefined) user.avatar = String(req.body.avatar || "").trim();
    if (req.body?.organization !== undefined) user.organization = String(req.body.organization || "").trim();
    if (req.body?.location !== undefined) user.location = String(req.body.location || "").trim();
    if (req.body?.bio !== undefined) user.bio = String(req.body.bio || "").trim();
    await user.save();

    const safe = user.toObject();
    delete safe.password;
    return res.json({ success:true, data:safe, message:"Profile updated successfully." });
  } catch (error) { next(error); }
}
