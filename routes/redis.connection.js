let redis = require("redis"),
  /* Values are hard-coded for this example, it's usually best to bring these in via file or environment variable for production */
  client = redis.createClient({
    port: process.env.REDIS_PORT || 6379,
    host: process.env.REDIS_HOST || "120.0.0.1",
    password: process.env.REDIS_PASSWORD
    // TODO for SSL connection use use : `fs.readFile[Sync]` or another method to bring these values in
    // tls: {
    //   key: stringValueOfKeyFile,
    //   cert: stringValueOfCertFile,
    //   ca: [stringValueOfCaCertFile]
    // }
  });

client.on("ready", function() {
  console.log(
    `Redis default connection open to ${process.env.REDIS_HOST ||
      "120.0.0.1"}:${process.env.REDIS_PORT || 6379}`
  );
});

client.on("error", function (err) {
  console.log(`Redis Error : ${err}`);
});
