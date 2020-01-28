const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');

const redisUrl = process.env['REDIS_URL'];
const client = redis.createClient(redisUrl);
client.get = util.promisify(client.get);

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.exec = async function() {
  const key = {
    ...this.getQuery(),
    collection: this.mongooseCollection.name
  };

  // See if we have a value for key in redis
  const cacheValue = await client.get(JSON.stringify(key));

  // if we do, return that
  if (cacheValue) {
    const doc = JSON.parse(cacheValue);

    return Array.isArray(doc)
      ? doc.map(d => new this.model(d))
      : new this.model(doc);
  }
  // otherwise, issue the query and store the result in redis

  const result = await exec.apply(this, arguments);

  client.set(JSON.stringify(key), JSON.stringify(result));

  return result;
};
