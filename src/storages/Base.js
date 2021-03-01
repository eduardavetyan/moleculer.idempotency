/*
 * moleculer.idempotency
 * Copyright (c) 2021 Eduard Avetyan (https://github.com/eduardavetyan)
 * MIT Licensed
 */

"use strict";

const EventEmitter = require("events"),
      IdempotencyEmitter = new EventEmitter()

// Wait for data to be responded by first called request and return it
const waitForResult = (key) => new Promise((resolve, reject) => {

  IdempotencyEmitter.on(`moleculerIdempotency_${key}`, (result) => {

    return resolve(result)

  });

})

module.exports = {
  // Get data by idempotency key
  get: async (key) => {

    let data = await module.exports.storageGet(key)

    if( data )
      if( data.finished )
        return { success: true, result: data } // Return if data is already ready
      else
        return { success: true, result: await waitForResult(key) } // Otherwise wait for it
    else
      return { success: false }

  },

  // Set idempotency key to wait the endpoint response
  set: async (key) => {

    await module.exports.storageSet( key, { finished: 0 } )

  },

  // Assign final endpoint response data to idempotency key and emit an event
  setFinal: async (key, response, lifetime, error = false) => {

    const data = { finished: 1, response, lifetime, error }

    await module.exports.storageSet( key, data, lifetime )

    IdempotencyEmitter.emit(`moleculerIdempotency_${key}`, data)

  }
}
