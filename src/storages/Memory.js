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

  BaseIdempotency.storageSet = (key, data) => {
    IdempotencyMap.set( key, data )
  }

  return BaseIdempotency;

}
