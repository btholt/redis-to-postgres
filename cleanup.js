import cron from "node-cron";

export default function cleanup(sql) {
  cron.schedule("*/5 * * * * *", async () => {
    // console.log("Expiring keys cron job started");
    const result = await sql`
              SELECT 
                expiring_kv.key
              FROM 
                kv 
              JOIN
                expiring_kv
              ON
                kv.title = expiring_kv.title
              WHERE 
                kv.title = 'demo'
                AND expiring_kv.expires_at < NOW()
            `;
    for (const row of result) {
      await sql`
            UPDATE
              kv
            SET
              attr = delete(attr, ${row.key})
            WHERE
              title = 'demo'
          `;
      // console.log("Deleted key", row.key);
    }
    await sql`
          DELETE FROM
            expiring_kv
          WHERE
            expires_at < NOW()
        `;
    // console.log("Expired keys deleted");
  });
}
