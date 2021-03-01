/*
 * moleculer-idempotency
 * Copyright (c) 2021 Eduard Avetyan (https://github.com/eduardavetyan)
 * MIT Licensed
 */

"use strict";

const BaseIdempotency = require("./Base"),
      Redis = require("redis")

module.exports = (options) => {

  const RedisClient = Redis.createClient( options )

  BaseIdempotency.storageGet = (key) => new Promise((resolve, reject) => {

    RedisClient.get(key, (err, data) => {
      if (err)
        return reject(err);

      return resolve(JSON.parse(data));

    })

  })

  BaseIdempotency.storageSet = (key, data, lifetime = 60 * 60) => new Promise((resolve, reject) => {

    RedisClient.set(key, JSON.stringify(data), "EX", lifetime, (err) => {
      if (err)
        return reject(err);

      return resolve();
    })

  })

  return BaseIdempotency;

}
