
var { expect, assert } = require('chai');
var { Motorman } = require('./');


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

var router = new MockRouter()
  , sandbox = new MockSandbox()
  ;
var MOCK_ROUTES = [
    { uri: '/namespace', method: 'get', controller: 'Controller', action: 'find' },
];
var MOCK_POLICIES = [
    { uri: '/namespace', method: 'get', policies: 'Middleware' },
];
var MOCK_MIDDLEWARE = { 'Middleware': MockDelegate };
var MOCK_CONTROLLERS = { 'Controller': MockDelegate };


var mm = new Motorman({ router, sandbox });  // <-- should this be breaking tests when instantiated here?

describe("Motorman Interface", () => {
    // var mm = new Motorman({ router, sandbox });  // <-- should this be breaking tests when instantiated here?
    
    describe("Wish List", () => {
        
        xit("should have (these) public members", () => {
            expect(mm.setRoute).to.be.an.instanceOf(Promise);
            expect(mm.setPolicy).to.be.an.instanceOf(Promise);
            expect(mm.setMiddlewareDelegate).to.be.an.instanceOf(Promise);
            expect(mm.setControllerDelegate).to.be.an.instanceOf(Promise);
            
            expect(mm.publish).to.be.an.instanceOf(Promise);
            expect(mm.subscribe).to.be.an.instanceOf(Promise);
            expect(mm.unsubscribe).to.be.an.instanceOf(Promise);
            
            expect(mm.pRoutes).to.be.an.instanceOf(Promise);
            expect(mm.pPolicies).to.be.an.instanceOf(Promise);
            expect(mm.pMiddleware).to.be.an.instanceOf(Promise);
            expect(mm.pDelegates).to.be.an.instanceOf(Promise);
            expect(mm.pDelegations).to.be.an.instanceOf(Promise);
            expect(mm.pBootstrap).to.be.an.instanceOf(Promise);
        });
        
    });
    
    
    describe("Public encapsulation", () => {
        
        it("should have (these) public members", () => {
            assert.isArray(mm.routes);
            assert.isArray(mm.policies);
            assert.isArray(mm.delegations);
            assert.isObject(mm.middleware);
            assert.isObject(mm.controllers);
            assert.isFunction(mm.setRoutes);
            assert.isFunction(mm.setPolicies);
            assert.isFunction(mm.setMiddleware);
            assert.isFunction(mm.setControllers);
            assert.isFunction(mm.bootstrap);
        });
        
    });
    
    
    describe("Route configurations", () => {
        
        it("should set route definitions", () => {
            mm.setRoutes(MOCK_ROUTES);
            expect(mm.routes.length).to.equal(1);
        });
        
    });
    
    
    describe("Policy configurations", () => {
        
        it("should set policy definitions", () => {
            mm.setPolicies(MOCK_POLICIES);
            expect(mm.policies.length).to.equal(1);
        });
        
    });
    
    
    describe("Middleware Delegates", () => {
        
        it("should set policy middleware delegates", () => {
            mm.setMiddleware(MOCK_MIDDLEWARE);
            expect(mm.middleware['Middleware'] ).to.be.ok;
        });
        
    });
    
    
    describe("Controller Delegates", () => {
        
        it("should set route controller delegates", () => {
            mm.setControllers(MOCK_CONTROLLERS);
            expect(mm.controllers['Controller'] ).to.be.ok;
        });
        
    });
    
    
    describe("Bootstrap", () => {
        var motorman = new Motorman({ router, sandbox });
        // var motorman = mm;  // <-- why won't this work?
        motorman
            .setRoutes(MOCK_ROUTES)
            .setPolicies(MOCK_POLICIES)
            .setMiddleware(MOCK_MIDDLEWARE)
            .setControllers(MOCK_CONTROLLERS)
            .bootstrap()
            ;
        
        it("should instantiate middleware", () => {
            var { name, instance: middleware } = motorman.$middleware.get('Middleware');
            expect(name).to.equal('Middleware');
            expect(middleware).to.be.an.instanceOf(MockDelegate);
        });
        
        
        it("should instantiate controllers", () => {
            var { name, instance: controller } = motorman.$controllers.get('Controller');
            expect(name).to.equal('Controller');
            expect(controller).to.be.an.instanceOf(MockDelegate);
        });
        
        
        it("should instantiate delegates (middleware + controllers)", () => {
            expect( motorman.$delegates.get('Middleware').instance ).to.be.an.instanceOf(MockDelegate);
            expect( motorman.$delegates.get('Controller').instance ).to.be.an.instanceOf(MockDelegate);
        });
        
        
        it("should inject a Sandbox instance", () => {
            expect( motorman.$middleware.get('Middleware').instance.$ ).to.be.an.instanceOf(MockSandbox);
            expect( motorman.$controllers.get('Controller').instance.$ ).to.be.an.instanceOf(MockSandbox);
        });
        
        
        it("should produce route-policy delegation mappings", () => {
            expect(motorman.delegations.length).to.equal(1);
        });
        
        
        it("should have delegation-maps with handlers and policies", () => {
            var delegation = motorman.delegations[0];
            expect(delegation.uri).to.equal('/namespace');
            expect(delegation.method).to.equal('get');
            expect(delegation.handlers.length).to.equal(2);
        });
        
    });
    
});
