export default async function expire(sql, primary, secondary) {
  await sql`
    INSERT INTO
        expiring_kv
        (title, key, expires_at)
    VALUES
        ('demo', ${primary}, NOW() + INTERVAL '1 SECOND' * ${secondary})
    `;
  return "+OK\r\n";
}
