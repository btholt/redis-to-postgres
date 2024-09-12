export default async function ttl(sql, primary) {
  const result = await sql`
    SELECT
        expires_at, NOW() as now, expires_at - NOW() as ttl
    FROM
        expiring_kv
    INNER JOIN
        kv
    ON
        kv.title = expiring_kv.title
        AND exist(kv.attr, ${primary})
    WHERE
        key = ${primary}
    `;
  if (result.length === 0) {
    return ":0\r\n";
  }
  const expiresAt = result[0].expires_at;
  const now = result[0].now;
  if (expiresAt < now) {
    return ":0\r\n";
  }
  const ttl = Math.round(intervalToSeconds(result[0].ttl));

  return `:${ttl}\r\n`;
}

function intervalToSeconds(interval) {
  const years = interval.years || 0;
  const months = interval.months || 0;
  const days = interval.days || 0;
  const hours = interval.hours || 0;
  const minutes = interval.minutes || 0;
  const seconds = interval.seconds || 0;
  const milliseconds = interval.milliseconds || 0;
  const totalSeconds =
    years * 31536000 +
    months * 2592000 +
    days * 86400 +
    hours * 3600 +
    minutes * 60 +
    seconds +
    milliseconds / 1000;
  return totalSeconds;
}
