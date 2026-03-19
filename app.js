import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

import packInRoutes from "./routes/packIn/index.js";
import packOutRoutes from "./routes/packOut/index.js";
import masterRoutes from "./routes/master/index.js";
import dashboardRoutes from "./routes/dashboard/index.js"

dotenv.config();

const app = express();

app.use(express.json());

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

app.get("/",(req,res)=>{
    res.send("WMS API Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`);
});
