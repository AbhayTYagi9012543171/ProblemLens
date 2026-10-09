import dotenv from "dotenv";

dotenv.config();

const nodeEnv = process.env.NODE_ENV || "development";
const jwtSecret = process.env.JWT_SECRET || "development-secret";

if (nodeEnv === "production") {
  if (!process.env.JWT_SECRET || jwtSecret === "development-secret" || jwtSecret.length < 32) {
    throw new Error(
      "Production configuration error: set JWT_SECRET to a unique random value of at least 32 characters."
    );
  }
}

export const env = {
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/problemlens",
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  // The AI service's .env.example and run instructions use port 8001.
  aiServiceUrl: String(process.env.AI_SERVICE_URL || "http://127.0.0.1:8001").replace(/\/+$/, ""),
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  nodeEnv,
};
