
var chai = require('chai'), { expect, assert, use } = chai;
var mocks = require('./mocks');
// var chaiAsPromised = require("chai-as-promised");  // https://www.npmjs.com/package/chai-as-promised
var { DelegatesManager } = require('../');

var { MockRouter, MockSandbox, MockDelegate, MockMiddleware, MockController, } = mocks;
var { MOCK_ROUTER, MOCK_SANDBOX, MOCK_OPTIONS, MOCK_CONTROLLERS, MOCK_MIDDLEWARE, MOCK_POLICIES, MOCK_ROUTES, } = mocks;

// use(chaiAsPromised);

describe("Delegates Manager (Middleware & Controllers)", () => {
    
    it("should set middleware", () => {
        var manager = new DelegatesManager(MOCK_SANDBOX);
        
        expect( manager.$middleware.get('Middleware') ).to.not.be.ok;
        manager['set:middleware'](MOCK_MIDDLEWARE);
        expect( manager.$middleware.get('Middleware').type ).to.equal( MOCK_MIDDLEWARE['Middleware'] );
    });
    
    it("should set controllers", () => {
        var manager = new DelegatesManager(MOCK_SANDBOX);
        
        expect( manager.$controllers.get('Controller') ).to.not.be.ok;
        manager['set:controllers'](MOCK_CONTROLLERS);
        expect( manager.$controllers.get('Controller').type ).to.equal( MOCK_CONTROLLERS['Controller'] );
    });
    
    it("should be ready when both middleware and controllers have been set", () => {
        var manager = new DelegatesManager(MOCK_SANDBOX);
        
        manager
            ['set:middleware'](MOCK_MIDDLEWARE)
            ['set:controllers'](MOCK_CONTROLLERS)
            ;
        return manager.ready.then(() => {
            expect( manager.$middleware.get('Middleware') ).to.be.ok;
            expect( manager.$controllers.get('Controller') ).to.be.ok;
        });
    });
    
    it("should be stable when delegates have an instance", () => {
        var manager = new DelegatesManager(MOCK_SANDBOX);
        
        manager
            ['set:middleware'](MOCK_MIDDLEWARE)
            ['set:controllers'](MOCK_CONTROLLERS)
            ;
        return manager.stable.then(() => {
            expect( manager.$instances.get('Middleware').instance ).to.be.an.instanceOf( MOCK_MIDDLEWARE['Middleware'] );
            expect( manager.$instances.get('Controller').instance ).to.be.an.instanceOf( MOCK_CONTROLLERS['Controller'] );
        });
    });
    
    it("should inject a sandbox into middleware", () => {
        var manager = new DelegatesManager(MOCK_SANDBOX);
        
        manager
            ['set:middleware'](MOCK_MIDDLEWARE)
            ['set:controllers']({})
            ;
        return manager.stable.then(() => {
            expect( manager.$instances.get('Middleware').instance.$ ).to.equal(MOCK_SANDBOX);
        });
    });
    
    it("should inject a sandbox into controllers", () => {
        var manager = new DelegatesManager(MOCK_SANDBOX);
        
        manager
            ['set:middleware']({})
            ['set:controllers'](MOCK_CONTROLLERS)
            ;
        return manager.stable.then(() => {
            expect( manager.$instances.get('Controller').instance.$ ).to.equal(MOCK_SANDBOX);
        });
    });
    
});
