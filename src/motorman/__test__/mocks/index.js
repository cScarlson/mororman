
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

module.exports = {
    MockRouter,
    MockSandbox,
    MockDelegate,
    MockMiddleware,
    MockController,
    MOCK_ROUTER,
    MOCK_SANDBOX,
    MOCK_OPTIONS,
    MOCK_CONTROLLERS,
    MOCK_MIDDLEWARE,
    MOCK_POLICIES,
    MOCK_ROUTES,
};
