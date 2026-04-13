import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import packInRoutes from "./routes/packIn/index.js";
import packOutRoutes from "./routes/packOut/index.js";
import masterRoutes from "./routes/master/index.js";
import dashboardRoutes from "./routes/dashboard/index.js"
import authRoutes from "./routes/auth/index.js";
import reportsRoutes from "./routes/reports/index.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors({
  origin: true,   // ✅ automatically allows request origin
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));





mongoose.connect(process.env.MONGODB_URI)
.then(()=>{
    console.log("MongoDB Connected");
})
.catch((err)=>{
    console.log("MongoDB Connection Error:",err);
});

app.use("/api/packIn", packInRoutes);
app.use("/api/packOut", packOutRoutes);
app.use("/api/master", masterRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/reports", reportsRoutes);
app.get("/",(req,res)=>{
    res.send("WMS API Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`);
});
