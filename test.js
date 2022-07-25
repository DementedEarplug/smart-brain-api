const redis = require("redis");

const client = redis.createClient({ host: "redis", port: 6379 });

const call = async () => {
  client.set("key", "value", redis.print);
  return await client.get("key", (err, reply) => {
    if (err) {
      console.log(error);
      return err;
    } else {
      console.log(reply);
      return reply;
    }
  });
};

console.log(await call());
