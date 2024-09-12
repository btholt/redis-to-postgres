export default async function set(sql, primary, secondary) {
  await sql`
        UPDATE
          kv
        SET
          attr = attr || hstore(${primary}, ${secondary})
        WHERE
          title = 'demo'
      `;
  return "+OK\r\n";
}
