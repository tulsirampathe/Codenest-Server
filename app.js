import cookieParser from "cookie-parser";
import cors from "cors";
import { config } from "dotenv";
import express from "express";
import morgan from "morgan";
import connectDB from "./config.js";
import adminRoutes from "./routes/adminRoutes.js";
import challengeRoutes from "./routes/challengeRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import testCaseRoutes from "./routes/testCaseRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { errorHandler } from "./utils/errorHandler.js";

const app = express();

config(); // Load environment variables

// Connect to MongoDB
connectDB();

// Start the server
const PORT = process.env.PORT || 5000;

app.use(cookieParser());

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:4173",
      process.env.CLIENT_URL,
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.send("Hello from coding platform. Happy Coding 💖");
});

// Routes
app.use("/admin", adminRoutes);

app.use("/user", userRoutes);

app.use("/challenge", challengeRoutes);

app.use("/question", questionRoutes);

app.use("/testCase", testCaseRoutes);

app.use("/submission", submissionRoutes);

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
