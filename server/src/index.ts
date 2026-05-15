import { app } from "./app";
import { config } from "./config";
import { pool, waitForDatabase } from "./db";

async function startServer(): Promise<void> {
  await waitForDatabase();

  app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});

process.on("SIGINT", async () => {
  await pool.end();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await pool.end();
  process.exit(0);
});
