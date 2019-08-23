
var { Utilities, EventHub, Deferred, Dictionary, utilities } = require('./utilities');
var { channels } = require('./channels');
var { Delegate } = require('./Delegate');

const sandbox = {
    Superclass: EventHub,
    Deferred,
    Dictionary,
    utils: utilities,
    channels,
    Delegate,
};

module.exports = { sandbox };
