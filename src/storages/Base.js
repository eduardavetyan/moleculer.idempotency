/*
 * moleculer.idempotency
 * Copyright (c) 2021 Eduard Avetyan (https://github.com/eduardavetyan)
 * MIT Licensed
 */

"use strict";

const EventEmitter = require("events"),
      IdempotencyEmitter = new EventEmitter(),
      {serializeError, deserializeError} = require('serialize-error')

// Wait for data to be responded by first called request and return it
const waitForResult = (key) => new Promise((resolve, reject) => {

  IdempotencyEmitter.on(`moleculerIdempotency_${key}`, (result) => {

    return resolve(result)

  });

})

module.exports = {
  // Get data by idempotency key
  get: async (key) => {

    let data = await module.exports.storageGet(key),
        result

    if( data ){
      if( !data.finished ) // If previous request execution was not finished, wait for it
        data = await waitForResult(key)

      if( data.error )
        data.response = deserializeError(data.response) // Deserialize Error object

      return { success: true, result: data }
    } else
      return { success: false }

  },

  // Set idempotency key to wait the endpoint response
  set: async (key) => {

    await module.exports.storageSet( key, { finished: 0 } )

  },

  // Assign final endpoint response data to idempotency key and emit an event
  setFinal: async (key, response, lifetime, error = false) => {

    if( error )
      response = serializeError(response) // Serialize Error object

    const data = { finished: 1, response, lifetime, error }

    await module.exports.storageSet( key, data, lifetime )

    IdempotencyEmitter.emit(`moleculerIdempotency_${key}`, data)

  }
}
