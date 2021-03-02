/*
 * moleculer.idempotency
 * Copyright (c) 2021 Eduard Avetyan (https://github.com/eduardavetyan)
 * MIT Licensed
 */

"use strict";

module.exports = function IdempotencyMiddleware(opts){

  // Default options
  const defaultOptions = {
    storage: {
      type: 'memory',  // Data storage
      options: {}  // Data storage options
    },
    lifetime: 60 * 60, // Lifetime (in seconds) of data saved in idempotency storage
    keyName: 'idempotency-key'
  }

  // Merge user defined options with defaults
  const options = {...defaultOptions, ...opts}

  // Get Idempotency Key from request headers if exists.
  const getIdempotencyKey = (ctx, keyName) => {

    try{
      if( ctx.action.name == ctx.options.parentCtx.params.req.$action.name )
        return ctx.options.parentCtx.params.req.headers[keyName];
    } catch {
      return;
    }

  }

  // Capitalize first letter
  const UCFirst = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  // Define the storage for idempotent data
  const dataStorage = require(`./storages/${UCFirst(options.storage.type)}`)(options.storage.options)

  // Middleware function
  const idempotencyMiddleware = async (ctx, next, action) => {

    let idempotencyKey = getIdempotencyKey(ctx, options.keyName)

    // Check if idempotency key was sent
    if( idempotencyKey ){

      const content = await dataStorage.get( idempotencyKey );

      // Check if data for key is already ready
      if( content.success ){

        ctx.cachedResult = true;

        if( !content.result.error )
          return content.result.response;
        else
          throw content.result.response;

      } else {

        // Set idempotency key in database and wait for final response from endpoint
        await dataStorage.set( idempotencyKey );

        try{

          const response = await next(ctx);

          // Set final response from endpoint
          await dataStorage.setFinal( idempotencyKey, response, options.lifetime );

          return response;

        } catch(err){

          await dataStorage.setFinal( idempotencyKey, err, options.lifetime, true );

          throw err;

        }

      }

    } else
      return await next(ctx);

  }

  return {

    name: "Idempotency",

    localAction: (next, action) => (ctx) => idempotencyMiddleware(ctx, next, action),

    remoteAction: (next, action) => (ctx) => idempotencyMiddleware(ctx, next, action)

  }

}
