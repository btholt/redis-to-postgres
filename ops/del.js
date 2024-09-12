export default async function del(sql, primary) {
  const result = await sql`
    UPDATE
      kv
    SET
      attr = delete(attr, ${primary})
    WHERE
      title = 'demo'
    `;
  console.log(result);
  return ":1\r\n";
}
