
/**
 * Name: Motorman
 * Usage:
 *  * var motorman = new Motorman({ router: app, sandbox: new class Sandbox {} });
 *  * motorman
 *  *   .define('routes', routes)
 *  *   .define('policies', policies)
 *  *   .define('middleware', middleware)
 *  *   .define('controllers', controllers)
 *  *   ;
 *  *
 * Note:
 *  * Maybe `ROUTER_METHOD_MAP` should be configured so that Motorman can be employed on the Front-End as well.
 *  * Seems like there is a common pattern to Motorman, DelegatesManager and DelegationsManager. Each has an abstract interface of at least:
 *      * get a() {}
 *      * get b() {}
 *      * get instances() {}
 *      * this.x = new Deferred();
 *      * this.ready
 *      * this.stable
 *      * bootstrap()
 *      * handleItem()
 *  *
 * TODO: 
 *  * Break classes/modules out into own files
 *  * Write tests
 *  * Publish as NPM Module
 */
var { ROUTER_METHOD_MAP, CONTROLLER_METHOD_MAP } = require('./maps');
const Dictionary = Map;

var channels = {
    // Delegations
    ['ROUTES:ESTABLISHED']: 'motorman://established/routes',
    ['POLICIES:ESTABLISHED']: 'motorman://established/policies',
    ['DELEGATIONS:ESTABLISHED']: 'motorman://established/delegations',
    ['DELEGATIONS:READY']: 'motorman://prepared/delegations',
    ['DELEGATIONS:STABLE']: 'motorman://stabilized/delegations',
    // Delegates
    ['MIDDLEWARE:ESTABLISHED']: 'motorman://established/middleware',
    ['CONTROLLERS:ESTABLISHED']: 'motorman://established/controllers',
    ['DELEGATES:ESTABLISHED']: 'motorman://established/delegates',
    ['DELEGATES:READY']: 'motorman://prepared/delegates',
    ['DELEGATES:STABLE']: 'motorman://stabilized/delegates',
    // Motorman
    ['READY']: 'motorman://prepared',
    ['STABLE']: 'motorman://stabilized',
};

class EventHub {
    
    constructor() {
        this.channels = { };
        return this;
    }
    
    publish() {}
    subscribe() {}
    unsubscribe() {}
    
}

var Deferred = new (function Deferred() {
    var _this = this;  // private context
    var _resolve = null, _reject = null;
    
    function exe(resolve, reject) {
        this.resolve = resolve;
        this.reject = reject;
    }
    
    class Deferred {
        
        constructor() {
            var promise = new Promise( exe.bind(this) );
            this.promise = promise;
            return this;
        }
        
        resolve(data) {
            _this.resolve(data);
            return this.promise;
        }
        reject(data) {
            _this.reject(data);
            return this.promise;
        }
        
    }
    
    // export precepts
    this.resolve = _resolve;
    this.reject = _reject
    
    return Deferred;
})();

class Delegate {
    
    constructor(options = { name: '', type: undefined, instance: undefined }) {
        var { name, type, instance } = options;
        
        this.name = name;
        this.type = type;
        this.instance = instance;
        
        return this;
    }
    
}


const DEPENDENCIES = {
    channels,
    Superclass: EventHub,
};


