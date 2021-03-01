/*
 * moleculer.idempotency
 * Copyright (c) 2021 Eduard Avetyan (https://github.com/eduardavetyan)
 * MIT Licensed
 */

"use strict";

const BaseIdempotency = require("./Base"),
      IdempotencyMap = new Map()

module.exports = (options) => {

  BaseIdempotency.storageGet = (key) => {
    return IdempotencyMap.get( key )
  }

  BaseIdempotency.storageSet = (key, data, lifetime = 60 * 60) => {
    IdempotencyMap.set( key, data )

    setTimeout(() => {
      IdempotencyMap.delete( key )
    }, lifetime * 1000)
  }

  return BaseIdempotency;

}
