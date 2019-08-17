
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
            expect(mm.publish).to.be.an.instanceOf(Function);
            expect(mm.subscribe).to.be.an.instanceOf(Function);
            expect(mm.unsubscribe).to.be.an.instanceOf(Function);
        });
        
    });
    
    
    describe("Public encapsulation", () => {
        
        it("should have (these) public members", () => {
            assert.isArray(mm.routes);
            assert.isArray(mm.policies);
            assert.isArray(mm.docket);
            // assert.isObject(mm.middleware);
            // assert.isObject(mm.controllers);
            assert.isArray(mm.modules);
            assert.isFunction(mm.define);
        });
        
    });
    
    
    describe("Route configurations", () => {
        
        it("should set route definitions", () => {
            mm.define('routes', MOCK_ROUTES);
            expect(mm.routes.length).to.equal(1);
        });
        
    });
    
    
    describe("Policy configurations", () => {
        
        it("should set policy definitions", () => {
            mm.define('policies', MOCK_POLICIES);
            expect(mm.policies.length).to.equal(1);
        });
        
    });
    
    
    describe("Middleware Delegates", () => {
        
        it("should set policy middleware delegates", () => {
            mm.define('middleware', MOCK_MIDDLEWARE);
            expect(mm.middleware['Middleware'] ).to.be.ok;
        });
        
    });
    
    
    describe("Controller Delegates", () => {
        
        it("should set route controller delegates", () => {
            mm.define('controllers', MOCK_CONTROLLERS);
            expect(mm.controllers['Controller'] ).to.be.ok;
        });
        
    });
    
    
    describe("Bootstrap", () => {
        var motorman = new Motorman({ router, sandbox });
        // var motorman = mm;  // <-- why won't this work?
        motorman
            .define('routes', MOCK_ROUTES)
            .define('policies', MOCK_POLICIES)
            .define('middleware', MOCK_MIDDLEWARE)
            .define('controllers', MOCK_CONTROLLERS)
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
