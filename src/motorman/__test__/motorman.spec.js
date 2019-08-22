
var chai = require('chai'), { expect, assert, use } = chai;
var mocks = require('./mocks');
// var chaiAsPromised = require("chai-as-promised");  // https://www.npmjs.com/package/chai-as-promised
var { Motorman, DelegatesManager, DelegationsManager } = require('../');
var { utilities } = require('../utilities');

var { MockRouter, MockSandbox, MockDelegate, MockMiddleware, MockController, } = mocks;
var { MOCK_ROUTER, MOCK_SANDBOX, MOCK_OPTIONS, MOCK_CONTROLLERS, MOCK_MIDDLEWARE, MOCK_POLICIES, MOCK_ROUTES, } = mocks;
var { keyOf } = utilities;

// use(chaiAsPromised);

describe("Motorman", () => {
    
    describe("Public Interface", () => {
        
        it("should have public properties & methods", () => {
            var motorman = new Motorman(MOCK_OPTIONS);
            
            assert.isObject(motorman.channels);
            assert.isArray(motorman.routes);
            assert.isArray(motorman.policies);
            assert.isArray(motorman.docket);
            assert.isArray(motorman.middleware);
            assert.isArray(motorman.controllers);
            assert.isArray(motorman.modules);
            assert.isFunction(motorman.define);
            expect(motorman.delegates).to.be.an.instanceOf(DelegatesManager);
            expect(motorman.delegations).to.be.an.instanceOf(DelegationsManager);
            expect(motorman.ready).to.be.an.instanceOf(Promise);
            expect(motorman.stable).to.be.an.instanceOf(Promise);
        });
        
        it("should have channels", () => {
            var motorman = new Motorman(MOCK_OPTIONS);
            
            expect(motorman.channels['READY']).to.be.ok;
            // todo: more
        });
        
    });
    
    
    describe("Usage", () => {
        
        it("should produce delegate instances from middleware and controllers", () => {
            var motorman = new Motorman(MOCK_OPTIONS);
            
            motorman
                .define('routes', MOCK_ROUTES)
                .define('policies', MOCK_POLICIES)
                .define('middleware', MOCK_MIDDLEWARE)
                .define('controllers', MOCK_CONTROLLERS)
                ;
            return motorman.ready.then(() => {
                var { delegates } = motorman, { $instances, instances } = delegates;
                var mKey = 'Middleware', mExists = $instances.has(mKey);
                var cKey = 'Middleware', cExists = $instances.has(cKey);
                
                expect(mExists).to.equal(true);
                expect(cExists).to.equal(true);
                expect(instances.length).to.equal(2);
            });
        });
        
        it("should produce route-policy delegation mappings", () => {
            var motorman = new Motorman(MOCK_OPTIONS);
            
            motorman
                .define('routes', MOCK_ROUTES)
                .define('policies', MOCK_POLICIES)
                .define('middleware', MOCK_MIDDLEWARE)
                .define('controllers', MOCK_CONTROLLERS)
                ;
            return motorman.ready.then(() => {
                var { delegations } = motorman, { $instances, instances } = delegations;
                var route = MOCK_ROUTES[0], key = keyOf(route), exists = $instances.has(key);
                expect(exists).to.equal(true);
                expect(instances.length).to.equal(1);
            });
        });
        
    });
    
    describe("Delegates Manager", () => {
        
        xit("should be fully tested", () => {});
        
    });
    
    describe("Delegations Manager", () => {
        
        xit("should be fully tested", () => {});
        
    });
    
});
