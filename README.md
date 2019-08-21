
Motorman
====
A Routing Engine for managing Express projects.

### tl;dr
As of now, the tests (`./test.js`) and the source are the best documentation. 

## About
### Dependencies
#### None (requires *any* [Express](https://www.npmjs.com/package/express)-like router undearneath).
Depending on the route-definition's methods, expects:
```typescript
    interface Router {
        .use(...splat: any[]): any;
        .all(...splat: any[]): any;
        .get(...splat: any[]): any;
        .post(...splat: any[]): any;
        .put(...splat: any[]): any;
        .delete(...splat: any[]): any;
        .param(...splat: any[]): any;
    }
```
Motorman *loosely* expects an ExpressJS router. However, it simply uses the `method` in a *route-declaration* to map to a method (function) of the router object passed in with the config (see below). Future versions will allow the internal "`ROUTER_METHOD_MAP`" to be extended & overridden.

## Installation
    npm i @motorman/motorman -S

## Usage
```javascript
    var { Motorman } = require('@motorman/motorman');
    var express = require('express');
    
    var app = express();
    var router = app || app.router()
      , sandbox = new class Sandbox {...}
      , config = { router, sandbox }
      ;
    var routes = [  // keep this in another file, ya half-bit!
        {
            method: 'GET', uri: '/endpoint/:id',
            controller: 'ControllerClassName',
            action: 'methodName',
            policies: 'Optional' || ['Optional'],
        },
        ...
    ];
    var policies = [  // keep this in another file, ya half-bit!
        {
            method: 'GET', uri: '/endpoint/:id',
            controller: 'MiddlewareClassName',
            // action: 'methodName',  (implicitly calls `.execute(req, res, next)`)
            // policies: 'Optional' || ['Optional'],
        },
        ...
    ];
    var middleware = { 'MiddlewareClassName': class MiddlewareClassName {}, ... };  // half-bit!
    var controllers = { 'ControllerClassName': class ControllerClassName {}, ... };  // half-bit!
    var motorman = new Motorman(config);
    
    motorman.ready.then( () => {...} );  // everything in its right place
    motorman.stable.then( () => {...} );  // mounted to router
    
    motorman
        .define('routes', routes)
        .define('policies', policies)
        .define('middleware', middleware)
        .define('controllers', controllers)
        ;
```

## Configuration
## Methods

## ToDo
- Allow overrides on `ROUTER_METHOD_MAP` so Front-Ends can use Motorman.
- @About
- @Configuration docs
- @Methods docs
- `.npmignore`?
