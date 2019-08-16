
Motorman
====
A Routing Engine for managing Express projects.

### tl;dr
As of now, the tests (`./test.js`) and the source are the best documentation. 

## About
Uses [Express](https://www.npmjs.com/package/express) undearneath.

## Installation
    npm i @motorman/motorman -S

## Usage
```javascript
    var { Motorman } = require('@motorman/motorman');
    var motorman = new Motorman({ router: app, sandbox: new class Sandbox {} });
    motorman
        .setRoutes(routes)
        .setPolicies(policies)
        .setMiddleware(middleware)
        .setControllers(controllers)
        .bootstrap()
        ;
```

## Configuration
## Methods

## ToDo
- @About
- @Configuration docs
- @Methods docs
- `.npmignore`?
