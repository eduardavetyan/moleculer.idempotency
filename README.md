# Idempotency middleware for Moleculer Microservices Framework

Idempotency middleware stands for client requests to be idempotent. Client can make the same request repeatedly because of network error, timeout etc.. but the same operation will not be executed twice. Client must repeat the same request by sending the same Idempotency-Key value in request headers, and the request will be responded with the same response as the original request.

### Installation
This module is available on the public NPM registry:

```sh
npm install moleculer.idempotency --save
```

### Client request
Client must include idempotency-key in every request.
idempotency-key must be a unique key per same requests.

```
idempotency-key: exampleUniqueHashString
```

### Usage
**Load with default options**
By default memory will be used as a data storage
```js
// moleculer.config.js
const IdempotencyMiddleware = require("moleculer.idempotency");

module.exports = {
  middlewares: [
    IdempotencyMiddleware()
  ]
};
```

**Load with Redis options**
```js
// moleculer.config.js
const IdempotencyMiddleware = require("moleculer.idempotency");

module.exports = {
  middlewares: [
    IdempotencyMiddleware({
      storage: {
        type: "redis",
        options: { // Pass Redis options object
            "host": "_redis_hostname_here_",
            "password": "_redis_password_here_",
            "port": 6379
        }
      },
      lifetime: 60 * 60 // seconds
    })
  ]
};
```

### Fields

|Field|Description|
|--|--|
|storage  | Data storage type and options. Available types are: Memory, Redis |
|lifetime | Time (in seconds) how long the idempotency data will be saved in data storage. After this time period data will be purged and the next request with same Idempotency-Key will execute the endpoint. Default value is 1 hour (3600 seconds).  |

## License
moleculer.idempotency is available under the [MIT license](https://tldrlegal.com/license/mit-license).

###### Copyright (c) 2021 eduardavetyan
