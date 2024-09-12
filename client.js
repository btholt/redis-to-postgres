import { createClient } from "redis";

// get key and value from CLI arguments
let [, , key, value] = process.argv;

if (!key || !value) {
  key = "testkey";
  value = "testvalue";
}

async function main() {
  const client = createClient({
    url: "redis://localhost:6379",
  });

  client.on("error", (err) => console.log("Redis Client Error", err));

  console.log("Connecting to Redis...");
  await client.connect();
  console.log("Connected to Redis!");

  await client.set(key, value);
  console.log(`Set ${key} to ${value}`);

  const returnedValue = await client.get(key);
  console.log(`Got ${key} with value ${returnedValue}`);

  await client.expire(key, 3);
  console.log(`Set TTL for ${key} to 3 seconds`);

  const ttl = await client.ttl(key);
  console.log(`TTL for ${key} is ${ttl}`);

  // test mget
  // let promises = [];
  // for (let i = 1; i <= 15; i++) {
  //   promises.push(await client.set(`key${i}`, `value${i}`));
  // }

  // await Promise.all(promises);

  const mgetResults = await client.mGet(["key1", "key2", "key3", "key15"]);
  console.log(`MGET results: ${mgetResults}`);

  await client.del("key1");
  console.log("Delete key1");

  const key1Result = await client.get("key1");
  console.log(`Get key1 result: ${key1Result}`);

  const shouldWork = await client.get(key);
  console.log(`Got ${key} with value ${shouldWork} while it should work`);

  console.log("Sleeping for 6 seconds...");
  await new Promise((resolve) => setTimeout(resolve, 6000));

  const shouldNotWork = await client.get(key);
  console.log(
    `Got ${key} with value ${shouldNotWork} while it should not work`
  );

  client.quit();
  console.log("Disconnected from Redis");
}

main();
