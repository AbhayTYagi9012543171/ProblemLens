import app from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";

const startServer = async () => {
  try {
    console.log("========================================");
    console.log("🚀 Starting ProblemLens Backend...");
    console.log("========================================");

    // ------------------------------------------------------------
    // 1. Connect to MongoDB
    // ------------------------------------------------------------
    console.log("🔄 Connecting to database...");

    await connectDB();

    console.log("✅ Database connected successfully");

    // ------------------------------------------------------------
    // 2. Start Express server
    // ------------------------------------------------------------
    const server = app.listen(env.port, () => {
      console.log("----------------------------------------");
      console.log("🚀 ProblemLens Backend Started");
      console.log("----------------------------------------");
      console.log(`🌐 Server: http://localhost:${env.port}`);
      console.log(`🔐 Auth:   http://localhost:${env.port}/api/auth`);
      console.log("----------------------------------------");
      console.log("✅ Backend is ready to accept requests");
      console.log("========================================");
    });

    // ------------------------------------------------------------
    // 3. Handle server errors
    // ------------------------------------------------------------
    server.on("error", (error) => {
      console.error("❌ Server error:", error);

      if (error.code === "EADDRINUSE") {
        console.error(
          `❌ Port ${env.port} is already being used by another process.`
        );

        console.error(
          `💡 Stop the existing process or change the PORT in your .env file.`
        );
      }

      process.exit(1);
    });

    // ------------------------------------------------------------
    // 4. Graceful shutdown
    // ------------------------------------------------------------
    const shutdown = (signal) => {
      console.log(`\n🛑 ${signal} received.`);
      console.log("🔄 Shutting down ProblemLens backend...");

      server.close(() => {
        console.log("✅ HTTP server closed.");
        process.exit(0);
      });

      // Force shutdown if something prevents closing
      setTimeout(() => {
        console.error("⚠️ Forced shutdown after timeout.");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error("========================================");
    console.error("❌ FAILED TO START PROBLEMLENS BACKEND");
    console.error("========================================");

    console.error(error);

    if (error instanceof Error) {
      console.error("Message:", error.message);
      console.error("Stack:", error.stack);
    }

    process.exit(1);
  }
};

// ------------------------------------------------------------
// Start application
// ------------------------------------------------------------
startServer();