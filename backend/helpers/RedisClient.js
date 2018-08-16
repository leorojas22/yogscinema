const redis = require("redis");
const client = redis.createClient();

client.on("connect", () => {
    console.log("redis connected");
});

client.on("error", (err) => {
    console.log("redis error: " + err);
});


module.exports = client;
