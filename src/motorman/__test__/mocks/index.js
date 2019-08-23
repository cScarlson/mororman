
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
    
}
class MockMiddleware extends MockDelegate {
    execute(req, res, next) {}
}
class MockController extends MockDelegate {
    find(req, res) {}
    create(req, res) {}
    update(req, res) {}
    remove(req, res) {}
}
class MockDelegatesManager {
    constructor(MOCK_SANDBOX, middleware, controllers) {
        this.sandbox = MOCK_SANDBOX;
        this.$middleware = new Map();
        this.$controllers = new Map();
        this.$instances = new Map();
        this.ready = Promise.resolve(this.$instances);
        this.stable = Promise.resolve(this.$instances);
        
        for (let name in middleware) set.call(this, { name, type: middleware[name] }, '$middleware');
        for (let name in controllers) set.call(this, { name, type: controllers[name] }, '$controllers');
        
        function set({ type, name }, datum) {
            var Class = type, instance = new Class(this.sandbox), delegate = { name, type, instance };
            this[datum].set(name, delegate);
            this.$instances.set(name, delegate);
        }
        
    }
    ['set:middleware']() { return this; }
    ['set:controllers']() { return this; }
}
class MockDelegationsManager {
    constructor(MOCK_DELEGATES_MANAGER, routes, policies) {
        this.delegates = MOCK_DELEGATES_MANAGER;
        this.$routes = new Map();
        this.$policies = new Map();
        this.$instances = new Map();
        this.ready = Promise.resolve(this.$instances);
        this.stable = Promise.resolve(this.$instances);
        
        routes.forEach( (r) => set.call(this, r, '$routes') );
        policies.forEach( (p) => set.call(this, p, '$policies') );
        
        function set(def, datum) {
            this[datum].set(`${def.method} ${def.uri}`, def);
            this.$instances.set(`${def.method} ${def.uri}`, def);
        }
    }
    ['set:routes']() { return this; }
    ['set:policies']() { return this; }
}

var MOCK_ROUTER = new MockRouter()
  , MOCK_SANDBOX = new MockSandbox()
  ;
var MOCK_OPTIONS = { router: MOCK_ROUTER, sandbox: MOCK_SANDBOX };
var MOCK_MIDDLEWARE = { 'Middleware': MockMiddleware };
var MOCK_CONTROLLERS = { 'Controller': MockController };
var MOCK_ROUTES = [
    { uri: '/namespace', method: 'GET', controller: 'Controller', action: 'find' },
];
var MOCK_POLICIES = [
    { uri: '/namespace', method: 'GET', policies: 'Middleware' },
];
var MOCK_DELEGATES_MANAGER = new MockDelegatesManager(MOCK_SANDBOX, MOCK_MIDDLEWARE, MOCK_CONTROLLERS);
var MOCK_DELEGATIONS_MANAGER = new MockDelegationsManager(MOCK_DELEGATES_MANAGER, MOCK_ROUTES, MOCK_POLICIES);

module.exports = {
    MockRouter,
    MockSandbox,
    MockDelegate,
    MockMiddleware,
    MockController,
    MockDelegatesManager,
    MockDelegationsManager,
    MOCK_ROUTER,
    MOCK_SANDBOX,
    MOCK_OPTIONS,
    MOCK_CONTROLLERS,
    MOCK_MIDDLEWARE,
    MOCK_POLICIES,
    MOCK_ROUTES,
    MOCK_DELEGATES_MANAGER,
    MOCK_DELEGATIONS_MANAGER,
};
