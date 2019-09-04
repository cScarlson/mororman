
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
    
    function getMiddlewareKeys({ uri, method }) {
        var exactExact = keyOf({ uri, method })             // 0
          , exactAbsent = keyOf({ uri, method: '' })        // 1 \
          , exactAll = keyOf({ uri, method: '*' })          // 1 /
          , absentExact = keyOf({ uri: '', method })        // 2 \
          , allExact = keyOf({ uri: '*', method })          // 2 /
          , absentAbsent = keyOf({ uri: '', method: '' })   // 3 \
          , absentAll = keyOf({ uri: '', method: '*' })     // 3  \
          , allAbsent = keyOf({ uri: '*', method: '' })     // 3  /
          , allAll = keyOf({ uri: '*', method: '*' })       // 3 /
          ;  // TODO: don't forget about casing ({ uri: x, method: 'pOlIcY', ... })
        var precedence = [ allAll, allAbsent, absentAll, absentAbsent, allExact, absentExact, exactAll, exactAbsent, exactExact ].reverse();
        
        return precedence;
	}
	
    function normalizeRoute(route) {
        var { uri = '*', method = '*', controller, action = 'execute', policies } = route;
        var refined = normalizeRoutePolicies(route)
          , delegates = [].concat(refined)
          ;
        var route = { ...route, uri, method, action, delegates };  // don't lose anything from route.
        
        return route;
    }
    function normalizeRoutePolicies(route) {
		var { action = 'execute', policies = [] } = route;
        var route = { ...route, action, policies }  // action = [action] / 'execute'
          , policies = [].concat(policies)  // ensure array
          , policies = policies.map( (p) => normalizeRoutePolicy(route, p) )
          ;
        return policies;  // > Array [ { name: 'Name', method: "{{'fn'|action|'execute'}}" }, ... ]
    }
    /**
     * @options (order or precedence)
     *  *   ({ ctrl: [*],       action: [*] },       'Name.fn') >       { name: 'Name', method: 'fn' }
     *  *   ({ ctrl: undefined, action: 'action' },  'Name')    >       { name: 'Name', method: 'action' }
     *  *   ({ ctrl: undefined, action: undefined }, 'Name')    >       { name: 'Name', method: 'execute' }
     *  *   ({ ctrl: 'Ctrl',    action: undefined }, 'Name')    >       { name: 'Name', method: 'execute' }
     *  *   ({ ctrl: 'Ctrl',    action: 'action' },  'Name')    >       { name: 'Name', method: 'execute' }
     */
    function normalizeRoutePolicy({ controller: ctrl, action }, name) {
        var [ name, method = 'execute' ] = name.split('.');  // method = [fn] / 'execute'
        var action = { 'true': action, 'false': method }[ !!action ]; // action = [action] | [fn] / 'execute'
        var method = { 'true': method, 'false': action }[ !!ctrl ];  // method = [fn] / 'execute' | [action] / [fn] / 'execute'
        var delegate = { id: `${name}.${method}`, name, method };
        
        return delegate;  // > Object { name: 'Name', method: "{{'fn'|action|'execute'}}" }
    }
            
    function getDefinition($policies, pipeline, key, i, a) {
        if ( !$policies.has(key) ) return pipeline;  // must have policy
        var policy = $policies.get(key), policy = normalizeRoute(policy);  // use on policy to as definitions implement same interface
        var { delegates, controller, action } = policy;
        
        if (controller) delegates.push({ name: controller, method: action });  // that is, the handler (controller-action) for this policy
        return delegates.concat(pipeline);  // keep pipeline in front (see @order-of-precedence)
    }
    
    function attachDelegateInstance($store, assignment) {  // assignment:= { name: 'Name', method: '{{method}}' }
        var { name, method } = assignment;
        var delegate = $store.get(name), instance = delegate.instance, handler = instance && instance[method];
        var assignment = { ...assignment, delegate, instance, handler };
        // if (!instance) this.warnings.push( new Error(`...`) );
        // if (!handler) this.warnings.push( new Error(`...`) );
        return assignment;
    }
    
    function bindDelegateInstanceHandler(assignment) {
        var { instance, handler } = assignment;
        var action = handler.bind(instance);
        var assignment = { ...assignment, action };
        
        return assignment;
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
            var route = normalizeRoute(route);
            var { uri, method, controller, action, policies, delegates: pipeline } = route;
            var precedence = getMiddlewareKeys(route)
              , assignments = precedence.reduce( (...splat) => getDefinition($policies, ...splat), pipeline )
			  , assignments = assignments.map( attachDelegateInstance.bind(this, delegates.$instances) )  // get the already-initialized Delegates
			  , handlers = assignments.map( bindDelegateInstanceHandler.bind(this) )
              ;
            var delegation = { ...route, assignments, handlers };
            // assignments.forEach( ({ instance }) => !!instance.init && instance.init({ delegation }) );
            
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