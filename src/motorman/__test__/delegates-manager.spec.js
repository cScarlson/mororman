
var chai = require('chai'), { expect, assert, use } = chai;
var mocks = require('./mocks');
// var chaiAsPromised = require("chai-as-promised");  // https://www.npmjs.com/package/chai-as-promised
var { DelegatesManager } = require('../');

var { MockRouter, MockSandbox, MockDelegate, MockMiddleware, MockController, } = mocks;
var { MOCK_ROUTER, MOCK_SANDBOX, MOCK_OPTIONS, MOCK_CONTROLLERS, MOCK_MIDDLEWARE, MOCK_POLICIES, MOCK_ROUTES, } = mocks;

// use(chaiAsPromised);

describe("Delegates Manager (Routes + Policies)", () => {
    
    it("should fail for now", () => {
        expect(true).to.equal(false);
    });
    
});
