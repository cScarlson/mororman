
var { sandbox } = require('./sandbox');

var DelegationsManager = new (function DelegationsManager($) {
    var _this = this;  // private context
    var {
        Superclass,
        Deferred,
        Dictionary,
        Delegate,
        channels,
        utils,
    } = $;
    var keyOf = utils.keyOf.bind(utils);
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
            var pReady = Promise.all([ _this.pRoutes, _this.pPolicies, delegates.stable ]).then( ([ routes, policies ]) => ({ routes, policies }) )
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
                .then( () => this.generate() )
                ;
            this.stable
                .then( () => {} )
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
            var pipeline = [ controller ]
              , ware = getDelegateInstances(delegates.$instances, pipeline)
              , [ instance ] = ware
              , endpoint = instance[action].bind(instance)  // last hit handler
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
            
            handlers.push(endpoint);  // push controller method to end of handlers pipeline (aggregate final handler in pipeline)
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
})(sandbox);

module.exports = { DelegationsManager };