var DelegatesManager = new (function DelegatesManager({ Superclass, channels }) {
    var _this = this;  // private context
    var _middleware = { }
      , _controllers = { }
      , _instances = { }
      ;
    var _dMiddleware = new Deferred()
      , _dControllers = new Deferred()
      , _dInstances = new Deferred()
      ;
    var _pMiddleware = _dMiddleware.promise
      , _pControllers = _dControllers.promise
      , _pInstances = _dInstances.promise
      ;
    
    class DelegatesManager extends Superclass {
        
        get middleware() { return Array.from( this.$middleware.values() ); }
        set middleware(value) { this.$middleware.clear(); value.forEach( (m) => this.$middleware.set(m.name, m) ); }
        
        get controllers() { return Array.from( this.$controllers.values() ); }
        set controllers(value) { this.$controllers.clear(); value.forEach( (c) => this.$controllers.set(c.name, c) ); }
        
        get instances() { return Array.from( this.$instances.values() ); }
        set instances(value) { this.$instances.clear(); value.forEach( (d) => this.$instances.set(d.name, d) ); }
        
        constructor(sandbox) {
            super();
            var $middleware = new Dictionary()
              , $controllers = new Dictionary()
              , $instances = new Dictionary()
              ;
            var pReady = Promise.all([ _this.pInstances, _this.pControllers ]).then( ([ middleware, controllers ]) => ({ middleware, controllers }) )
              , pStable = Promise.all([ _this.pReady, _this.pInstances ]).then( ([ ready, instances ]) => ({ instances }) )
              ;
            
            this.channels = channels;  // TODO: use injection
            this.sandbox = sandbox;
            this.$middleware = $middleware;
            this.$controllers = $controllers;
            this.$instances = $instances;
            this.ready = pReady;
            this.stable = pStable;
            
            return this.init();
        }
        init() {
            // TODO: add event-hooks after require('@motorman/utilities');
            this.ready
                .then( ([ m, c ]) => this.load() )
                ;
            this.stable
                .then( ([ m, c, d ]) => {} )
                ;
            return this;
        }
        
        ['set:middleware'](definitions) {
            var { $middleware } = this, definitions = { ...definitions }, collection = [ ];
            
            for (let name in definitions) collection.push( new Delegate({ name, type: definitions[name], instance: undefined }) );
            this.middleware = collection;
            _this.dMiddleware.resolve($middleware);
            
            return this;
        }
        ['set:controllers'](definitions) {
            var { $controllers } = this, definitions = { ...definitions }, collection = [ ];
            
            for (let name in definitions) collection.push( new Delegate({ name, type: definitions[name], instance: undefined }) );
            this.controllers = collection;
            _this.dControllers.resolve($controllers);
            
            return this;
        }
        
        load() {
            var { $middleware, $controllers, $instances } = this;
            for (let delegate of $middleware) this.instantiate(delegate);
            for (let delegate of $controllers) this.instantiate(delegate);
            _this.dInstances.resolve($instances);
        }
        instantiate(delegate) {
            var { sandbox } = this, { name, type: Class, instance: existing } = delegate, instance = new Class(sandbox);
            Delegate.call(delegate, { instance });  // update `Delegate {...}` as `Delegate { ..., instance: Class {...} }`
            this.$instances.set(name, delegate);
        }
        
    }
    
    // export precepts
    this.middleware = _middleware;
    this.controllers = _controllers;
    this.instances = _instances;
    this.dMiddleware = _dMiddleware;
    this.dControllers = _dControllers;
    this.dInstances = _dInstances;
    this.pMiddleware = _pMiddleware;
    this.pControllers = _pControllers;
    this.pInstances = _pInstances;
    
    return DelegatesManager;
})(DEPENDENCIES);

