export default async function mget(sql, primaries) {
  const selectClause = primaries
    .map((key, index) => `kv.attr -> $${index + 1} as key${index + 1}`)
    .join(", ");

  const result = await sql(
    `
      SELECT 
        ${selectClause}
      FROM 
        kv 
      LEFT JOIN
        expiring_kv
      ON
        kv.title = expiring_kv.title
      WHERE 
        kv.title = 'demo'AND 
        (
          expiring_kv.expires_at IS NULL 
          OR expiring_kv.expires_at > NOW()
        )
    `,
    primaries
  );

  const response = primaries.map((key, index) => {
    const value = result[0][`key${index + 1}`];
    return value ? `$${value.length}\r\n${value}\r\n` : "$-1\r\n";
  });
  return `*${response.length}\r\n${response.join("")}`;
}
