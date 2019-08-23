
var chai = require('chai'), { expect, assert, use } = chai;
var mocks = require('./mocks');
// var chaiAsPromised = require("chai-as-promised");  // https://www.npmjs.com/package/chai-as-promised
var { DelegationsManager, DelegatesManager } = require('../');
var { utilities } = require('../utilities');

var { MockRouter, MockSandbox, MockDelegate, MockMiddleware, MockController, } = mocks;
var { MOCK_POLICIES, MOCK_ROUTES, MOCK_DELEGATES_MANAGER } = mocks;

// use(chaiAsPromised);

describe("Delegations Manager (Routes & Policies)", () => {
    var manager;
    
    before("instantiate DelegationsManager", () => {
        manager = new DelegationsManager(MOCK_DELEGATES_MANAGER);
    });
    
    it("should set routes", () => {
        // var manager = new DelegationsManager(MOCK_DELEGATES_MANAGER);
        var key = utilities.keyOf(MOCK_ROUTES[0]);
        
        manager['set:routes'](MOCK_ROUTES);
        expect( manager.$routes.get(key) ).to.be.ok;
    });
    
    it("should set policies", () => {
        // var manager = new DelegationsManager(MOCK_DELEGATES_MANAGER);
        var key = utilities.keyOf(MOCK_POLICIES[0]);
        
        manager['set:policies'](MOCK_POLICIES);
        expect( manager.$policies.get(key) ).to.be.ok;
    });
    
    it("should be ready when both routes and policies have been set", async () => {
        // var manager = new DelegationsManager(MOCK_DELEGATES_MANAGER);
        
        manager['set:routes'](MOCK_ROUTES)['set:policies'](MOCK_POLICIES);
        return manager.ready.then(() => {
            var keyP = utilities.keyOf(MOCK_POLICIES[0])
              , keyR = utilities.keyOf(MOCK_ROUTES[0])
              ;
            expect( manager.$policies.get(keyP) ).to.be.ok;
            expect( manager.$routes.get(keyR) ).to.be.ok;
        });
    });
    
    it("should be stable when delegations bear delegates", async () => {
        // var manager = new DelegationsManager(MOCK_DELEGATES_MANAGER);
        
        manager['set:routes'](MOCK_ROUTES)['set:policies'](MOCK_POLICIES);
        return manager.stable.then(() => {
            var keyP = utilities.keyOf(MOCK_POLICIES[0])
              , keyR = utilities.keyOf(MOCK_ROUTES[0])
              ;
            expect( manager.$instances.get(keyP) ).to.be.ok;
            expect( manager.$instances.get(keyR) ).to.be.ok;
        });
    });
    
});
