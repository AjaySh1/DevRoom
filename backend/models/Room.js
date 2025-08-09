import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  code: { type: String, default: "// start code here" },
  activeUsers: [{ name: String, socketId: String }],
  maxUsers: { type: Number, default: 50 }
});

export default mongoose.model("Room", roomSchema);