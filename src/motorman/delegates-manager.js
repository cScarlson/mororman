
var { sandbox } = require('./sandbox');

var DelegatesManager = new (function DelegatesManager($) {
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
            var pReady = Promise.all([ _this.pMiddleware, _this.pControllers ]).then( ([ m, c ]) => ({ middleware: m, controllers: c }) )
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
                .then( () => this.load() )
                ;
            this.stable
                .then( () => {} )
                ;
            return this;
        }
        
        ['set:middleware'](definitions) {
            var { $middleware } = this, definitions = { ...definitions }, collection = [ ];
            
            for (let name in definitions) collection.push( new Delegate({ name, type: definitions[name], instance: undefined }) );
            this.middleware = collection;
            this.instances = collection;
            _this.dMiddleware.resolve($middleware);
            
            return this;
        }
        ['set:controllers'](definitions) {
            var { $controllers } = this, definitions = { ...definitions }, collection = [ ];
            
            for (let name in definitions) collection.push( new Delegate({ name, type: definitions[name], instance: undefined }) );
            this.controllers = collection;
            this.instances = collection;
            _this.dControllers.resolve($controllers);
            
            return this;
        }
        
        load() {
            var { $middleware, $controllers, $instances } = this;
            for (let [ name, delegate ] of $middleware) this.instantiate(delegate, name, $middleware);
            for (let [ name, delegate ] of $controllers) this.instantiate(delegate, name, $controllers);
            _this.dInstances.resolve($instances);
        }
        instantiate(delegate, name, $map) {
            var { sandbox } = this, { name, type: Class, instance: existing } = delegate, instance = new Class(sandbox);
            var delegate = new Delegate({ ...delegate, instance });  // update `Delegate {...}` as `Delegate { ..., instance: Class {...} }`
            this.$instances.set(name, delegate);
            $map.set(name, delegate);
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
})(sandbox);

module.exports = { DelegatesManager };