var DelegationsManager = new (function DelegationsManager({ Superclass, channels }) {
    var _this = this;  // private context
    var _routes = [ ]
      , _policies = [ ]
      , _instances = [ ]
      ;
      ;
    var _dRoutes = new Deferred()
      , _dPolicies = new Deferred()
      , _dInstances = new Deferred()
      ;
    var _pRoutes = _dRoutes.promise
      , _pPolicies = _dPolicies.promise
      , _pInstances = _dInstances.promise
      ;
    
    function keyOf(route) {
        var { uri, method } = route, key = `${method} ${uri}`;
        return key;
    }
    
    function getDelegateInstances($store, names) {
        var names = names.reduce( (array, n) => array.concat(n), [] )  // ensure no multidimentionality (flatten)
          , names = names.filter( (n) => !!n )  // ensure !!~names.indexOf(undefined)
          , delegates = names.map( (name) => $store.get(name) )
          , delegates = delegates.filter( (d) => !!d )  // ensure !!~delegates.indexOf(undefined)
          , instances = delegates.map( (delegate) => delegate.instance )
          ;
        return instances;
    }
    
    function getHandlers(instances) {
        var handlers = instances.map( (m) => m['execute'].bind(m) );
        return handlers;
    }
    
    class DelegationsManager extends Superclass {
        
        get routes() { return Array.from( this.$routes.values() ); }
        set routes(value) { this.$routes.clear(); value.forEach( (r) => this.$routes.set(keyOf(r), r) ); }
        
        get policies() { return Array.from( this.$policies.values() ); }
        set policies(value) { this.$policies.clear(); value.forEach( (p) => this.$policies.set(keyOf(p), p) ); }
        
        get instances() { return Array.from( this.$instances.values() ); }
        set instances(value) { this.$instances.clear(); value.forEach( (p) => this.$instances.set(keyOf(p), p) ); }
        
        constructor(delegates) {
            super();
            var $routes = new Dictionary()
              , $policies = new Dictionary()
              , $instances = new Dictionary()
              ;
            var pReady = Promise.all([ _this.pRoutes, _this.pPolicies, delegates.ready ]).then( ([ routes, policies ]) => ({ routes, policies }) )
              , pStable = Promise.all([ _this.pReady, _this.pInstances ]).then( ([ ready, instances ]) => ({ instances }) )
              ;
            
            this.channels = channels;  // TODO: use injection
            this.delegates = delegates;
            this.$routes = $routes;
            this.$policies = $policies;
            this.$instances = $instances;
            this.ready = pReady;
            this.stable = pStable;
            
            return this.init();
        }
        init() {
            // TODO: add event-hooks after require('@motorman/utilities');
            this.ready
                .then( ([ m, c ]) => this.generate() )
                ;
            this.stable
                .then( ([ m, c, d ]) => {} )
                ;
            return this;
        }
        
        ['set:routes'](routes) {
            this.routes = routes;
            _this.dRoutes.resolve(routes);
            return this;
        }
        ['set:policies'](policies) {
            this.policies = policies;
            _this.dPolicies.resolve(policies);
            return this;
        }
        
        generate() {
            var { routes } = this;
            var instances = routes.map( (r) => this.map(r) );
            
            this.instances = instances;
            _this.dInstances.resolve(instances);
            
            return this;
        }
        map(route) {
            var { $policies, delegates } = this;
            var { uri, method, controller, action, policies } = route;
            
            // begin @ controller-action
            var key = keyOf(route), policy = $policies.get(key);
            var endpoint = controller
              , delegate = delegates.$instances.get(endpoint)
              , instance = delegate.instance
              , method = instance[action].bind(instance)  // last hit handler
              ;  // end @ controller-action
            
            // begin @ [specific] route-matching middleware
            var pipeline = [].concat(policy.policies, policies)
              , infraware = getDelegateInstances(delegates.$instances, pipeline)  // last hit middleware
              ;  // end @ specific middleware handlers
            
            // begin @ [generic] catch-all middleware
            var allMethodsKey =     keyOf({ method: '*', uri }),    allURIsKey =    keyOf({ method, uri: '*' }),    allKey =    keyOf({ method: '*', uri: '*' })
              , absentMethodsKey =  keyOf({ method: '', uri }),     absentURIsKey = keyOf({ method, uri: '' }),     absentKey = keyOf({ method: '', uri: '' })
              , keys = [ allMethodsKey, allURIsKey, allKey, absentMethodsKey, absentURIsKey, absentKey ]
              ;  // end @ keys for policies { method: x, uri: y } e.g: { method: '*', uri: '*' } (run on all)
            var pipeline = keys.map( (key) => $policies.get(key) )  // e.g: ['SomePolicy', ['SomePolicy']. undefined]
              , supraware = getDelegateInstances(delegates.$instances, pipeline)  // first hit middleware
              ;  // end @ generic middleware handlers
            
            var middleware = getHandlers([ ...supraware, ...infraware ]), handlers = [ ...middleware ];  // aggregate supra (1st) & infra (2nd)
            var delegation = { uri, method, controller, action, policies, handlers };
            
            handlers.push(method);  // push controller method to end of handlers pipeline (aggregate final handler in pipeline)
            handlers.forEach( (handler) => !!handler.init && handler.init({ route }) );
            
            return delegation;
        }
        
    }
    
    // export precepts
    this.routes = _routes;
    this.policies = _policies;
    this.instances = _instances;
    this.dRoutes = _dRoutes;
    this.dPolicies = _dPolicies;
    this.dInstances = _dInstances;
    this.pRoutes = _pRoutes;
    this.pPolicies = _pPolicies;
    this.pInstances = _pInstances;
    
    return DelegationsManager;
})(DEPENDENCIES);

