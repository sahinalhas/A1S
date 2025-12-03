import path from "path";
import { createServer } from "./index";
import express, { type Request, type Response } from "express";
import { startAnalyticsScheduler, stopAnalyticsScheduler } from "./features/analytics/services/analytics-scheduler.service";
import { startAutoCompleteScheduler, stopAutoCompleteScheduler } from "./features/counseling-sessions/services/auto-complete-scheduler.service";
import { closeDatabase } from "./lib/database/connection";

async function startProductionServer() {
  const app = await createServer();
  const port = process.env.PORT || 3000;

  // In production, serve the built SPA files
  const __dirname = import.meta.dirname;
  const distPath = path.join(__dirname, "../spa");

  // Serve static files
  app.use(express.static(distPath));

  // Handle React Router - serve index.html for all non-API routes
  app.get("*", (req: Request, res: Response) => {
    // Don't serve index.html for API routes or static assets
    if (req.path.startsWith("/api/") || 
        req.path.startsWith("/health") ||
        req.path.includes('.') && !req.path.endsWith('/')) {
      return res.status(404).json({ error: "Endpoint not found" });
    }

    // Set cache headers for SPA
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    res.sendFile(path.join(distPath, "index.html"));
  });

  app.listen(port, () => {
    console.log(`🚀 Fusion Starter server running on port ${port}`);
    console.log(`📱 Frontend: http://localhost:${port}`);
    console.log(`🔧 API: http://localhost:${port}/api`);
    
    startAnalyticsScheduler();
    startAutoCompleteScheduler();
  });
}

startProductionServer().catch((error) => {
  console.error("Failed to start production server:", error);
  process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully");
  stopAnalyticsScheduler();
  stopAutoCompleteScheduler();
  closeDatabase();
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully");
  stopAnalyticsScheduler();
  stopAutoCompleteScheduler();
  closeDatabase();
  process.exit(0);
});
