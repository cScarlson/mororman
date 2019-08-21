
var chai = require('chai'), { expect, assert, use } = chai;
// var chaiAsPromised = require("chai-as-promised");  // https://www.npmjs.com/package/chai-as-promised
var { Motorman, DelegatesManager, DelegationsManager, utilities } = require('./');
var { keyOf } = utilities;

// use(chaiAsPromised);

class MockRouter {
    
    constructor(...splat) {
        return this;
    }
    router(root) {
        return new MockRouter(root);
    }
    use() {
        return this;
    }
    all() {
        return this;
    }
    get() {
        return this;
    }
    post() {
        return this;
    }
    put() {
        return this;
    }
    patch() {
        return this;
    }
    delete() {
        return this;
    }
    param() {
        return this;
    }
    subscribe() {
        return this;
    }
    unsubscribe() {
        return this;
    }
    notify() {
        return this;
    }
    
}
class MockSandbox {
    
    constructor(...splat) {
        return this;
    }
    
}
class MockDelegate {
    
    constructor($) {
        this.$ = $;
        return this;
    }
    
    find(req, res) {}
    execute(req, res, next) {}
    
}
class MockMiddleware extends MockDelegate {}
class MockController extends MockDelegate {}

var router = new MockRouter()
  , sandbox = new MockSandbox()
  ;
var OPTIONS = { router, sandbox };
var MOCK_ROUTES = [
    { uri: '/namespace', method: 'GET', controller: 'Controller', action: 'find' },
];
var MOCK_POLICIES = [
    { uri: '/namespace', method: 'GET', policies: 'Middleware' },
];
var MOCK_MIDDLEWARE = { 'Middleware': MockMiddleware };
var MOCK_CONTROLLERS = { 'Controller': MockController };


describe("Motorman", () => {
    
    describe("KeyOf", () => {
        
        it("should convert { method, uri } objects to '[method] [uri]' strings", () => {
            expect( keyOf({ method: 'GET', uri: '/tested' }) ).to.equal('GET /tested');
        });
        
    });
    
    describe("Public Interface", () => {
        
        it("should have public properties & methods", () => {
            var motorman = new Motorman(OPTIONS);
            
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
            var motorman = new Motorman(OPTIONS);
            
            expect(motorman.channels['READY']).to.be.ok;
            // todo: more
        });
        
    });
    
    
    describe("Usage", () => {
        
        it("should produce delegate instances from middleware and controllers", () => {
            var motorman = new Motorman(OPTIONS);
            
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
            var motorman = new Motorman(OPTIONS);
            
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
