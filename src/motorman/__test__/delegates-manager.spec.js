
var chai = require('chai'), { expect, assert, use } = chai;
var mocks = require('./mocks');
// var chaiAsPromised = require("chai-as-promised");  // https://www.npmjs.com/package/chai-as-promised
var { DelegatesManager } = require('../');

var { MockRouter, MockSandbox, MockDelegate, MockMiddleware, MockController, } = mocks;
var { MOCK_ROUTER, MOCK_SANDBOX, MOCK_OPTIONS, MOCK_CONTROLLERS, MOCK_MIDDLEWARE, MOCK_POLICIES, MOCK_ROUTES, } = mocks;

// use(chaiAsPromised);

describe("Delegates Manager (Middleware & Controllers)", () => {
    
    xit("should inject a sandbox into middleware", () => {
        expect(true).to.equal(false);
    });
    
    xit("should inject a sandbox into controllers", () => {
        expect(true).to.equal(false);
    });
    
});
