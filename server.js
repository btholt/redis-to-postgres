import net from "net";
import Parser from "redis-parser";
import assert from "assert";
import { neon } from "@neondatabase/serverless";
import cleanup from "./cleanup.js";
import setup from "./setup.js";
import get from "./ops/get.js";
import set from "./ops/set.js";
import expire from "./ops/expire.js";
import ping from "./ops/ping.js";
import ttl from "./ops/ttl.js";
import mget from "./ops/mget.js";
import scan from "./ops/scan.js";
import del from "./ops/del.js";

assert(
  process.env.NEON_CONNECTION_STRING,
  "NEON_CONNECTION_STRING is required"
);

const sql = neon(process.env.NEON_CONNECTION_STRING);

// Uncomment to setup the database
// await setup(sql);

const tcpServer = net.createServer((socket) => {
  console.log("=========================");

  const parser = new Parser({
    returnReply: (reply) => {
      // console.log(`Server parsed ${reply}`);
      if (reply[0].toLowerCase() === "quit") {
        socket.end();
        return;
      }
      handleCommand(...reply).then((response) => {
        socket.write(response);
      });
    },
    returnError: (err) => {
      socket.write(`-ERR ${err}\r\n`);
    },
  });

  socket.on("data", (clientData) => {
    parser.execute(clientData);
  });

  socket.on("end", () => {
    console.log("QUIT");
  });
});

async function handleCommand(command, primary, secondary, ...rest) {
  console.log(command.toUpperCase() + "\t", ...[primary, secondary, ...rest]);
  switch (command.toLowerCase()) {
    case "set":
      return set(sql, primary, secondary);
    case "get":
      return get(sql, primary);
    case "ping":
      return ping();
    case "expire":
      return expire(sql, primary, secondary);
    case "ttl":
      return ttl(sql, primary);
    case "mget":
      return mget(sql, [primary, secondary, ...rest]);
    case "del":
      return del(sql, primary);
    case "scan":
      return scan(sql, primary, secondary, ...rest);
    case "client":
      return "+OK\r\n";
    default:
      console.log("Unknown command", command);
      return "+OK\r\n";
  }
}

cleanup(sql);
tcpServer.listen(6379, "127.0.0.1");
