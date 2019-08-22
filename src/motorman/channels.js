
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

module.exports = { channels };
