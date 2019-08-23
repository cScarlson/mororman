
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
var { sandbox } = require('./sandbox');
var { DelegatesManager } = require('./delegates-manager');
var { DelegationsManager } = require('./delegations-manager');

var Motorman = new (function Motorman($) {
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
                .then( (data) => this.publish(this.channels['READY'], data) )
                .then( () => this.bootstrap(this.delegations.instances) )
                ;
            this.stable
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
})(sandbox);

module.exports = { Motorman };