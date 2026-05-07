import app from "./app.js";
import { initDB } from "./db/mysql.db.js";
import { connectRedis } from "./db/redis.db.js";


async function start() {
  try {
    initDB({
      host: "localhost",
      user: "root",
      password: "",
      database: "cloud-storage",
    });
    await connectRedis();

    const PORT = process.env.APP_PORT || 3000;

    app.listen(PORT, () => {
      console.log(`Server running on ${PORT}`);
    });
  } catch (error) {
    console.error("Startup failed:", error);
    process.exit(1);
  }
}

start();