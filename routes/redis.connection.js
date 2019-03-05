let redis = require("redis");
let client;
if (
  process.env.REDIS_PORT &&
  process.env.REDIS_HOST &&
  process.env.REDIS_PASSWORD
) {
  client = redis.createClient({
    port: process.env.REDIS_PORT || "6379",
    host: process.env.REDIS_HOST || "120.0.0.1",
    password: process.env.REDIS_PASSWORD
    // TODO for SSL connection use use : `fs.readFile[Sync]` or another method to bring these values in
    // tls: {
    //   key: stringValueOfKeyFile,
    //   cert: stringValueOfCertFile,
    //   ca: [stringValueOfCaCertFile]
    // }
  });
} else {
  client = redis.createClient({});
}

client.on("ready", function() {
  console.log(
    `Redis default connection open to ${process.env.REDIS_HOST ||
      "120.0.0.1"}:${process.env.REDIS_PORT || 6379}`
  );
});

client.monitor(function(err, res) {
  console.log(`REDIS : { RES : ${res}, ERROR :${err}}`);
});

client.on("error", function(err) {
  console.log(`Redis Error : ${err}`);
});

module.exports.client = client;
