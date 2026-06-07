import app from "./app.js";
import { initDB } from "./db/postgresSql.js";
// import { initDB } from "./db/mysql.db.js";
import { connectRedis } from "./db/redis.db.js";

async function start() {
  try {
    // initDB({
    //   host: "localhost",
    //   user: "root",
    //   password: "",
    //   database: "cloud-storage",
    // });
    initDB({
      host: "localhost",
      port: 5432,
      user: "postgres", // replace if your PostgreSQL username is different
      password: "govind@123",
      database: "cloudstorage",
      connectionLimit: 10,
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
