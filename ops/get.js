export default async function get(sql, primary) {
  const result = await sql`
    SELECT 
      kv.attr -> ${primary} as value
    FROM 
      kv 
    LEFT JOIN
      expiring_kv
    ON
      kv.title = expiring_kv.title
    WHERE 
      kv.title = 'demo'
      AND (expiring_kv.expires_at IS NULL OR expiring_kv.expires_at > NOW())
  `;
  const pgValue = result[0]?.value;
  const pgReturn = pgValue ? `$${pgValue.length}\r\n${pgValue}\r\n` : "$-1\r\n";
  return pgReturn;
}
