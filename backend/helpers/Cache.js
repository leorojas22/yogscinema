const redisClient = require(process.cwd() + "/helpers/RedisClient");
const { base64, sha1 } = require(process.cwd() + "/helpers/crypto");

class Cache {
    static save(hashKey, field, value, expireTime = 3600) {
        let cache = {
            field,
            value,
            expireDate: Date.now() + expireTime
        };

        let hashedField   = sha1(field);
        let encodedValue = base64.encode(JSON.stringify(cache));

        redisClient.hset(hashKey, hashedField, encodedValue);
    }

    static get(hashKey, field) {
        return new Promise((resolve, reject) => {
            redisClient.hget(hashKey, sha1(field), (error, result) => {

                if(error) {
                    console.log("error getting value from redis:");
                    console.log(error);
                    reject();
                    return false;
                }

                if(result) {

                    try {
                        // Parse result
                        let decodedValue = JSON.parse(base64.decode(result));
                        // Check if its not expired
                        if(decodedValue.expireDate > Date.now())
                        {
                            resolve(decodedValue.value);
                            return true;
                        }
                    }
                    catch(e) {
                        console.log("error parsing result: " + e.message);
                    }
                }

                // If it makes it here, then no cached value was found
                console.log("CACHE NOT FOUND");
                console.log(hashKey, field);
                reject();
                return false;
            });
        });
    }
}

module.exports = Cache;
