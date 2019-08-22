
class Delegate {
    
    constructor(options = { name: '', type: undefined, instance: undefined }) {
        var { name, type, instance } = options;
        
        this.name = name;
        this.type = type;
        this.instance = instance;
        
        return this;
    }
    
}

module.exports = { Delegate };