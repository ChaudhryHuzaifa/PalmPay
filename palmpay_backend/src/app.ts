import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import crypto from "crypto";

// --------------------
// App Init
// --------------------
const app: Application = express();

// --------------------
// Request ID Middleware
// --------------------
app.use((req: Request, res: Response, next: NextFunction) => {
  const requestId = req.headers["x-request-id"] || crypto.randomUUID();
  req.headers["x-request-id"] = requestId as string;
  res.setHeader("x-request-id", requestId);
  next();
});

// --------------------
// CORS CONFIG (FIXED)
// --------------------
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "X-Request-Id"
    ],
    exposedHeaders: ["X-Request-Id"]
  })
);

// --------------------
// Middlewares
// --------------------
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// --------------------
// Health Check
// --------------------
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    requestId: req.headers["x-request-id"]
  });
});

// --------------------
// IMPORT ALL ROUTES
// --------------------
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import transactionRoutes from "./routes/transaction.routes";
import biometricRoutes from "./routes/biometric.routes";
import healthRoutes from "./routes/health.routes";

// --------------------
// REGISTER ALL ROUTES
// --------------------
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/transactions", transactionRoutes);
app.use("/api/v1/biometric", biometricRoutes);
app.use("/api/v1/health", healthRoutes);

// --------------------
// 404 Handler
// --------------------
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

// --------------------
// Global Error Handler
// --------------------
app.use(
  (
    err: any,
    req: Request,
    res: Response,
    _next: NextFunction
  ) => {
    console.error("🔥 Error:", err);

    res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal Server Error",
      requestId: req.headers["x-request-id"]
    });
  }
);

export default app;