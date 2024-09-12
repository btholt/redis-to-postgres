export default async function scan(sql, cursor = "0", match, count = 10) {
  const result = await sql`
    SELECT 
      hstore_to_json(kv.attr) as value
    FROM 
      kv 
    WHERE 
      kv.title = 'demo'
  `;
  const subset = Object.values(result[0].value).slice(
    +cursor,
    +cursor + +count
  );

  const response = subset.map((value) => {
    return `$${value.length}\r\n${value}\r\n`;
  });
  let newCursor = +cursor + subset.length;

  if (subset.length < count) {
    newCursor = 0;
  }
  const newCursorString = newCursor.toString();

  const res = `*2\r\n$${newCursorString.length}\r\n${newCursorString}\r\n*${
    subset.length
  }\r\n${response.join("")}\r\n`;
  return res;
}
