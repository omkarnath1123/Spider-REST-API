const mongoConfig = {
  poolSize: 10,
  useNewUrlParser: true,
  useCreateIndex: true,
  connectTimeoutMS: 30000,
  reconnectInterval: 1000,
  family: 4
};
// Bring Mongoose into the app
const mongoose = require("mongoose");
// Build the connection string
const dbURI =
  process.env.MONGODB_AUTH || "mongodb://localhost:27017/MobileArena";

// Create the database connection
mongoose.connect(dbURI, mongoConfig);
if (process.env.NODE_ENV !== "production") {
  mongoose.set("debug", true);
} else {
  mongoose.set("debug", (collectionName, method, query, doc) => {
    console.log(`${collectionName}.${method}`, JSON.stringify(query), doc);
  });
}

// make mongoose to return native promise
mongoose.Promise = global.Promise;

// CONNECTION EVENTS
// When successfully connected
mongoose.connection.on("connected", function() {
  console.log("Mongoose default connection open to " + dbURI);
});
// If the connection throws an error
mongoose.connection.on("error", function(err) {
  console.log("Mongoose default connection error: " + err);
});
// When the connection is disconnected
mongoose.connection.on("disconnected", function() {
  console.log("Mongoose default connection disconnected");
});
// If the Node process ends, close the Mongoose connection
process.on("SIGINT", function() {
  mongoose.connection.close(function() {
    console.log(
      "Mongoose default connection disconnected through app termination"
    );
    process.exit(0);
  });
});
