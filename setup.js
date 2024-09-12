export default async function setup(sql) {
  await sql`
    DROP TABLE IF EXISTS kv
  `;
  await sql`
    DROP TABLE IF EXISTS expiring_kv
  `;
  await sql`
    CREATE TABLE
        kv (
            id serial primary key,
            title VARCHAR (255),
            attr hstore
        )
  `;
  await sql`
    CREATE TABLE
        expiring_kv (
            id serial primary key,
            title VARCHAR (255),
            key VARCHAR (255),
            expires_at TIMESTAMP
        )
  `;
  await sql`
    INSERT INTO
        kv
        (title, attr)
    VALUES
        ('demo', '')
  `;
}
