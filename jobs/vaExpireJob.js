const cron = require("node-cron");
const pool = require("../config/db");

const expireVirtualAccountJob = () => {
  // ⏱️ Jalan setiap 1 menit (buat testing)
  cron.schedule("* * * * *", async () => {
    try {
      const result = await pool.query(`
        UPDATE "VirtualAccount"
        SET status = 'expired'
        WHERE status = 'active'
          AND expired_at IS NOT NULL
          AND expired_at < NOW()
        RETURNING va_id, va_number
      `);

      if (result.rowCount > 0) {
        console.log(
          `[CRON] ${result.rowCount} VA expired otomatis`,
          result.rows
        );
      }
    } catch (error) {
      console.error("[CRON] VA Expire Job error:", error);
    }
  });
};

module.exports = expireVirtualAccountJob;
