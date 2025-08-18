import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import axios from "axios";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import User from "./models/User.js";
import Room from "./models/Room.js";
import { GoogleGenerativeAI } from "@google/generative-ai"; // Gemini API

dotenv.config();

const FRONTEND_URL = "https://dev-room-8sa2.vercel.app";
const LOCAL_URL = "http://localhost:5173";
const app = express();
app.use(express.json());
app.use(cors({
  origin: [FRONTEND_URL, LOCAL_URL],
  credentials: true
}));

mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/codeeditor", {
}).then(() => {
  console.log("MongoDB connected");
});

app.use("/api/auth", authRoutes);

// Gemini DevAi setup
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// DevAi chat route
app.post("/api/devai-chat", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt required" });
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    res.json({ response: text.trim() });
  } catch (error) {
    console.error("DevAi error:", error);
    res.status(500).json({ error: "DevAi failed to respond" });
  }
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [FRONTEND_URL, LOCAL_URL],
    methods: ["GET", "POST"],
    credentials: true
  },
});

io.on("connection", (socket) => {
  console.log("User Connected", socket.id);

  socket.on("join", async ({ roomId, userName, email }) => {
    if (!userName || typeof userName !== "string" || userName.trim() === "") {
      return;
    }
    socket.join(roomId);

    // Find or create room in DB
    let room = await Room.findOne({ roomId });
    if (!room) {
      room = await Room.create({
        roomId,
        name: roomId,
        code: "// start code here",
        activeUsers: [{ name: userName, socketId: socket.id }]
      });
    } else {
      await Room.updateOne(
        { roomId },
        { $pull: { activeUsers: { email } } }
      );

      await Room.updateOne(
        { roomId },
        { $push: { activeUsers: { name: userName, email, socketId: socket.id } } }
      );

      room = await Room.findOne({ roomId });
    }

    // Emit only names to frontend
    io.to(roomId).emit("userJoined", room.activeUsers.map(u => u.name));

    // Emit the latest code ONLY to the joining user
    socket.emit("codeUpdate", room.code || "// start code here");

    // Add room to user's rooms in DB
    if (email) {
      const user = await User.findOne({ email });
      if (user && !user.rooms.includes(roomId)) {
        user.rooms.push(roomId);
        await user.save();
      }
    }

    socket.data.roomId = roomId;
    socket.data.userName = userName;
  });

  socket.on("codeChange", async ({ roomId, code }) => {
    // Update code in DB
    await Room.findOneAndUpdate(
      { roomId },
      { code: code }
    );
    socket.to(roomId).emit("codeUpdate", code);
  });

  socket.on("leaveRoom", async () => {
    const roomId = socket.data.roomId;
    if (roomId) {
      const room = await Room.findOneAndUpdate(
        { roomId },
        { $pull: { activeUsers: { socketId: socket.id } } },
        { new: true }
      );
      if (room) {
        io.to(roomId).emit("userJoined", room.activeUsers.map(u => u.name));
      }
      socket.leave(roomId);
      socket.data.roomId = null;
      socket.data.userName = null;
      socket.emit("leftRoom"); // Confirmation to frontend
    }
  });

  socket.on("typing", ({ roomId, userName }) => {
    socket.to(roomId).emit("userTyping", userName);
  });

  socket.on("languageChange", ({ roomId, language }) => {
    io.to(roomId).emit("languageUpdate", language);
  });

  socket.on("compileCode", async ({ code, roomId, language, version, input }) => {
    try {
      const response = await axios.post(
        "https://emkc.org/api/v2/piston/execute",
        {
          language,
          version,
          files: [{ content: code }],
          stdin: input,
        }
      );
      io.to(roomId).emit("codeResponse", response.data);
    } catch (err) {
      io.to(roomId).emit("codeResponse", { run: { output: "Error: " + err.message } });
    }
  });

  socket.on("disconnect", async () => {
    const roomId = socket.data.roomId;
    if (roomId) {
      const room = await Room.findOneAndUpdate(
        { roomId },
        { $pull: { activeUsers: { socketId: socket.id } } },
        { new: true }
      );
      if (room) {
        io.to(roomId).emit("userJoined", room.activeUsers.map(u => u.name));
      }
    }
    console.log("user Disconnected");
  });
});

// API to get user's rooms
app.get("/api/rooms", async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: "Email required" });
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "User not found" });
  const rooms = await Room.find({ roomId: { $in: user.rooms } });
  res.json({ rooms });
});

// API to join/add room to user's rooms
app.post("/api/rooms/join", async (req, res) => {
  const { email, roomId } = req.body;
  if (!email || !roomId) return res.status(400).json({ error: "Email and roomId required" });
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });
    if (!user.rooms.includes(roomId)) {
      user.rooms.push(roomId);
      await user.save();
    }
    res.json({ message: "Room added" });
  } catch (err) {
    res.status(500).json({ error: "Failed to add room" });
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'Backend is running!' });
});

// API to check if room exists (for CreateRoom)
app.get("/api/rooms/check", async (req, res) => {
  const { roomId } = req.query;
  const room = await Room.findOne({ roomId });
  res.json({ exists: !!room, room });
});

// API to create a new room
app.post("/api/rooms/create", async (req, res) => {
  const { roomId, name, createdBy } = req.body;
  if (!roomId || !name) return res.status(400).json({ error: "Room ID and name required" });
  const exists = await Room.findOne({ roomId });
  if (exists) return res.status(400).json({ error: "Room ID already exists" });
  const room = await Room.create({ roomId, name, code: "// start code here", activeUsers: [] });

  if (createdBy) {
    const user = await User.findOne({ email: createdBy });
    if (user && !user.rooms.includes(roomId)) {
      user.rooms.push(roomId);
      await user.save();
    }
  }

  res.json({ message: "Room created", room });
});

const port = process.env.PORT || 5000;

server.listen(port, () => {
  console.log(`server is working on port ${port}`);
});
