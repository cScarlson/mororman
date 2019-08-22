
var chai = require('chai'), { expect, assert, use } = chai;
var mocks = require('./mocks');
// var chaiAsPromised = require("chai-as-promised");  // https://www.npmjs.com/package/chai-as-promised
var { DelegationsManager } = require('../');

var { MockRouter, MockSandbox, MockDelegate, MockMiddleware, MockController, } = mocks;
var { MOCK_ROUTER, MOCK_SANDBOX, MOCK_OPTIONS, MOCK_CONTROLLERS, MOCK_MIDDLEWARE, MOCK_POLICIES, MOCK_ROUTES, } = mocks;

// use(chaiAsPromised);

describe("Delegations Manager (Middleware + Controllers)", () => {
    
    it("should fail for now", () => {
        expect(true).to.equal(false);
    });
    
});
