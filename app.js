import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import connectDB from "./config.js";
import adminRoutes from "./routes/adminRoutes.js";
import challengeRoutes from "./routes/challengeRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import testCaseRoutes from "./routes/testCaseRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { errorHandler } from "./utils/errorHandler.js";

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Security headers
app.use(helmet());

// Gzip compression
app.use(compression());

// Cookie parsing middleware
app.use(cookieParser());

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL, 
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // Allow cookies to be sent
  })
);

// app.use((req, res, next) => {
//   console.log("Cookies:", req.cookies);
//   next();
// });


// Rate limiter to prevent abuse
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // Limit each IP to 100 requests per window
// });
// app.use(limiter);

// JSON body parser
app.use(express.json());

// Request logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", uptime: process.uptime() });
});

// Routes
app.use("/admin", adminRoutes);
app.use("/user", userRoutes);
app.use("/challenge", challengeRoutes);
app.use("/question", questionRoutes);
app.use("/testCase", testCaseRoutes);
app.use("/submission", submissionRoutes);

// Home route
app.get("/", (req, res) => {
  res.send("Welcome to the coding platform. Happy Coding! 💖");
});

// Error handling middleware
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

export default app;