var Motorman = new (function Motorman({ Superclass, channels }) {
    var _this = this;  // private context
    var _dBootstrap = new Deferred()
      , _pBootstrap = _dBootstrap.promise
      ;
    
    class Motorman extends Superclass {
        
        get routes() { return this.delegations.routes; }
        get policies() { return this.delegations.policies; }
        get docket() { return this.delegations.instances; }
        
        get middleware() { return this.delegates.middleware; }
        get controllers() { return this.delegates.controllers; }
        get modules() { return this.delegates.instances; }
        
        constructor({ router, sandbox }) {
            super();
            var delegates = new DelegatesManager(sandbox)
              , delegations = new DelegationsManager(delegates)
              , pReady = Promise.all([ delegates.ready, delegations.ready ]).then( () => ({ ready: true }) )  // (pending)
              , pStable = Promise.all([ delegates.stable, delegations.stable, _this.pBootstrap ]).then( () => ({ stable: true }) )  // (pending)
              ;
            
            this.channels = channels;  // TODO: use injection
            this.router = router;
            this.sandbox = sandbox;
            this.delegates = delegates;
            this.delegations = delegations;
            this.ready = pReady;
            this.stable = pStable;
            
            return this.init();
        }
        init() {
            // TODO: add event-hooks after require('@motorman/utilities');
            this.ready
                .then( () => this.bootstrap(delegations.instances) )
                .then( (data) => this.publish(this.channels['READY'], data) )
                ;
            this.stable
                .then( ([ m, c, d ]) => {} )
                .then( (data) => this.publish(this.channels['STABLE'], data) )
                ;
            return this;
        }
        
        define(type, definitions) {
            var { delegations, delegates, delegations, delegates } = this;
            var define = {
                'routes': delegations['set:routes'].bind(delegations),
                'policies': delegations['set:policies'].bind(delegations),
                'middleware': delegates['set:middleware'].bind(delegates),
                'controllers': delegates['set:controllers'].bind(delegates),
            }[ type ];
            
            define(definitions);
            
            return this;
        }
        
        bootstrap(delegations) {
            delegations.forEach( (d, i, a) => this.mount(d, i, a) );
            _this.dBootstrap.resolve(this);
            return this;
        }
        mount(delegation) {  // mount delegations (middleware + controller-action) pipeline to router
            var { router } = this;
            var { uri, method, handlers } = delegation;
            var type = ROUTER_METHOD_MAP[method];  // .use(), .all(), .get(), .post(), .put(), .delete()
            
            router[type].call(router, uri, handlers);
            return this;
        }
        
    }
    
    // export precepts
    this.dBootstrap = _dBootstrap;
    this.pBootstrap = _pBootstrap;
    
    return Motorman;
})(DEPENDENCIES);

module.exports = Motorman;