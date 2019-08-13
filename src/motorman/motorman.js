
/**
 * Name: Motorman
 * Usage:
 *  * var motorman = new Motorman({ router: app, sandbox: new class Sandbox {} });
 *  * motorman
 *  *   .setRoutes(routes)
 *  *   .setPolicies(policies)
 *  *   .setMiddleware(middleware)
 *  *   .setControllers(controllers)
 *  *   .bootstrap()
 *  *   ;
 *  *
 * TODO: 
 *  * Write tests
 *  * Publish as NPM Module
 */
var { ROUTER_METHOD_MAP, CONTROLLER_METHOD_MAP } = require('./maps');

const Dictionary = Map;

class Command {
    
    constructor(context, action) {
        this.context = context;
        this.action = action;
        return this;
    }
    
    execute(...splat) {
        var { context, action } = this;
        return context[action].call(context, ...splat);
    }
    
}

class Delegate {
    
    constructor(options = { name: '', instance: undefined }) {
        var { name, instance } = options;
        
        this.name = name;
        this.instance = instance;
        
        return this;
    }
    
}

class Motorman {
    
    constructor({ router, sandbox }) {
        this.router = router;
        this.sandbox = sandbox;
        this.routes = [ ];
        this.policies = [ ];
        this.middleware = { };
        this.controllers = { };
        this.delegations = [ ];
        this.$middleware = new Dictionary();
        this.$controllers = new Dictionary();
        this.$delegates = new Dictionary();
        
        return this;
    }
    
    setRoutes(data) {
        this.routes = [ ...data ];
        return this;
    }
    
    setPolicies(definitions) {
        this.policies = [ ...this.policies, ...definitions ];
        return this;
    }
    
    setMiddleware(delegates) {
        this.middleware = { ...delegates };
        return this;
    }
    
    setControllers(delegates) {
        this.controllers = { ...delegates };
        return this;
    }
    
    bootstrap() {
        var { policies, routes, middleware, controllers, $middleware, $controllers } = this;
        
        this
          .initDelgates(middleware, $middleware)  // create & store instances
          .initDelgates(controllers, $controllers)  // create & store instances
          .mapDelegations(policies, routes)  // create refined version of routes from policy declarations (policy-mapped routes)
          .mapDelgates(this.delegations)  // map & add handler-pipeline to delegations (policy-mapped routes)
          .attach(this.delegations)  // attach to router (router.[use|all|get|post|put|delete])
          ;
        return this;
    }
    
    initDelgates(delegates, $store) {  // see this.initDelegate()
        var { sandbox: $ } = this;
        for (let name in delegates) this.initDelegate($, $store, delegates[name], name, delegates);
        return this;
    }
    initDelegate($, $store, Class, name) {  // create instance of a "delegate" (middleware-method or controller-action)
        var instance = new Class($), delegate = new Delegate({ name, instance });
        $store.set(name, delegate);
        this.$delegates.set(name, delegate);
        
        return this;
    }
    mapDelegations(policies, routes) {  // set "delegations" (policy-mapped route declarations)
        var delegations = [ ...routes ];  // Copy routes first (mapPolicy replaces nth route with mapped version)
        policies.forEach( (p) => this.mapPolicy(delegations, p) );
        this.delegations = delegations;
        
        return this;
    }
    mapPolicy(delegations, policy) {
        delegations.forEach( (r, i, a) => this.createPolicyMapping(policy, r, i, a) );
        return this;
        
    }
    createPolicyMapping(policy, route, i, routes) {  // replaces a route-declaration object with a "delegation" from policies
        var { uri = '*', method = '*', policies: pPolicies = [] } = policy;
        var { uri: rUri, method: rMethod, policies: rPolicies = [] } = route;
        var pPolicies = [].concat(pPolicies), rPolicies = [].concat(rPolicies), policies = pPolicies.concat(rPolicies)
        var uris = { '': true, '*': true, [rUri]: true }, methods = { '': true, '*': true, [rMethod]: true };
        var delegation = { ...route, policies };
        var bothMatch = !!(uris[uri] && methods[method])
          , onlyMatch = !!( (!method && uris[uri]) || (!uri && methods[method]) )
          ;
        if (bothMatch) routes[i] = delegation;  // uri is ''|* (all) or same (matches) AND method is ''|* (all) or same (matches)
        if (onlyMatch) routes[i] = delegation;  // no method provided while uris match OR no uri provided while methods match
    }
    
    mapDelgates(routes) {  // map middleware & controllers (roll up into handlers array of commands)
        var delegations = routes.map( (r, i, a) => this.mapDelgate(r, i, a) );
        this.delegations = delegations;
        return this;
    }
    mapDelgate(route) {  // take a delegation (policy-mapped route) & derive handler-commands pipeline from delegate (controller-action & middleware)
        var { controller: name, action, policies } = route, policies = [].concat(policies);
        var delegate = this.$delegates.get(name) || new Delegate(), controller = delegate.instance;
        var command = new Command(controller, action), handler = command.execute.bind(command);
        var delegates = this.getDelegates(policies), handlers = delegates.concat(handler);
        var delegation = { ...route, handlers };
        
        if (!controller) delegation = { ...route, handlers: delegates };
        if (controller && !controller[action]) throw new Error(`Controller Action Not Found: the Controller "${name}" has no Action ${action}`);
        return delegation;
    }
    getDelegates(names) {  // see this.mapDelegate()
        var delegates = names.map( (n, i, a) => this.getDelegate(n, i, a) );
        return delegates;
    }
    getDelegate(name) {  // see this.mapDelegate()
        var delegate = this.$delegates.get(name) || new Delegate(), instance = delegate.instance, action = 'execute';
        var command = new Command(instance, action), handler = command.execute.bind(command);
        
        if (!delegate.instance) throw new Error(`Delegate Not Found: the Delegate "${name}" has no instance`);
        if (!instance[action]) throw new Error(`Controller Action Not Found: the Delegate "${name}" has no Action ${action}`);
        return handler;
    }
    
    
    attach(routes) {
        routes.forEach( (r, i, a) => this.mount(r, i, a) );
        return this;
    }
    mount(route) {  // mount delegations (middleware + controller-action) pipeline to router
        var { router } = this;
        var { uri, method, handlers } = route;
        var type = ROUTER_METHOD_MAP[method];  // .use(), .all(), .get(), .post(), .put(), .delete()
        
        router[type].call(router, uri, handlers);
        return this;
    }
    
}

module.exports = Motorman;
