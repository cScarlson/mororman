
var ROUTER_METHOD_MAP = {
    // MIDDLEWARE (app.use())
    'POLICY': 'use',
    'policy': 'use',
    'POLICIES': 'use',
    'policies': 'use',
    
    // POLICY (app.all())
    '*': 'all',
    'ALL': 'all',
    'all': 'all',
    
    // METHOD (app[x]())
    'GET': 'get',
    'POST': 'post',
    'PUT': 'put',
    'PATCH': 'patch',
    'DELETE': 'delete',
    
    'get': 'get',
    'post': 'post',
    'put': 'put',
    'patch': 'patch',
    'delete': 'delete',
    
    // PARAMS
    'PARAM': 'param',
    'param': 'param',
    
    // OTHER
    '': 'all',
    'undefined': 'use',
};
var CONTROLLER_METHOD_MAP = {
    
};

var methods = { ROUTER_METHOD_MAP, CONTROLLER_METHOD_MAP };

module.exports = methods;
