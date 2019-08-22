
const Dictionary = Map;

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

class Utilities {  // this should exist in its own package
    
    constructor() {}
    
    keyOf(route) {
        var { uri, method } = route, key = `${method} ${uri}`;
        return key;
    }
    
}

const utilities = new Utilities();

module.exports = {
    Utilities,
    Dictionary,
    EventHub,
    Deferred,
    utilities,
};
